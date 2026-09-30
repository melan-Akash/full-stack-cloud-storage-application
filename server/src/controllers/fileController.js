import { pool } from '../config/db.js'
import { uploadToS3, getSignedFileUrl } from '../utils/s3Helper.js'

// Upload Files
export const uploadFiles = async (req, res) => {
  const userId = req.user.id
  const { parentFolderId } = req.body
  const files = req.files

  try {
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const folderId = parentFolderId ? parseInt(parentFolderId) : null
    const uploadedFiles = []

    for (const file of files) {
      const s3Key = await uploadToS3(file.buffer, file.originalname, file.mimetype)

      const newFile = await pool.query(
        `INSERT INTO files (name, s3_key, size, mime_type, user_id, folder_id) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [file.originalname, s3Key, file.size, file.mimetype, userId, folderId]
      )

      // Update User Storage Used
      await pool.query(
        'UPDATE users SET storage_used = storage_used + \$1 WHERE id = \$2',
        [file.size, userId]
      )

      uploadedFiles.push(newFile.rows[0])
    }

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload files' })
  }
}

// Get File Stream / Presigned Preview URL
export const getFilePreview = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const fileResult = await pool.query(
      'SELECT * FROM files WHERE id = \$1 AND user_id = \$2 AND is_deleted = FALSE',
      [id, userId]
    )

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    const file = fileResult.rows[0]
    const downloadUrl = await getSignedFileUrl(file.s3_key)

    res.json({
      file,
      downloadUrl
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate file preview URL' })
  }
}

// Rename File
export const renameFile = async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  const userId = req.user.id

  try {
    if (!name) {
      return res.status(400).json({ error: 'New file name is required' })
    }

    const updatedFile = await pool.query(
      'UPDATE files SET name = \$1 WHERE id = \$2 AND user_id = \$3 AND is_deleted = FALSE RETURNING *',
      [name, id, userId]
    )

    if (updatedFile.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json({ file: updatedFile.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to rename file' })
  }
}

// Move File to another Folder
export const moveFile = async (req, res) => {
  const { id } = req.params
  const { targetFolderId } = req.body
  const userId = req.user.id

  try {
    const targetId = targetFolderId ? parseInt(targetFolderId) : null

    const updatedFile = await pool.query(
      'UPDATE files SET folder_id = \$1 WHERE id = \$2 AND user_id = \$3 AND is_deleted = FALSE RETURNING *',
      [targetId, id, userId]
    )

    if (updatedFile.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json({ file: updatedFile.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to move file' })
  }
}

// Soft Delete File (Move to Trash)
export const deleteFile = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const updatedFile = await pool.query(
      'UPDATE files SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = \$1 AND user_id = \$2 RETURNING *',
      [id, userId]
    )

    if (updatedFile.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json({ message: 'File moved to trash successfully', file: updatedFile.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete file' })
  }
}