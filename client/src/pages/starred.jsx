import React, { useState, useEffect } from 'react'
import { Star, LayoutGrid, List } from 'lucide-react'
import { toast } from 'react-hot-toast'
import API from '../config/api'
import { useApp } from '../context/appContext'
import FileGrid from '../components/files/fileGrid'
import FileTable from '../components/files/fileTable'
import BulkActionBar from '../components/files/bulkActionBar'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import RenameModal from '../components/files/renameModal'
import MoveModal from '../components/files/moveModal'
import ShareModal from '../components/files/shareModal'
import FilePreview from '../components/files/filePreview'

const Starred = () => {
  const { starredIds, toggleStar, viewMode, setViewMode, searchQuery, refreshUser } = useApp()
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  // Modal State
  const [selectedItemForRename, setSelectedItemForRename] = useState(null)
  const [selectedItemForMove, setSelectedItemForMove] = useState(null)
  const [selectedItemForShare, setSelectedItemForShare] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)

  const fetchAllItems = async () => {
    setIsLoading(true)
    try {
      const [foldersRes, filesRes] = await Promise.all([
        API.get('/api/folders'),
        API.get('/api/files'),
      ])
      setFolders(foldersRes.data?.folders || [])
      setFiles(filesRes.data?.files || [])
    } catch {
      toast.error('Failed to load items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAllItems()
  }, [])

  // Filter only starred items
  const starredFolders = folders.filter((f) =>
    starredIds.includes(f.id) &&
    f.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  )

  const starredFiles = files.filter((f) =>
    starredIds.includes(f.id) &&
    f.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  )

  const allVisibleItems = [...starredFolders, ...starredFiles]
  const isAllSelected = allVisibleItems.length > 0 && selectedIds.length === allVisibleItems.length

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(allVisibleItems.map((item) => item.id))
    }
  }

  // Selected items objects
  const selectedObjects = allVisibleItems.filter((item) => selectedIds.includes(item.id))

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedObjects.length === 0) return
    const toastId = toast.loading(`Moving ${selectedObjects.length} items to trash...`)
    try {
      for (const item of selectedObjects) {
        const isFolder = !item.mime_type
        const endpoint = isFolder ? `/api/folders/${item.id}` : `/api/files/${item.id}`
        await API.delete(endpoint).catch(() => {})
      }
      toast.success('Selected items moved to trash', { id: toastId })
      setSelectedIds([])
      fetchAllItems()
      if (refreshUser) refreshUser()
    } catch {
      toast.error('Failed to delete some items', { id: toastId })
    }
  }

  // Bulk Star Toggle
  const handleBulkStar = () => {
    selectedIds.forEach((id) => toggleStar(id))
    setSelectedIds([])
  }

  // Single Item Actions
  const handleRename = async (id, newName, isFolder) => {
    try {
      const endpoint = isFolder ? `/api/folders/${id}/rename` : `/api/files/${id}/rename`
      await API.post(endpoint, { name: newName })
      toast.success('Renamed!')
      fetchAllItems()
    } catch {
      toast.error('Rename failed')
    }
  }

  const handleMove = async (id, targetFolderId, isFolder) => {
    try {
      const endpoint = isFolder ? `/api/folders/${id}/move` : `/api/files/${id}/move`
      const payload = isFolder ? { target_parent: targetFolderId } : { target_folder: targetFolderId }
      await API.post(endpoint, payload)
      toast.success('Moved!')
      fetchAllItems()
    } catch {
      toast.error('Move failed')
    }
  }

  const handleDelete = async (item) => {
    try {
      const isFolder = !item.mime_type
      const endpoint = isFolder ? `/api/folders/${item.id}` : `/api/files/${item.id}`
      await API.delete(endpoint)
      toast.success('Moved to trash')
      fetchAllItems()
      if (refreshUser) refreshUser()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleShare = async (id, config) => {
    try {
      const { data } = await API.post('/api/shares', {
        resource_id: id,
        resource_type: config.resource_type || (config.mime_type ? 'file' : 'folder'),
        permission: config.permission || 'download',
      })
      toast.success('Share link generated!')
      return data?.share || data?.share_link
    } catch {
      toast.error('Share link failed')
      return null
    }
  }

  const isEmpty = !isLoading && starredFolders.length === 0 && starredFiles.length === 0

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xl">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
            <h2>Starred Items</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Access your important starred files and folders anytime in one place.
          </p>
        </div>

        {/* View Mode Toggle Switcher */}
        {!isEmpty && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List (Table) View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Spinner size="lg" />
          <p className="mt-3 text-sm">Loading starred items...</p>
        </div>
      ) : isEmpty ? (
        <EmptyState
          title={searchQuery ? 'No matching starred items' : 'No starred items yet'}
          description="Click the star icon on any file or folder in your drive to bookmark it here."
        />
      ) : viewMode === 'list' ? (
        <FileTable
          folders={starredFolders}
          files={starredFiles}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          onRename={(item) => setSelectedItemForRename(item)}
          onMove={(item) => setSelectedItemForMove(item)}
          onShare={(item) => setSelectedItemForShare(item)}
          onDelete={handleDelete}
          onPreview={(file) => setPreviewFile(file)}
        />
      ) : (
        <FileGrid
          folders={starredFolders}
          files={starredFiles}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onRename={(item) => setSelectedItemForRename(item)}
          onMove={(item) => setSelectedItemForMove(item)}
          onShare={(item) => setSelectedItemForShare(item)}
          onDelete={handleDelete}
          onPreview={(file) => setPreviewFile(file)}
        />
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedItems={selectedObjects}
        onClearSelection={() => setSelectedIds([])}
        onSelectAll={handleSelectAll}
        isAllSelected={isAllSelected}
        onDeleteSelected={handleBulkDelete}
        onStarSelected={handleBulkStar}
      />

      {/* Modals */}
      {selectedItemForRename && (
        <RenameModal
          item={selectedItemForRename}
          onClose={() => setSelectedItemForRename(null)}
          onRename={(id, newName, isFolder) => handleRename(id, newName, isFolder)}
        />
      )}

      {selectedItemForMove && (
        <MoveModal
          item={selectedItemForMove}
          currentFolderId={null}
          onClose={() => setSelectedItemForMove(null)}
          onMove={(id, targetFolderId, isFolder) => handleMove(id, targetFolderId, isFolder)}
        />
      )}

      {selectedItemForShare && (
        <ShareModal
          item={selectedItemForShare}
          onClose={() => setSelectedItemForShare(null)}
          onShare={(id, config) => handleShare(id, config)}
        />
      )}

      {previewFile && (
        <FilePreview
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}

export default Starred
