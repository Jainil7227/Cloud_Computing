import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { 
  testS3Connection, 
  uploadChunkToS3, 
  getChunkFromS3, 
  deleteChunksFromS3 
} from '../services/s3Service.js';
import { 
  encryptChunk, 
  decryptChunk, 
  calculateChecksum 
} from '../services/encryptionService.js';
import { 
  splitBufferIntoChunks, 
  reassembleChunks 
} from '../services/chunkService.js';
import { 
  getAllFiles, 
  getFileById, 
  saveFileRecord, 
  removeFileRecord 
} from '../services/metadataService.js';

const router = express.Router();

// Multer memory storage (files up to 100MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
});

const DEFAULT_CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE_BYTES || '1048576', 10);

/**
 * GET /api/status - Cloud and S3 connection status
 */
router.get('/status', async (req, res) => {
  try {
    const s3Status = await testS3Connection();
    res.json({
      online: true,
      timestamp: new Date().toISOString(),
      cloud: {
        provider: 'Amazon Web Services (AWS)',
        service: 'Amazon S3 (Simple Storage Service)',
        region: process.env.AWS_REGION || 'ap-south-1',
        bucket: process.env.AWS_BUCKET_NAME || 'chunked-file-storage-jainil',
        encryption: 'AES-256-CBC (Client-Side/Application Level)',
        chunkSizeDefaultBytes: DEFAULT_CHUNK_SIZE,
        s3Connected: s3Status.success,
        s3Details: s3Status
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/files - List all stored files
 */
router.get('/files', (req, res) => {
  try {
    const files = getAllFiles();
    res.json({ files, count: files.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/upload - Divide file into chunks, encrypt each with AES-256, and upload to S3
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const fileId = uuidv4();
    const originalChecksum = calculateChecksum(buffer);

    // Dynamic chunk size override if user chooses in UI, else default (1MB)
    const chunkSize = req.body.chunkSize 
      ? parseInt(req.body.chunkSize, 10) 
      : DEFAULT_CHUNK_SIZE;

    console.log(`[Upload] File "${originalname}" (${size} bytes) - Slicing into ${chunkSize} byte chunks...`);

    // 1. Divide file into chunks / blocks
    const rawChunks = splitBufferIntoChunks(buffer, chunkSize);
    const chunkUploadResults = [];

    // 2. Encrypt each chunk and upload to S3
    for (const chunk of rawChunks) {
      const { encryptedBuffer, ivHex, authHash } = encryptChunk(chunk.buffer);
      const s3Key = `chunks/${fileId}/chunk_${chunk.index}.enc`;

      console.log(`[Upload] Uploading chunk #${chunk.index} to S3 Key: ${s3Key}`);

      await uploadChunkToS3({
        key: s3Key,
        buffer: encryptedBuffer,
        contentType: 'application/octet-stream'
      });

      chunkUploadResults.push({
        index: chunk.index,
        s3Key,
        originalSizeBytes: chunk.size,
        encryptedSizeBytes: encryptedBuffer.length,
        ivHex,
        authHash,
        uploadedAt: new Date().toISOString()
      });
    }

    // 3. Save file metadata
    const fileRecord = {
      fileId,
      originalName: originalname,
      mimeType: mimetype || 'application/octet-stream',
      totalSizeBytes: size,
      totalChunks: rawChunks.length,
      chunkSizeBytes: chunkSize,
      originalChecksum,
      encryptionAlgorithm: 'AES-256-CBC',
      s3Bucket: process.env.AWS_BUCKET_NAME,
      s3Region: process.env.AWS_REGION,
      uploadedAt: new Date().toISOString(),
      chunks: chunkUploadResults
    };

    saveFileRecord(fileRecord);

    console.log(`[Upload Complete] File ${fileId} stored successfully with ${rawChunks.length} chunks.`);

    res.status(201).json({
      message: 'File successfully divided into chunks, encrypted, and stored in Amazon S3',
      file: fileRecord
    });
  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/download/:fileId - Fetch chunks from S3, decrypt, reassemble and deliver
 */
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = getFileById(fileId);

    if (!file) {
      return res.status(404).json({ error: 'File record not found' });
    }

    console.log(`[Download] Reassembling file "${file.originalName}" (${file.totalChunks} chunks) from S3...`);

    // Sort chunks by index to guarantee correct reconstruction
    const sortedChunks = [...file.chunks].sort((a, b) => a.index - b.index);
    const decryptedBuffers = [];

    for (const chunkMeta of sortedChunks) {
      // 1. Download encrypted chunk from S3
      const encryptedBuffer = await getChunkFromS3(chunkMeta.s3Key);

      // 2. Decrypt chunk using its specific IV
      const decryptedBuffer = decryptChunk(encryptedBuffer, chunkMeta.ivHex);
      decryptedBuffers.push(decryptedBuffer);
    }

    // 3. Reassemble all chunks
    const reassembledBuffer = reassembleChunks(decryptedBuffers);

    // 4. Verify checksum integrity
    const reassembledChecksum = calculateChecksum(reassembledBuffer);
    if (reassembledChecksum !== file.originalChecksum) {
      console.error('[Integrity Error] Checksum mismatch during reassembly!');
      return res.status(500).json({ 
        error: 'Integrity check failed: Reassembled file checksum does not match original!' 
      });
    }

    console.log(`[Download Complete] File "${file.originalName}" verified and streaming to client.`);

    // 5. Send file with proper download headers
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', reassembledBuffer.length);
    res.setHeader('X-Total-Chunks', file.totalChunks.toString());
    res.setHeader('X-Checksum-SHA256', reassembledChecksum);

    res.send(reassembledBuffer);
  } catch (err) {
    console.error('[Download Error]', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/preview-chunk/:fileId/:chunkIndex - Inspect raw encrypted ciphertext from S3
 */
router.get('/preview-chunk/:fileId/:chunkIndex', async (req, res) => {
  try {
    const { fileId, chunkIndex } = req.params;
    const idx = parseInt(chunkIndex, 10);
    const file = getFileById(fileId);

    if (!file) return res.status(404).json({ error: 'File not found' });

    const chunkMeta = file.chunks.find(c => c.index === idx);
    if (!chunkMeta) return res.status(404).json({ error: 'Chunk not found' });

    // Download raw encrypted buffer directly from S3
    const encryptedBuffer = await getChunkFromS3(chunkMeta.s3Key);

    // Sample preview (first 128 bytes)
    const sampleLength = Math.min(128, encryptedBuffer.length);
    const sampleHex = encryptedBuffer.subarray(0, sampleLength).toString('hex');
    const sampleBase64 = encryptedBuffer.subarray(0, sampleLength).toString('base64');

    res.json({
      fileId,
      fileName: file.originalName,
      chunkIndex: idx,
      totalChunks: file.totalChunks,
      s3Key: chunkMeta.s3Key,
      s3Bucket: file.s3Bucket,
      encryptedSizeBytes: encryptedBuffer.length,
      originalSizeBytes: chunkMeta.originalSizeBytes,
      ivHex: chunkMeta.ivHex,
      authHash: chunkMeta.authHash,
      previewHex: sampleHex,
      previewBase64: sampleBase64
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/download-encrypted-chunk/:fileId/:chunkIndex - Download raw .enc chunk
 */
router.get('/download-encrypted-chunk/:fileId/:chunkIndex', async (req, res) => {
  try {
    const { fileId, chunkIndex } = req.params;
    const idx = parseInt(chunkIndex, 10);
    const file = getFileById(fileId);

    if (!file) return res.status(404).json({ error: 'File not found' });

    const chunkMeta = file.chunks.find(c => c.index === idx);
    if (!chunkMeta) return res.status(404).json({ error: 'Chunk not found' });

    const encryptedBuffer = await getChunkFromS3(chunkMeta.s3Key);

    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}.part${idx}.enc"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(encryptedBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/files/:fileId - Delete file and all its chunks from S3
 */
router.delete('/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = getFileById(fileId);

    if (!file) return res.status(404).json({ error: 'File not found' });

    const keys = file.chunks.map(c => c.s3Key);
    await deleteChunksFromS3(keys);
    removeFileRecord(fileId);

    console.log(`[Delete] Deleted ${keys.length} chunks from S3 for file ${fileId}`);
    res.json({ message: 'File and all cloud chunks deleted successfully', fileId });
  } catch (err) {
    console.error('[Delete Error]', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
