import { useState, useCallback } from 'react'
import API from '../config/api'
import { toast } from 'react-hot-toast'
import { useApp } from '../context/appContext'

export const useDrive = (initialFolderId = null) => {
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const { sortBy, refreshUser } = useApp()

  const [uploadStatus, setUploadStatus] = useState({
    isUploading: false,
    percent: 0,
    speed: '0 KB/s',
    remainingTime: '',
    uploadedBytes: 0,
    totalBytes: 0,
    filesCount: 0,
    fileNames: [],
    isSuccess: false,
    error: null,
  })

  const resetUploadStatus = useCallback(() => {
    setUploadStatus({
      isUploading: false,
      percent: 0,
      speed: '0 KB/s',
      remainingTime: '',
      uploadedBytes: 0,
      totalBytes: 0,
      filesCount: 0,
      fileNames: [],
      isSuccess: false,
      error: null,
    })
  }, [])

  const fetchDriveData = useCallback(async (folderId = initialFolderId) => {
    setIsLoading(true)
    try {
      const parentId = folderId || null
      let fetchedFolders = []
      let fetchedFiles = []
      let folderInfo = null

      if (parentId) {
        try {
          const res = await API.get(`/api/folders/${parentId}`)
          folderInfo = res.data?.folder || null
          fetchedFolders = res.data?.folders || []
          fetchedFiles = res.data?.files || []
        } catch {
          const [foldersRes, filesRes] = await Promise.all([
            API.get('/api/folders', { params: { parent_id: parentId } }),
            API.get('/api/files', { params: { folder_id: parentId, sort: sortBy } }),
          ])
          fetchedFolders = foldersRes?.data?.folders || []
          fetchedFiles = filesRes?.data?.files || []
        }
      } else {
        const [foldersRes, filesRes] = await Promise.all([
          API.get('/api/folders', { params: { parent_id: null } }),
          API.get('/api/files', { params: { folder_id: null, sort: sortBy } }),
        ])
        fetchedFolders = foldersRes?.data?.folders || []
        fetchedFiles = filesRes?.data?.files || []
      }

      setCurrentFolder(folderInfo)
      setFolders(fetchedFolders)
      setFiles(fetchedFiles)
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Failed to load drive items')
    } finally {
      setIsLoading(false)
    }
  }, [initialFolderId, sortBy])


  const uploadFiles = async (selectedFiles, folderId = initialFolderId) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const filesArray = Array.from(selectedFiles)
    const totalSize = filesArray.reduce((acc, f) => acc + (f.size || 0), 0)
    const fileNames = filesArray.map((f) => ({
      name: f.name,
      size: f.size,
      mime_type: f.type,
    }))

    const startTime = performance.now()
    let lastLoaded = 0
    let lastTime = startTime

    setUploadStatus({
      isUploading: true,
      percent: 0,
      speed: 'Starting...',
      remainingTime: '',
      uploadedBytes: 0,
      totalBytes: totalSize,
      filesCount: filesArray.length,
      fileNames,
      isSuccess: false,
      error: null,
    })

    try {
      const formData = new FormData()
      formData.append('folder_id', folderId || '')
      filesArray.forEach((f) => formData.append('files', f))

      await API.post('/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent
          const currentTotal = total || totalSize
          const currentPercent = currentTotal > 0 ? Math.min(99, Math.round((loaded * 100) / currentTotal)) : 0

          const currentTime = performance.now()
          const timeDiff = (currentTime - lastTime) / 1000 // in seconds

          let currentSpeed = ''
          let remainingStr = ''

          if (timeDiff >= 0.25 || loaded === currentTotal) {
            const bytesDiff = loaded - lastLoaded
            const speedBytesPerSec = timeDiff > 0 ? bytesDiff / timeDiff : 0

            if (speedBytesPerSec > 1024 * 1024) {
              currentSpeed = `${(speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
            } else if (speedBytesPerSec > 1024) {
              currentSpeed = `${(speedBytesPerSec / 1024).toFixed(0)} KB/s`
            } else if (speedBytesPerSec > 0) {
              currentSpeed = `${Math.round(speedBytesPerSec)} B/s`
            }

            const remainingBytes = currentTotal - loaded
            if (speedBytesPerSec > 0 && remainingBytes > 0) {
              const secondsLeft = Math.ceil(remainingBytes / speedBytesPerSec)
              if (secondsLeft >= 60) {
                const mins = Math.floor(secondsLeft / 60)
                const secs = secondsLeft % 60
                remainingStr = `~${mins}m ${secs}s left`
              } else {
                remainingStr = `~${secondsLeft}s left`
              }
            }

            lastLoaded = loaded
            lastTime = currentTime
          }

          setUploadStatus((prev) => ({
            ...prev,
            percent: currentPercent,
            speed: currentSpeed || prev.speed,
            remainingTime: remainingStr || prev.remainingTime,
            uploadedBytes: loaded,
            totalBytes: currentTotal,
          }))
        },
      })

      setUploadStatus((prev) => ({
        ...prev,
        isUploading: false,
        percent: 100,
        speed: 'Completed',
        remainingTime: '',
        isSuccess: true,
      }))

      toast.success(`${filesArray.length} file${filesArray.length > 1 ? 's' : ''} uploaded successfully!`)
      fetchDriveData(folderId)
      if (refreshUser) refreshUser()

      // Auto dismiss success card after 4.5 seconds
      setTimeout(() => {
        setUploadStatus((prev) => (prev.isSuccess ? { ...prev, isSuccess: false } : prev))
      }, 4500)
    } catch (error) {
      const errMsg = error?.response?.data?.error || 'Failed to upload files'
      toast.error(errMsg)
      setUploadStatus((prev) => ({
        ...prev,
        isUploading: false,
        percent: 0,
        error: errMsg,
      }))
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
      if (refreshUser) refreshUser()
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
    currentFolder,
    isLoading,
    fetchDriveData,
    uploadFiles,
    uploadStatus,
    resetUploadStatus,
    createFolder,
    renameItem,
    moveItem,
    deleteItem,
    shareItem,
  }
}

export default useDrive
