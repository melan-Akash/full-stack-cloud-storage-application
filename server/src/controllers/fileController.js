import { pool } from '../config/db.js'
import { uploadToS3, getSignedFileUrl } from '../utils/s3Helper.js'
import { cleanupShareLinks } from '../services/storageService.js'

// Get Files in a folder (or root)
export const getFiles = async (req, res) => {
  const userId = req.user.id
  const rawFolderId = req.query.folder_id || req.query.parentFolderId
  const folderId = rawFolderId && rawFolderId !== 'null' && rawFolderId !== 'undefined' ? rawFolderId : null
  const sort = req.query.sort || 'date'

  try {
    let orderBy = 'ORDER BY created_at DESC'
    if (sort === 'name') orderBy = 'ORDER BY name ASC'
    else if (sort === 'size') orderBy = 'ORDER BY size DESC'
    else if (sort === 'date') orderBy = 'ORDER BY created_at DESC'

    let query
    let params

    if (folderId) {
      query = `SELECT * FROM files WHERE owner_id = $1 AND folder_id = $2 AND is_trashed = FALSE ${orderBy}`
      params = [userId, folderId]
    } else {
      query = `SELECT * FROM files WHERE owner_id = $1 AND folder_id IS NULL AND is_trashed = FALSE ${orderBy}`
      params = [userId]
    }

    const files = await pool.query(query, params)
    res.json({ files: files.rows })
  } catch (error) {
    console.error('Error fetching files:', error)
    res.status(500).json({ error: 'Failed to fetch files' })
  }
}

// Upload Files
export const uploadFiles = async (req, res) => {
  const userId = req.user.id
  const rawFolderId = req.body.folder_id || req.body.parentFolderId
  const folderId = rawFolderId && rawFolderId !== 'null' && rawFolderId !== 'undefined' ? rawFolderId : null

  // Support both multiple files (req.files) and single file (req.file)
  const files = req.files || (req.file ? [req.file] : [])

  try {
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    if (folderId) {
      const folderCheck = await pool.query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
        [folderId, userId]
      )
      if (folderCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Destination folder not found' })
      }
    }

    const uploadedFiles = []

    for (const file of files) {
      const s3Key = await uploadToS3(file.buffer, file.originalname, file.mimetype)

      const newFile = await pool.query(
        `INSERT INTO files (name, original_name, size, mime_type, s3_key, owner_id, folder_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [file.originalname, file.originalname, file.size, file.mimetype, s3Key, userId, folderId]
      )

      // Update User Storage Used
      await pool.query(
        'UPDATE users SET storage_used = storage_used + $1, updated_at = NOW() WHERE id = $2',
        [file.size, userId]
      )

      uploadedFiles.push(newFile.rows[0])
    }

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    res.status(500).json({ error: 'Failed to upload files' })
  }
}

// Get File Stream / Presigned Preview URL
export const getFilePreview = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const fileResult = await pool.query(
      'SELECT * FROM files WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
      [id, userId]
    )

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    const file = fileResult.rows[0]
    const downloadUrl = await getSignedFileUrl(file.s3_key)

    res.json({
      file,
      downloadUrl,
      preview_url: downloadUrl,
      url: downloadUrl
    })
  } catch (error) {
    console.error('Error generating preview URL:', error)
    res.status(500).json({ error: 'Failed to generate file preview URL' })
  }
}

// Rename File
export const renameFile = async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  const userId = req.user.id

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'New file name is required' })
    }

    const updatedFile = await pool.query(
      'UPDATE files SET name = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 AND is_trashed = FALSE RETURNING *',
      [name.trim(), id, userId]
    )

    if (updatedFile.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json({ file: updatedFile.rows[0] })
  } catch (error) {
    console.error('Error renaming file:', error)
    res.status(500).json({ error: 'Failed to rename file' })
  }
}

// Move File to another Folder
export const moveFile = async (req, res) => {
  const { id } = req.params
  const { targetFolderId, target_folder, folder_id } = req.body
  const userId = req.user.id

  const rawTargetId = targetFolderId ?? target_folder ?? folder_id
  const targetId = rawTargetId && rawTargetId !== 'null' && rawTargetId !== 'undefined' ? rawTargetId : null

  try {
    if (targetId) {
      const folderCheck = await pool.query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
        [targetId, userId]
      )

      if (folderCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Target destination folder not found' })
      }
    }

    const updatedFile = await pool.query(
      'UPDATE files SET folder_id = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 AND is_trashed = FALSE RETURNING *',
      [targetId, id, userId]
    )

    if (updatedFile.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    res.json({ file: updatedFile.rows[0] })
  } catch (error) {
    console.error('Error moving file:', error)
    res.status(500).json({ error: 'Failed to move file' })
  }
}

// Soft Delete File (Move to Trash)
export const deleteFile = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const updatedFile = await pool.query(
      'UPDATE files SET is_trashed = TRUE, trashed_at = NOW(), updated_at = NOW() WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE RETURNING *',
      [id, userId]
    )

    if (updatedFile.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    await cleanupShareLinks([id], [])

    res.json({ message: 'File moved to trash successfully', file: updatedFile.rows[0] })
  } catch (error) {
    console.error('Error deleting file:', error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
}