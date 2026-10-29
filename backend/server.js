import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { testS3Connection } from './services/s3Service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Health check root
app.get('/', (req, res) => {
  res.json({
    project: 'Cloud Computing Mini Project',
    description: 'Chunked & AES-256 Encrypted File Storage with Amazon S3',
    version: '1.0.0',
    endpoints: {
      status: '/api/status',
      files: '/api/files',
      upload: 'POST /api/upload',
      download: '/api/download/:fileId',
      previewChunk: '/api/preview-chunk/:fileId/:chunkIndex'
    }
  });
});

app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Cloud Storage Backend Server running on port ${PORT}`);
  console.log(`👉 API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);

  // Run initial S3 bucket test
  console.log(`[AWS S3] Testing connection to bucket: ${process.env.AWS_BUCKET_NAME}...`);
  const status = await testS3Connection();
  if (status.success) {
    console.log(`✅ AWS S3 Connected Successfully! [Region: ${status.region}, Bucket: ${status.bucket}]`);
  } else {
    console.warn(`⚠️ AWS S3 Connection Warning: ${status.error}`);
  }
});
