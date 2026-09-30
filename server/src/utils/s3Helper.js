import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3 } from '../config/s3.js'

// Upload file to S3 Bucket
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const s3Key = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType
  })

  await s3.send(command)
  return s3Key
}

// Generate Signed URL for File Download / Preview
export const getSignedFileUrl = async (s3Key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key
  })

  // URL valid for 1 hour
  return await getSignedUrl(s3, command, { expiresIn: 3600 })
}

// Delete object from S3 Bucket
export const deleteFromS3 = async (s3Key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key
  })

  await s3.send(command)
}