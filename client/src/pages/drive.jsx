import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FolderPlus, Upload, LayoutGrid, List } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Breadcrumbs from '../components/layout/breadcrumbs'
import FileGrid from '../components/files/fileGrid'
import FileTable from '../components/files/fileTable'
import BulkActionBar from '../components/files/bulkActionBar'
import EmptyState from '../components/ui/EmptyState'
import Spinner from '../components/ui/Spinner'
import CreateFolderModal from '../components/folders/createFolderModal'
import RenameModal from '../components/files/renameModal'
import MoveModal from '../components/files/moveModal'
import ShareModal from '../components/files/shareModal'
import FilePreview from '../components/files/filePreview'
import DragDropZone from '../components/files/dragDropZone'
import UploadProgressWidget from '../components/files/uploadProgressWidget'
import { useApp } from '../context/appContext'
import { useDrive } from '../hooks/useDrive'

const Drive = () => {
  const { folderId } = useParams()
  const { searchQuery, viewMode, setViewMode, toggleStar } = useApp()
  const {
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
  } = useDrive(folderId)

  // Selection & Modal State Management
  const [selectedIds, setSelectedIds] = useState([])
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [selectedItemForRename, setSelectedItemForRename] = useState(null)
  const [selectedItemForMove, setSelectedItemForMove] = useState(null)
  const [selectedItemForShare, setSelectedItemForShare] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)

  useEffect(() => {
    fetchDriveData(folderId)
    setSelectedIds([]) // clear selection when changing folders
  }, [folderId, fetchDriveData])

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      uploadFiles(selectedFiles, folderId)
      e.target.value = '' // reset input for subsequent selections
    }
  }

  // Filter folders and files based on Search Query
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  )

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes((searchQuery || '').toLowerCase())
  )

  const allVisibleItems = [...filteredFolders, ...filteredFiles]
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

  const selectedObjects = allVisibleItems.filter((item) => selectedIds.includes(item.id))

  const handleBulkDelete = async () => {
    if (selectedObjects.length === 0) return
    const toastId = toast.loading(`Moving ${selectedObjects.length} items to trash...`)
    try {
      for (const item of selectedObjects) {
        await deleteItem(item)
      }
      setSelectedIds([])
      toast.success('Selected items moved to trash', { id: toastId })
    } catch {
      toast.error('Failed to delete some items', { id: toastId })
    }
  }

  const handleBulkStar = () => {
    selectedIds.forEach((id) => toggleStar(id))
    setSelectedIds([])
  }

  const isEmpty = !isLoading && filteredFolders.length === 0 && filteredFiles.length === 0
  const currentFolderName = currentFolder?.name || 'My Drive'

  return (
    <DragDropZone
      onDropFiles={(dropped) => uploadFiles(dropped, folderId)}
      folderName={currentFolderName}
    >
      <div className="space-y-6">
        {/* Top Action Header Bar with Breadcrumbs & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <Breadcrumbs currentFolderId={folderId} folderName={currentFolder?.name} />

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
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
                <span className="hidden md:inline">Grid</span>
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
                <span className="hidden md:inline">List</span>
              </button>
            </div>

            <button
              onClick={() => setIsCreateFolderOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FolderPlus className="w-4 h-4 text-slate-500" />
              <span>New Folder</span>
            </button>

            <label className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 transition-colors cursor-pointer shadow-2xs active:scale-[0.98]">
              <Upload className="w-4 h-4" />
              <span>Upload Files</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Drive Main Content View */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Spinner size="lg" />
            <p className="mt-3 text-sm font-medium text-slate-500">Loading your files...</p>
          </div>
        ) : isEmpty ? (
          <EmptyState
            title={searchQuery ? 'No matching files found' : 'This folder is empty'}
            description={
              searchQuery
                ? 'Try adjusting your search query'
                : 'Drag and drop files here, or click Upload Files to get started'
            }
            action={
              <button
                onClick={() => setIsCreateFolderOpen(true)}
                className="mt-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl transition"
              >
                Create Folder
              </button>
            }
          />
        ) : viewMode === 'list' ? (
          <FileTable
            folders={filteredFolders}
            files={filteredFiles}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            isAllSelected={isAllSelected}
            onRename={(item) => setSelectedItemForRename(item)}
            onMove={(item) => setSelectedItemForMove(item)}
            onShare={(item) => setSelectedItemForShare(item)}
            onDelete={(item) => deleteItem(item)}
            onPreview={(file) => setPreviewFile(file)}
          />
        ) : (
          <FileGrid
            folders={filteredFolders}
            files={filteredFiles}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onRename={(item) => setSelectedItemForRename(item)}
            onMove={(item) => setSelectedItemForMove(item)}
            onShare={(item) => setSelectedItemForShare(item)}
            onDelete={(item) => deleteItem(item)}
            onPreview={(file) => setPreviewFile(file)}
          />
        )}

        {/* Floating Bulk Action Bar */}
        <BulkActionBar
          selectedItems={selectedObjects}
          onClearSelection={() => setSelectedIds([])}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          onDeleteSelected={handleBulkDelete}
          onMoveSelected={
            selectedObjects.length === 1
              ? () => setSelectedItemForMove(selectedObjects[0])
              : undefined
          }
          onStarSelected={handleBulkStar}
        />

        {/* Action Modals */}
        {isCreateFolderOpen && (
          <CreateFolderModal
            isOpen={isCreateFolderOpen}
            onClose={() => setIsCreateFolderOpen(false)}
            onCreate={(name) => createFolder(name, folderId)}
          />
        )}

        {selectedItemForRename && (
          <RenameModal
            item={selectedItemForRename}
            onClose={() => setSelectedItemForRename(null)}
            onRename={(id, newName, isFolder) => renameItem(id, newName, isFolder)}
          />
        )}

        {selectedItemForMove && (
          <MoveModal
            item={selectedItemForMove}
            currentFolderId={folderId}
            onClose={() => setSelectedItemForMove(null)}
            onMove={(id, targetFolderId, isFolder) => moveItem(id, targetFolderId, isFolder)}
          />
        )}

        {selectedItemForShare && (
          <ShareModal
            item={selectedItemForShare}
            onClose={() => setSelectedItemForShare(null)}
            onShare={(id, config) => shareItem(id, config)}
          />
        )}

        {previewFile && (
          <FilePreview
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}

        {/* Live Upload Progress Floating Widget (Bottom-Right) */}
        <UploadProgressWidget
          uploadStatus={uploadStatus}
          onClose={resetUploadStatus}
        />
      </div>
    </DragDropZone>
  )
}

export default Drive