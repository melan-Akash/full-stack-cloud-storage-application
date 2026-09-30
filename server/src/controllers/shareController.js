import crypto from 'crypto'
import { pool } from '../config/db.js'
import { getSignedFileUrl } from '../utils/s3Helper.js'

// Create Share Link
export const createShareLink = async (req, res) => {
  const { resource_id, itemId, resource_type, isFolder, permission = 'download', expires_at } = req.body
  const userId = req.user.id

  const resId = resource_id || itemId
  const resType = resource_type || (isFolder ? 'folder' : 'file')

  try {
    if (!resId) {
      return res.status(400).json({ error: 'Resource ID is required' })
    }

    // Verify item exists and belongs to the user
    if (resType === 'folder') {
      const folderCheck = await pool.query(
        'SELECT id FROM folders WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
        [resId, userId]
      )
      if (folderCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Folder not found' })
      }
    } else {
      const fileCheck = await pool.query(
        'SELECT id FROM files WHERE id = $1 AND owner_id = $2 AND is_trashed = FALSE',
        [resId, userId]
      )
      if (fileCheck.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' })
      }
    }

    const token = crypto.randomBytes(16).toString('hex')
    const expirationDate = expires_at ? new Date(expires_at) : null

    const newShare = await pool.query(
      `INSERT INTO share_links (token, resource_type, resource_id, owner_id, permission, expires_at) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (resource_id, owner_id)
       DO UPDATE SET token = $1, permission = $5, expires_at = $6, updated_at = NOW()
       RETURNING *`,
      [token, resType, resId, userId, permission, expirationDate]
    )

    const share = newShare.rows[0]

    res.status(201).json({
      share,
      share_link: share
    })
  } catch (error) {
    console.error('Error creating share link:', error)
    res.status(500).json({ error: 'Failed to create share link' })
  }
}

// Get Active Share Links Created by User
export const getMySharedLinks = async (req, res) => {
  const userId = req.user.id

  try {
    const links = await pool.query(
      `SELECT 
         s.id, 
         s.token, 
         s.resource_type, 
         s.resource_id, 
         s.permission, 
         s.expires_at, 
         s.access_count, 
         s.created_at,
         COALESCE(f.name, d.name) as "itemName",
         COALESCE(f.name, d.name) as name,
         f.size, 
         f.mime_type,
         (s.resource_type = 'folder') as "isFolder"
       FROM share_links s
       LEFT JOIN files f ON s.resource_id = f.id AND s.resource_type = 'file'
       LEFT JOIN folders d ON s.resource_id = d.id AND s.resource_type = 'folder'
       WHERE s.owner_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    )

    res.json({ links: links.rows })
  } catch (error) {
    console.error('Error fetching shared links:', error)
    res.status(500).json({ error: 'Failed to fetch shared links' })
  }
}

// Access Public Shared Item Details (No Auth Guard)
export const getPublicSharedItem = async (req, res) => {
  const { token } = req.params

  try {
    const shareResult = await pool.query(
      'SELECT * FROM share_links WHERE token = $1',
      [token]
    )

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired share link' })
    }

    const share = shareResult.rows[0]

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This share link has expired' })
    }

    // Increment access count asynchronously
    pool.query('UPDATE share_links SET access_count = access_count + 1 WHERE id = $1', [share.id]).catch(() => {})

    if (share.resource_type === 'file') {
      const fileResult = await pool.query(
        'SELECT id, name, original_name, mime_type, size, s3_key, created_at FROM files WHERE id = $1 AND is_trashed = FALSE',
        [share.resource_id]
      )

      if (fileResult.rows.length === 0) {
        return res.status(404).json({ error: 'Shared file no longer exists or was moved to trash' })
      }

      const file = fileResult.rows[0]
      const downloadUrl = await getSignedFileUrl(file.s3_key)

      return res.json({
        share,
        item: {
          ...file,
          downloadUrl,
          preview_url: downloadUrl
        },
        permission: share.permission
      })
    } else {
      const folderResult = await pool.query(
        'SELECT id, name, created_at FROM folders WHERE id = $1 AND is_trashed = FALSE',
        [share.resource_id]
      )

      if (folderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Shared folder no longer exists or was moved to trash' })
      }

      const folder = folderResult.rows[0]
      const childFolders = await pool.query(
        'SELECT id, name, created_at FROM folders WHERE parent_id = $1 AND is_trashed = FALSE ORDER BY name ASC',
        [folder.id]
      )
      const childFiles = await pool.query(
        'SELECT id, name, size, mime_type, created_at FROM files WHERE folder_id = $1 AND is_trashed = FALSE ORDER BY created_at DESC',
        [folder.id]
      )

      return res.json({
        share,
        item: folder,
        folders: childFolders.rows,
        files: childFiles.rows,
        permission: share.permission
      })
    }
  } catch (error) {
    console.error('Error fetching public shared item:', error)
    res.status(500).json({ error: 'Failed to fetch shared item' })
  }
}

// Download Public Shared File (No Auth Guard)
export const downloadSharedFile = async (req, res) => {
  const { token } = req.params

  try {
    const shareResult = await pool.query(
      'SELECT * FROM share_links WHERE token = $1',
      [token]
    )

    if (shareResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid share link' })
    }

    const share = shareResult.rows[0]

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This share link has expired' })
    }

    if (share.resource_type !== 'file') {
      return res.status(400).json({ error: 'Direct download is only supported for files' })
    }

    const fileResult = await pool.query(
      'SELECT s3_key, name FROM files WHERE id = $1 AND is_trashed = FALSE',
      [share.resource_id]
    )

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' })
    }

    pool.query('UPDATE share_links SET access_count = access_count + 1 WHERE id = $1', [share.id]).catch(() => {})

    const downloadUrl = await getSignedFileUrl(fileResult.rows[0].s3_key)
    res.redirect(downloadUrl)
  } catch (error) {
    console.error('Error downloading shared file:', error)
    res.status(500).json({ error: 'Failed to process file download' })
  }
}

// Revoke Share Link
export const revokeShareLink = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    await pool.query(
      'DELETE FROM share_links WHERE (id::text = $1 OR token = $1) AND owner_id = $2',
      [id, userId]
    )
    res.json({ message: 'Share link revoked successfully' })
  } catch (error) {
    console.error('Error revoking share link:', error)
    res.status(500).json({ error: 'Failed to revoke share link' })
  }
}