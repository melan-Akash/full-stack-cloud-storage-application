import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Spinner from '../ui/Spinner'
import { Download } from 'lucide-react'
import { formatBytes } from '../../assets/assets'
import API from '../../config/api'

const FilePreview = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(file?.downloadUrl || file?.preview_url || file?.url || '')
  const [isLoading, setIsLoading] = useState(!previewUrl)

  useEffect(() => {
    let isMounted = true

    const loadRealPreviewUrl = async () => {
      if (!file?.id) return
      if (file?.downloadUrl || file?.preview_url) {
        setPreviewUrl(file.downloadUrl || file.preview_url)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const res = await API.get(`/api/files/${file.id}/preview`)
        if (isMounted) {
          const url = res.data?.downloadUrl || res.data?.preview_url || ''
          setPreviewUrl(url)
        }
      } catch (err) {
        console.error('Failed to load file preview URL:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRealPreviewUrl()

    return () => {
      isMounted = false
    }
  }, [file])

  if (!file) return null

  const mime = file.mime_type || ''
  const isImage = mime.startsWith('image/')
  const isVideo = mime.startsWith('video/')
  const isAudio = mime.startsWith('audio/')
  const isPdf = mime === 'application/pdf'

  return (
    <Modal isOpen={Boolean(file)} onClose={onClose} title={file.name} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="w-full min-h-70 max-h-115 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-white">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-slate-400">
              <Spinner size="md" />
              <p className="mt-2 text-xs">Loading secure preview...</p>
            </div>
          ) : isImage && previewUrl ? (
            <img src={previewUrl} alt={file.name} className="max-h-110 w-auto object-contain" />
          ) : isVideo && previewUrl ? (
            <video src={previewUrl} controls className="max-h-110 w-full" />
          ) : isAudio && previewUrl ? (
            <audio src={previewUrl} controls className="w-full px-6" />
          ) : isPdf && previewUrl ? (
            <iframe src={previewUrl} title={file.name} className="w-full h-110" />
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-400 text-sm">Preview not available for this file type</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            <span>Size: {formatBytes(file.size)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {previewUrl && (
              <a
                href={previewUrl}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default FilePreview
