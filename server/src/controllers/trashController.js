import { pool } from '../config/db.js'
import { deleteFromS3 } from '../utils/s3Helper.js'

// Get All Trash Items (Deleted Folders & Files)
export const getTrashItems = async (req, res) => {
  const userId = req.user.id

  try {
    const deletedFolders = await pool.query(
      'SELECT id, name, deleted_at, TRUE as "isFolder" FROM folders WHERE user_id = \$1 AND is_deleted = TRUE ORDER BY deleted_at DESC',
      [userId]
    )

    const deletedFiles = await pool.query(
      'SELECT id, name, deleted_at, FALSE as "isFolder" FROM files WHERE user_id = \$1 AND is_deleted = TRUE ORDER BY deleted_at DESC',
      [userId]
    )

    const items = [...deletedFolders.rows, ...deletedFiles.rows].sort(
      (a, b) => new Date(b.deleted_at) - new Date(a.deleted_at)
    )

    res.json({ items })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trash items' })
  }
}

// Restore Soft Deleted Item
export const restoreItem = async (req, res) => {
  const { id, isFolder } = req.body
  const userId = req.user.id

  try {
    const table = isFolder ? 'folders' : 'files'
    const restoredItem = await pool.query(
      `UPDATE ${table} SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    )

    if (restoredItem.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in trash' })
    }

    res.json({ message: 'Item restored successfully', item: restoredItem.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore item' })
  }
}

// Permanently Delete Single Item
export const permanentlyDeleteItem = async (req, res) => {
  const { id, isFolder } = req.body
  const userId = req.user.id

  try {
    if (isFolder) {
      await pool.query('DELETE FROM folders WHERE id = \$1 AND user_id = \$2', [id, userId])
    } else {
      const fileResult = await pool.query(
        'DELETE FROM files WHERE id = \$1 AND user_id = \$2 RETURNING s3_key, size',
        [id, userId]
      )

      if (fileResult.rows.length > 0) {
        const { s3_key, size } = fileResult.rows
        await deleteFromS3(s3_key)
        await pool.query('UPDATE users SET storage_used = storage_used - \$1 WHERE id = \$2', [size, userId])
      }
    }

    res.json({ message: 'Item permanently deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to permanently delete item' })
  }
}

// Empty Trash Completely
export const emptyTrash = async (req, res) => {
  const userId = req.user.id

  try {
    // Delete files from S3 first
    const deletedFiles = await pool.query(
      'SELECT s3_key, size FROM files WHERE user_id = \$1 AND is_deleted = TRUE',
      [userId]
    )

    for (const file of deletedFiles.rows) {
      await deleteFromS3(file.s3_key)
      await pool.query('UPDATE users SET storage_used = storage_used - \$1 WHERE id = \$2', [file.size, userId])
    }

    // Delete records from database
    await pool.query('DELETE FROM files WHERE user_id = \$1 AND is_deleted = TRUE', [userId])
    await pool.query('DELETE FROM folders WHERE user_id = \$1 AND is_deleted = TRUE', [userId])

    res.json({ message: 'Trash emptied successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to empty trash' })
  }
}