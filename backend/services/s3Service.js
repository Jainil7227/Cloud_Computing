import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectsCommand, 
  HeadBucketCommand 
} from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const {
  AWS_REGION,
  AWS_BUCKET_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env;

export const s3Client = new S3Client({
  region: AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Test AWS S3 connection and bucket accessibility
 */
export async function testS3Connection() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: AWS_BUCKET_NAME }));
    return { success: true, bucket: AWS_BUCKET_NAME, region: AWS_REGION };
  } catch (err) {
    console.error('S3 Connection Check Failed:', err.message);
    return { success: false, error: err.message, bucket: AWS_BUCKET_NAME, region: AWS_REGION };
  }
}

/**
 * Upload an encrypted chunk to AWS S3
 */
export async function uploadChunkToS3({ key, buffer, contentType = 'application/octet-stream' }) {
  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    Metadata: {
      encrypted: 'true',
      algorithm: 'aes-256-cbc'
    }
  });

  return await s3Client.send(command);
}

/**
 * Download a chunk buffer from AWS S3
 */
export async function getChunkFromS3(key) {
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key
  });

  const response = await s3Client.send(command);
  
  // Stream to buffer
  const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  };

  return await streamToBuffer(response.Body);
}

/**
 * Delete all chunks belonging to a file from AWS S3
 */
export async function deleteChunksFromS3(keys) {
  if (!keys || keys.length === 0) return;

  const command = new DeleteObjectsCommand({
    Bucket: AWS_BUCKET_NAME,
    Delete: {
      Objects: keys.map(k => ({ Key: k }))
    }
  });

  return await s3Client.send(command);
}
