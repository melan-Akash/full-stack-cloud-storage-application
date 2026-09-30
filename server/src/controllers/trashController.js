import { pool } from '../config/db.js'
import {
  restoreFolderHierarchy,
  permanentDeleteFolderHierarchy,
  permanentDeleteFileRecord,
  emptyUserTrashHierarchy
} from '../services/storageService.js'

// Get All Trash Items (Deleted Folders & Files)
export const getTrashItems = async (req, res) => {
  const userId = req.user.id

  try {
    const deletedFolders = await pool.query(
      'SELECT id, name, trashed_at as "deleted_at", created_at, TRUE as "isFolder" FROM folders WHERE owner_id = $1 AND is_trashed = TRUE ORDER BY trashed_at DESC',
      [userId]
    )

    const deletedFiles = await pool.query(
      'SELECT id, name, size, mime_type, trashed_at as "deleted_at", created_at, FALSE as "isFolder" FROM files WHERE owner_id = $1 AND is_trashed = TRUE ORDER BY trashed_at DESC',
      [userId]
    )

    const items = [...deletedFolders.rows, ...deletedFiles.rows].sort(
      (a, b) => new Date(b.deleted_at || 0) - new Date(a.deleted_at || 0)
    )

    res.json({ items })
  } catch (error) {
    console.error('Error fetching trash items:', error)
    res.status(500).json({ error: 'Failed to fetch trash items' })
  }
}

// Restore Soft Deleted Item
export const restoreItem = async (req, res) => {
  const { id, isFolder } = req.body
  const userId = req.user.id

  try {
    if (!id) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    if (isFolder) {
      await restoreFolderHierarchy(id, userId)
    } else {
      const restored = await pool.query(
        'UPDATE files SET is_trashed = FALSE, trashed_at = NULL, updated_at = NOW() WHERE id = $1 AND owner_id = $2 RETURNING *',
        [id, userId]
      )
      if (restored.rows.length === 0) {
        return res.status(404).json({ error: 'File not found in trash' })
      }
    }

    res.json({ message: 'Item restored successfully' })
  } catch (error) {
    console.error('Error restoring item:', error)
    res.status(500).json({ error: 'Failed to restore item' })
  }
}

// Permanently Delete Single Item
export const permanentlyDeleteItem = async (req, res) => {
  const { id, isFolder } = req.body
  const userId = req.user.id

  try {
    if (!id) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    if (isFolder) {
      await permanentDeleteFolderHierarchy(id, userId)
    } else {
      const fileResult = await pool.query(
        'SELECT id, s3_key, size FROM files WHERE id = $1 AND owner_id = $2',
        [id, userId]
      )

      if (fileResult.rows.length > 0) {
        await permanentDeleteFileRecord(fileResult.rows[0], userId)
      } else {
        return res.status(404).json({ error: 'File not found' })
      }
    }

    res.json({ message: 'Item permanently deleted' })
  } catch (error) {
    console.error('Error permanently deleting item:', error)
    res.status(500).json({ error: 'Failed to permanently delete item' })
  }
}

// Empty Trash Completely
export const emptyTrash = async (req, res) => {
  const userId = req.user.id

  try {
    await emptyUserTrashHierarchy(userId)
    res.json({ message: 'Trash emptied successfully' })
  } catch (error) {
    console.error('Error emptying trash:', error)
    res.status(500).json({ error: 'Failed to empty trash' })
  }
}