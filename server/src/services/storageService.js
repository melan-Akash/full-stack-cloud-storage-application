import { SQL } from '../config/db.js'
import { deleteMultipleFromStorage } from '../utils/s3Helper.js'

// Get all descendants folder IDs for a given folder including the root folder ID itself
export const getFolderHierarchyIds = async (folderId, ownerId) => {
  const descendants = await SQL`
    SELECT id FROM folders
    WHERE ${folderId} = ANY(path) AND owner_id = ${ownerId}
  `
  return [folderId, ...descendants.map((folder) => folder.id)]
}

// Remove share links associated with given resource IDs
export const cleanupShareLinks = async (fileIds = [], folderIds = []) => {
  if (fileIds.length === 0 && folderIds.length === 0) return
  const allIds = [...fileIds, ...folderIds]
  await SQL`
    DELETE FROM share_links
    WHERE resource_id = ANY(${allIds})
  `
}

// Adjust user storage quota
export const adjustUserStorage = async (userId, deltaBytes) => {
  const user = await SQL`
    UPDATE users
    SET storage_used = GREATEST(0, storage_used + ${deltaBytes}), updated_at = NOW()
    WHERE id = ${userId}
    RETURNING storage_used
  `
  return user ? Number(user.storage_used) : null
}

// Soft delete a folder and all its contents
export const softDeleteFolderHierarchy = async (folderId, ownerId) => {
  const allFolderIds = await getFolderHierarchyIds(folderId, ownerId)
  const now = new Date()

  const files = await SQL`
    SELECT id FROM files
    WHERE folder_id = ANY(${allFolderIds}) AND owner_id = ${ownerId} AND is_trashed = false
  `
  const fileIds = files.map((file) => file.id)

  await Promise.all([
    SQL`
      UPDATE folders
      SET is_trashed = true, trashed_at = ${now}, updated_at = ${now}
      WHERE id = ANY(${allFolderIds}) AND owner_id = ${ownerId}
    `,
    fileIds.length > 0
      ? SQL`
          UPDATE files
          SET is_trashed = true, trashed_at = ${now}, updated_at = ${now}
          WHERE id = ANY(${fileIds}) AND owner_id = ${ownerId}
        `
      : Promise.resolve(),
    cleanupShareLinks(fileIds, allFolderIds)
  ])
}

// Restore a folder and all its contents from trash
export const restoreFolderHierarchy = async (folderId, ownerId) => {
  const allFolderIds = await getFolderHierarchyIds(folderId, ownerId)

  await Promise.all([
    SQL`
      UPDATE folders
      SET is_trashed = false, trashed_at = null, updated_at = NOW()
      WHERE id = ANY(${allFolderIds}) AND owner_id = ${ownerId}
    `,
    SQL`
      UPDATE files
      SET is_trashed = false, trashed_at = null, updated_at = NOW()
      WHERE folder_id = ANY(${allFolderIds}) AND owner_id = ${ownerId}
    `
  ])
}

// Permanently delete a folder and all nested contents
export const permanentDeleteFolderHierarchy = async (folderId, ownerId) => {
  const allFolderIds = await getFolderHierarchyIds(folderId, ownerId)

  const files = await SQL`
    SELECT id, s3_key, size FROM files
    WHERE folder_id = ANY(${allFolderIds}) AND owner_id = ${ownerId}
  `

  const s3Keys = files.map((file) => file.s3_key)
  const fileIds = files.map((file) => file.id)
  const totalFreedSize = files.reduce((acc, file) => acc + Number(file.size || 0), 0)

  await Promise.all([
    s3Keys.length > 0
      ? deleteMultipleFromStorage(s3Keys)
      : Promise.resolve(),
    cleanupShareLinks(fileIds, allFolderIds),
    fileIds.length > 0
      ? SQL`
          DELETE FROM files
          WHERE id = ANY(${fileIds})
        `
      : Promise.resolve(),
    SQL`
      DELETE FROM folders
      WHERE id = ANY(${allFolderIds})
    `
  ])

  if (totalFreedSize > 0) {
    await adjustUserStorage(ownerId, -totalFreedSize)
  }
}

// Permanently delete a single file record
export const permanentDeleteFileRecord = async (file, ownerId) => {
  await Promise.all([
    deleteMultipleFromStorage([file.s3_key]),
    cleanupShareLinks([file.id], []),
    SQL`
      DELETE FROM files
      WHERE id = ${file.id}
    `
  ])

  await adjustUserStorage(ownerId, -Number(file.size))
}

// Permanently empty user's trash bin
export const emptyUserTrashHierarchy = async (ownerId) => {
  const [trashedFiles, trashedFolders] = await Promise.all([
    SQL`
      SELECT id, s3_key, size FROM files
      WHERE owner_id = ${ownerId} AND is_trashed = true
    `,
    SQL`
      SELECT id FROM folders
      WHERE owner_id = ${ownerId} AND is_trashed = true
    `
  ])

  const s3Keys = trashedFiles.map((file) => file.s3_key)
  const totalFreedBytes = trashedFiles.reduce((acc, file) => acc + Number(file.size || 0), 0)
  const trashedFileIds = trashedFiles.map((file) => file.id)
  const trashedFolderIds = trashedFolders.map((folder) => folder.id)

  await Promise.all([
    s3Keys.length > 0
      ? deleteMultipleFromStorage(s3Keys)
      : Promise.resolve(),
    cleanupShareLinks(trashedFileIds, trashedFolderIds),
    SQL`
      DELETE FROM files
      WHERE owner_id = ${ownerId} AND is_trashed = true
    `,
    SQL`
      DELETE FROM folders
      WHERE owner_id = ${ownerId} AND is_trashed = true
    `
  ])

  if (totalFreedBytes > 0) {
    await adjustUserStorage(ownerId, -totalFreedBytes)
  }
}