import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // AES block size is 16 bytes

// Ensure master key is exactly 32 bytes (256 bits)
function getMasterKey() {
  const envKey = process.env.ENCRYPTION_MASTER_KEY || 'cloud-computing-aes-256-encryption-key-sample';
  return crypto.createHash('sha256').update(envKey).digest(); // Guarantees exactly 32 bytes
}

/**
 * Encrypt a single chunk buffer using AES-256-CBC
 * @param {Buffer} chunkBuffer 
 * @returns {{ encryptedBuffer: Buffer, ivHex: string, authHash: string }}
 */
export function encryptChunk(chunkBuffer) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getMasterKey();
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(chunkBuffer), cipher.final()]);

  // Compute SHA-256 hash of plaintext chunk for integrity verification
  const authHash = crypto.createHash('sha256').update(chunkBuffer).digest('hex');

  return {
    encryptedBuffer: encrypted,
    ivHex: iv.toString('hex'),
    authHash
  };
}

/**
 * Decrypt an encrypted chunk buffer using AES-256-CBC
 * @param {Buffer} encryptedBuffer 
 * @param {string} ivHex 
 * @returns {Buffer} decryptedBuffer
 */
export function decryptChunk(encryptedBuffer, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const key = getMasterKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

  return decrypted;
}

/**
 * Calculate SHA-256 checksum of any buffer
 */
export function calculateChecksum(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
