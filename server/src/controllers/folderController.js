import { pool } from '../config/db.js'
import { softDeleteFolderHierarchy } from '../services/storageService.js'

// Get Folders by Parent ID (for drive explorer)
export const getFolders = async (req, res) => {
  const userId = req.user.id
  const rawParentId = req.query.parent_id || req.query.parentFolderId
  const parentId = rawParentId && rawParentId !== 'null' && rawParentId !== 'undefined' ? rawParentId : null

  try {
    let query
    let params

    if (parentId) {
      query = 'SELECT * FROM folders WHERE owner_id = $1 AND parent_id = $2 AND is_trashed = FALSE ORDER BY name ASC'
      params = [userId, parentId]
    } else {
      query = 'SELECT * FROM folders WHERE owner_id = $1 AND parent_id IS NULL AND is_trashed = FALSE ORDER BY name ASC'
      params = [userId]
    }

    const folders = await pool.query(query, params)
    res.json({ folders: folders.rows })
  } catch (error) {
    console.error('Error fetching folders:', error)
    res.status(500).json({ error: 'Failed to fetch folders' })
  }
}

// Create a new folder
export const createFolder = async (req, res) => {
  const { name, parent_id, parentFolderId } = req.body
  const userId = req.user.id
  const rawParentId = parent_id || parentFolderId
  const parentId = rawParentId && rawParentId !== 'null' && rawParentId !== 'undefined' ? rawParentId : null

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Folder name is required' })
    }

    let ancestorPath = []

    if (parentId) {
      const parentResult = await pool.query(
        'SELECT id, path FROM folders WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
        [parentId, userId]
      )

      if (parentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Parent folder not found' })
      }

      const parent = parentResult.rows[0]
      ancestorPath = [...(parent.path || []), parent.id]
    }

    const newFolder = await pool.query(
      'INSERT INTO folders (name, parent_id, owner_id, path) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), parentId, userId, ancestorPath]
    )

    res.status(201).json({ folder: newFolder.rows[0] })
  } catch (error) {
    console.error('Error creating folder:', error)
    res.status(500).json({ error: 'Failed to create folder' })
  }
}

// Get Root Folders and Files
export const getRootContent = async (req, res) => {
  const userId = req.user.id

  try {
    const folders = await pool.query(
      'SELECT * FROM folders WHERE owner_id = $1 AND parent_id IS NULL AND is_trashed = FALSE ORDER BY name ASC',
      [userId]
    )

    const files = await pool.query(
      'SELECT * FROM files WHERE owner_id = $1 AND folder_id IS NULL AND is_trashed = FALSE ORDER BY created_at DESC',
      [userId]
    )

    res.json({
      folders: folders.rows,
      files: files.rows
    })
  } catch (error) {
    console.error('Error fetching root items:', error)
    res.status(500).json({ error: 'Failed to fetch root items' })
  }
}

// Get Specific Folder Content by ID
export const getFolderById = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const folderResult = await pool.query(
      'SELECT * FROM folders WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
      [id, userId]
    )

    if (folderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    const folders = await pool.query(
      'SELECT * FROM folders WHERE owner_id = $1 AND parent_id = $2 AND is_trashed = FALSE ORDER BY name ASC',
      [userId, id]
    )

    const files = await pool.query(
      'SELECT * FROM files WHERE owner_id = $1 AND folder_id = $2 AND is_trashed = FALSE ORDER BY created_at DESC',
      [userId, id]
    )

    res.json({
      folder: folderResult.rows[0],
      folders: folders.rows,
      files: files.rows
    })
  } catch (error) {
    console.error('Error fetching folder content:', error)
    res.status(500).json({ error: 'Failed to fetch folder content' })
  }
}

// Rename Folder
export const renameFolder = async (req, res) => {
  const { id } = req.params
  const { name } = req.body
  const userId = req.user.id

  try {
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'New folder name is required' })
    }

    const updatedFolder = await pool.query(
      'UPDATE folders SET name = $1, updated_at = NOW() WHERE id = $2 AND owner_id = $3 AND is_trashed = FALSE RETURNING *',
      [name.trim(), id, userId]
    )

    if (updatedFolder.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    res.json({ folder: updatedFolder.rows[0] })
  } catch (error) {
    console.error('Error renaming folder:', error)
    res.status(500).json({ error: 'Failed to rename folder' })
  }
}

// Move Folder to another parent folder
export const moveFolder = async (req, res) => {
  const { id } = req.params
  const { targetFolderId, target_parent, parent_id } = req.body
  const userId = req.user.id

  const rawTargetId = targetFolderId ?? target_parent ?? parent_id
  const targetId = rawTargetId && rawTargetId !== 'null' && rawTargetId !== 'undefined' ? rawTargetId : null

  try {
    if (targetId === id) {
      return res.status(400).json({ error: 'Cannot move folder into itself' })
    }

    let newPath = []

    if (targetId) {
      const targetFolderResult = await pool.query(
        'SELECT id, path FROM folders WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
        [targetId, userId]
      )

      if (targetFolderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Target destination folder not found' })
      }

      const targetFolder = targetFolderResult.rows[0]
      if (targetFolder.path && targetFolder.path.includes(id)) {
        return res.status(400).json({ error: 'Cannot move folder into one of its subfolders' })
      }

      newPath = [...(targetFolder.path || []), targetFolder.id]
    }

    const updatedFolder = await pool.query(
      'UPDATE folders SET parent_id = $1, path = $2, updated_at = NOW() WHERE id = $3 AND owner_id = $4 AND is_trashed = FALSE RETURNING *',
      [targetId, newPath, id, userId]
    )

    if (updatedFolder.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    res.json({ folder: updatedFolder.rows[0] })
  } catch (error) {
    console.error('Error moving folder:', error)
    res.status(500).json({ error: 'Failed to move folder' })
  }
}

// Soft Delete Folder (Move to Trash)
export const deleteFolder = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const existing = await pool.query(
      'SELECT id FROM folders WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
      [id, userId]
    )

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' })
    }

    await softDeleteFolderHierarchy(id, userId)

    res.json({ message: 'Folder moved to trash successfully', id })
  } catch (error) {
    console.error('Error deleting folder:', error)
    res.status(500).json({ error: 'Failed to delete folder' })
  }
}