import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3, S3_BUCKET_NAME } from '../config/s3.js'

const BUCKET = S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME || 'drive-bucket'

// Upload file to S3 Bucket
export const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const s3Key = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: mimeType
  })

  await s3.send(command)
  return s3Key
}

// Generate Signed URL for File Download / Preview
export const getSignedFileUrl = async (s3Key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: s3Key
  })

  return await getSignedUrl(s3, command, { expiresIn })
}

// Delete single object from S3 Bucket
export const deleteFromS3 = async (s3Key) => {
  if (!s3Key) return
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: s3Key
  })

  await s3.send(command)
}

// Delete multiple objects from S3 Bucket
export const deleteMultipleFromStorage = async (s3Keys = []) => {
  if (!s3Keys || s3Keys.length === 0) return

  // Neon Object Storage / AWS S3 supports DeleteObjectsCommand
  try {
    const objects = s3Keys.filter(Boolean).map((key) => ({ Key: key }))
    if (objects.length === 0) return

    const command = new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: objects,
        Quiet: true
      }
    })
    await s3.send(command)
  } catch (err) {
    console.error('Batch S3 deletion failed, falling back to sequential delete:', err.message)
    await Promise.allSettled(s3Keys.map((key) => deleteFromS3(key)))
  }
}