import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET || 'drive-bucket';

export const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export const s3 = client;
export default client;