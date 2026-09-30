import { pool } from '../config/db.js'

// Create a new folder
export const createFolder = async (req, res) => {
  const { name, parentFolderId } = req.body
  const userId = req.user.id

  try {
    if (!name) {
      return res.status(400).json({ error: 'Folder name is required' })
    }

    const parentId = parentFolderId ? parseInt(parentFolderId) : null

    const newFolder = await pool.query(
      'INSERT INTO folders (name, user_id, parent_id) VALUES ($1, $2, $3) RETURNING *',
      [name, userId, parentId]
    )

    res.status(201).json({ folder: newFolder.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folder' })
  }
}

// Get Root Folders and Files
export const getRootContent = async (req, res) => {
  const userId = req.user.id

  try {
    const folders = await pool.query(
      'SELECT * FROM folders WHERE user_id = $1 AND parent_id IS NULL AND is_deleted = FALSE ORDER BY created_at DESC',
      [userId]
    )

    const files = await pool.query(
      'SELECT * FROM files WHERE user_id = $1 AND folder_id IS NULL AND is_deleted = FALSE ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      folders: folders.rows,
      files: files.rows
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch root items' })
  }
}

// Get Specific Folder Content by ID
export const getFolderById = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const folderResult = await pool.query(
      'SELECT * FROM folders WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE',
      [id, userId]
    )

    if (folderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    const folders = await pool.query(
      'SELECT * FROM folders WHERE user_id = $1 AND parent_id = $2 AND is_deleted = FALSE ORDER BY created_at DESC',
      [userId, id]
    )

    const files = await pool.query(
      'SELECT * FROM files WHERE user_id = $1 AND folder_id = $2 AND is_deleted = FALSE ORDER BY created_at DESC',
      [userId, id]
    )

    res.json({
      folder: folderResult.rows[0],
      folders: folders.rows,
      files: files.rows
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folder content' })
  }
}

// Rename Folder
export const renameFolder = async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  const userId = req.user.id

  try {
    if (!name) {
      return res.status(400).json({ error: 'New folder name is required' })
    }

    const updatedFolder = await pool.query(
      'UPDATE folders SET name = $1 WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE RETURNING *',
      [name, id, userId]
    )

    if (updatedFolder.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    res.json({ folder: updatedFolder.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to rename folder' })
  }
}

// Move Folder to another parent folder
export const moveFolder = async (req, res) => {
  const { id } = req.params
  const { targetFolderId } = req.body
  const userId = req.user.id

  try {
    const targetId = targetFolderId ? parseInt(targetFolderId) : null

    if (targetId === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot move folder into itself' })
    }

    const updatedFolder = await pool.query(
      'UPDATE folders SET parent_id = $1 WHERE id = $2 AND user_id = $3 AND is_deleted = FALSE RETURNING *',
      [targetId, id, userId]
    )

    if (updatedFolder.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    res.json({ folder: updatedFolder.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to move folder' })
  }
}

// Soft Delete Folder (Move to Trash)
export const deleteFolder = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const updatedFolder = await pool.query(
      'UPDATE folders SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )

    if (updatedFolder.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    res.json({ message: 'Folder moved to trash successfully', folder: updatedFolder.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete folder' })
  }
}