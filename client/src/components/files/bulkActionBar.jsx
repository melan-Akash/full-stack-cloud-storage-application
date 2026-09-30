import React, { useState } from 'react'
import {
  X,
  Trash2,
  FolderInput,
  Archive,
  Star,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react'
import JSZip from 'jszip'
import { toast } from 'react-hot-toast'
import API from '../../config/api'

const BulkActionBar = ({
  selectedItems = [],
  onClearSelection,
  onSelectAll,
  isAllSelected,
  onDeleteSelected,
  onMoveSelected,
  onStarSelected,
}) => {
  const [isZipping, setIsZipping] = useState(false)
  const [zipProgress, setZipProgress] = useState(0)

  if (!selectedItems || selectedItems.length === 0) return null

  const selectedCount = selectedItems.length
  const filesOnly = selectedItems.filter((item) => Boolean(item.mime_type))

  // Download all selected files as a .zip file
  const handleDownloadZip = async () => {
    if (filesOnly.length === 0) {
      toast.error('Only files can be bundled into a zip archive')
      return
    }

    setIsZipping(true)
    setZipProgress(10)
    const toastId = toast.loading(`Preparing zip archive (${filesOnly.length} files)...`)

    try {
      const zip = new JSZip()
      const folder = zip.folder('Drivea_Export')

      let completed = 0

      for (const file of filesOnly) {
        try {
          // Get presigned preview/download URL
          const res = await API.get(`/api/files/${file.id}/preview`)
          const downloadUrl = res.data?.downloadUrl || res.data?.preview_url

          if (downloadUrl) {
            // Fetch blob data
            const fileRes = await fetch(downloadUrl)
            const blob = await fileRes.blob()
            folder.file(file.name, blob)
          }
        } catch (fileErr) {
          console.warn(`Failed to fetch file ${file.name} for zipping`, fileErr)
        }

        completed += 1
        setZipProgress(Math.round(10 + (completed / filesOnly.length) * 70))
      }

      toast.loading('Compressing zip archive...', { id: toastId })
      const content = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => {
          setZipProgress(Math.round(80 + (metadata.percent * 0.2)))
        }
      )

      // Trigger browser download
      const blobUrl = URL.createObjectURL(content)
      const downloadLink = document.createElement('a')
      downloadLink.href = blobUrl
      downloadLink.download = `Drivea_Export_${Date.now()}.zip`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      downloadLink.remove()
      URL.revokeObjectURL(blobUrl)

      toast.success('Zip archive downloaded!', { id: toastId })
    } catch (err) {
      console.error('Zip generation failed:', err)
      toast.error('Failed to create zip file', { id: toastId })
    } finally {
      setIsZipping(false)
      setZipProgress(0)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92%] sm:w-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 sm:gap-6 backdrop-blur-lg">
        {/* Left Count & Select All */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onSelectAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition px-2 py-1 rounded-lg hover:bg-slate-800"
            title={isAllSelected ? 'Deselect All' : 'Select All'}
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </span>
          </button>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
              {selectedCount}
            </span>
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              selected
            </span>
          </div>
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Download as ZIP */}
          {filesOnly.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95 disabled:opacity-50"
              title="Download as .ZIP archive"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  <span className="hidden sm:inline">{zipProgress}%</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5 text-orange-400" />
                  <span>Download .ZIP</span>
                </>
              )}
            </button>
          )}

          {/* Star / Unstar Action */}
          {onStarSelected && (
            <button
              type="button"
              onClick={onStarSelected}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
              title="Star / Unstar selected items"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Star</span>
            </button>
          )}

          {/* Bulk Move Action */}
          {onMoveSelected && (
            <button
              type="button"
              onClick={onMoveSelected}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
              title="Move selected items to folder"
            >
              <FolderInput className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Move</span>
            </button>
          )}

          {/* Bulk Delete Action */}
          {onDeleteSelected && (
            <button
              type="button"
              onClick={onDeleteSelected}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition active:scale-95"
              title="Move selected items to Trash"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trash</span>
            </button>
          )}
        </div>

        {/* Right Close Button */}
        <button
          type="button"
          onClick={onClearSelection}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Clear Selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default BulkActionBar
