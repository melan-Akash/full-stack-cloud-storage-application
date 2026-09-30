import React, { useState, useEffect } from 'react'
import { Clock, LayoutGrid, List } from 'lucide-react'
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

const Recent = () => {
  const { viewMode, setViewMode, searchQuery, toggleStar, refreshUser } = useApp()
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  // Modal State
  const [selectedItemForRename, setSelectedItemForRename] = useState(null)
  const [selectedItemForMove, setSelectedItemForMove] = useState(null)
  const [selectedItemForShare, setSelectedItemForShare] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)

  const fetchRecentFiles = async () => {
    setIsLoading(true)
    try {
      const res = await API.get('/api/files', { params: { sort: 'date' } })
      setFiles(res.data?.files || [])
    } catch {
      toast.error('Failed to load recent files')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentFiles()
  }, [])

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  )

  const isAllSelected = filteredFiles.length > 0 && selectedIds.length === filteredFiles.length

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredFiles.map((item) => item.id))
    }
  }

  const selectedObjects = filteredFiles.filter((item) => selectedIds.includes(item.id))

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedObjects.length === 0) return
    const toastId = toast.loading(`Moving ${selectedObjects.length} files to trash...`)
    try {
      for (const item of selectedObjects) {
        await API.delete(`/api/files/${item.id}`).catch(() => {})
      }
      toast.success('Selected files moved to trash', { id: toastId })
      setSelectedIds([])
      fetchRecentFiles()
      if (refreshUser) refreshUser()
    } catch {
      toast.error('Failed to delete some files', { id: toastId })
    }
  }

  const handleBulkStar = () => {
    selectedIds.forEach((id) => toggleStar(id))
    setSelectedIds([])
  }

  // Single Item Actions
  const handleRename = async (id, newName) => {
    try {
      await API.post(`/api/files/${id}/rename`, { name: newName })
      toast.success('File renamed!')
      fetchRecentFiles()
    } catch {
      toast.error('Rename failed')
    }
  }

  const handleMove = async (id, targetFolderId) => {
    try {
      await API.post(`/api/files/${id}/move`, { target_folder: targetFolderId })
      toast.success('File moved!')
      fetchRecentFiles()
    } catch {
      toast.error('Move failed')
    }
  }

  const handleDelete = async (item) => {
    try {
      await API.delete(`/api/files/${item.id}`)
      toast.success('Moved to trash')
      fetchRecentFiles()
      if (refreshUser) refreshUser()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleShare = async (id, config) => {
    try {
      const { data } = await API.post('/api/shares', {
        resource_id: id,
        resource_type: 'file',
        permission: config.permission || 'download',
      })
      toast.success('Share link generated!')
      return data?.share || data?.share_link
    } catch {
      toast.error('Share link failed')
      return null
    }
  }

  const isEmpty = !isLoading && filteredFiles.length === 0

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xl">
            <Clock className="w-6 h-6 text-orange-600" />
            <h2>Recent Files</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Files uploaded or modified recently across all your folders.
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
          <p className="mt-3 text-sm">Loading recent files...</p>
        </div>
      ) : isEmpty ? (
        <EmptyState
          title={searchQuery ? 'No matching recent files' : 'No recent files'}
          description="Files you upload will appear here chronologically for quick access."
        />
      ) : viewMode === 'list' ? (
        <FileTable
          folders={[]}
          files={filteredFiles}
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
          folders={[]}
          files={filteredFiles}
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
          onRename={(id, newName) => handleRename(id, newName)}
        />
      )}

      {selectedItemForMove && (
        <MoveModal
          item={selectedItemForMove}
          currentFolderId={null}
          onClose={() => setSelectedItemForMove(null)}
          onMove={(id, targetFolderId) => handleMove(id, targetFolderId)}
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

export default Recent
