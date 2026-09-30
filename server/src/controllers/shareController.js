import crypto from 'crypto'
import { pool } from '../config/db.js'
import { getSignedFileUrl } from '../utils/s3Helper.js'

// Create Share Link
export const createShareLink = async (req, res) => {
  const { itemId, isFolder, permission = 'view' } = req.body
  const userId = req.user.id

  try {
    const token = crypto.randomBytes(16).toString('hex')

    const newShare = await pool.query(
      `INSERT INTO shares (token, item_id, is_folder, user_id, permission) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [token, itemId, isFolder, userId, permission]
    )

    res.status(201).json({ share: newShare.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create share link' })
  }
}

// Get Active Share Links Created by User
export const getMySharedLinks = async (req, res) => {
  const userId = req.user.id

  try {
    const links = await pool.query(
      `SELECT s.id, s.token, s.permission, s.created_at, f.name as "itemName" 
       FROM shares s 
       LEFT JOIN files f ON s.item_id = f.id AND s.is_folder = FALSE 
       WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
      [userId]
    )

    res.json({ links: links.rows })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared links' })
  }
}

// Access Public Shared Item Details (No Auth Guard)
export const getPublicSharedItem = async (req, res) => {
  const { token } = req.params

  try {
    const shareResult = await pool.query('SELECT * FROM shares WHERE token = \$1', [token])

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired share link' })
    }

    const share = shareResult.rows
    const fileResult = await pool.query('SELECT id, name, mime_type, size FROM files WHERE id = \$1', [share.item_id])

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Shared file no longer exists' })
    }

    res.json({
      share,
      item: fileResult.rows
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shared item' })
  }
}

// Download Public Shared File (No Auth Guard)
export const downloadSharedFile = async (req, res) => {
  const { token } = req.params

  try {
    const shareResult = await pool.query('SELECT * FROM shares WHERE token = \$1', [token])

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid share link' })
    }

    const share = shareResult.rows
    const fileResult = await pool.query('SELECT s3_key, name FROM files WHERE id = \$1', [share.item_id])

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    const downloadUrl = await getSignedFileUrl(fileResult.rows.s3_key)
    res.redirect(downloadUrl)
  } catch (error) {
    res.status(500).json({ error: 'Failed to process file download' })
  }
}

// Revoke Share Link
export const revokeShareLink = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    await pool.query('DELETE FROM shares WHERE id = \$1 AND user_id = \$2', [id, userId])
    res.json({ message: 'Share link revoked successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke share link' })
  }
}