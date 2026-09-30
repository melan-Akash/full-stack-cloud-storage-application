import { useState, useCallback } from 'react'
import API from '../config/api'
import { toast } from 'react-hot-toast'
import { useApp } from '../context/appContext'

export const useDrive = (initialFolderId = null) => {
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { sortBy } = useApp()

  const fetchDriveData = useCallback(async (folderId = initialFolderId) => {
    setIsLoading(true)
    try {
      const parentId = folderId || null
      const [foldersRes, filesRes] = await Promise.all([
        API.get('/api/folders', { params: { parent_id: parentId } }),
        API.get('/api/files', { params: { folder_id: parentId, sort: sortBy } }),
      ])

      const fetchedFolders = foldersRes?.data?.folders || []
      const fetchedFiles = filesRes?.data?.files || []

      setFolders(fetchedFolders)
      setFiles(fetchedFiles)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to load drive items')
    } finally {
      setIsLoading(false)
    }
  }, [initialFolderId, sortBy])

  const uploadFiles = async (selectedFiles, folderId = initialFolderId) => {
    try {
      const formData = new FormData()
      formData.append('folder_id', folderId || '')
      selectedFiles.forEach((f) => formData.append('files', f))

      await API.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Files uploaded successfully!')
      fetchDriveData(folderId)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to upload files')
    }
  }

  const createFolder = async (name, folderId = initialFolderId) => {
    try {
      await API.post('/api/folders', {
        name,
        parent_id: folderId || null,
      })
      toast.success('Folder created successfully!')
      fetchDriveData(folderId)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to create folder')
    }
  }

  const renameItem = async (id, newName, isFolder) => {
    try {
      const endpoint = isFolder ? `/api/folders/${id}/rename` : `/api/files/${id}/rename`
      await API.post(endpoint, { name: newName })
      toast.success('Item renamed!')
      fetchDriveData(initialFolderId)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to rename item')
    }
  }

  const moveItem = async (id, targetFolderId, isFolder) => {
    try {
      const endpoint = isFolder ? `/api/folders/${id}/move` : `/api/files/${id}/move`
      const payload = isFolder ? { target_parent: targetFolderId } : { target_folder: targetFolderId }
      await API.post(endpoint, payload)
      toast.success('Item moved!')
      fetchDriveData(initialFolderId)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to move item')
    }
  }

  const deleteItem = async (item) => {
    try {
      const isFolder = !item.mime_type
      const endpoint = isFolder ? `/api/folders/${item.id}` : `/api/files/${item.id}`
      await API.delete(endpoint)
      toast.success('Moved to trash')
      fetchDriveData(initialFolderId)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to delete item')
    }
  }

  const shareItem = async (id, config) => {
    try {
      const { data } = await API.post('/api/shares', {
        resource_id: id,
        resource_type: config.resource_type || (config.mime_type ? 'file' : 'folder'),
        permission: config.permission || 'download',
        expires_at: config.expires_at || null,
      })
      toast.success('Share link generated!')
      return data?.share || data?.share_link
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to generate share link')
      return null
    }
  }

  return {
    folders,
    files,
    isLoading,
    fetchDriveData,
    uploadFiles,
    createFolder,
    renameItem,
    moveItem,
    deleteItem,
    shareItem,
  }
}

export default useDrive
