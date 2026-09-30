import React from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { Download } from 'lucide-react'
import { formatBytes } from '../../assets/assets'

const FilePreview = ({ file, onClose }) => {
  if (!file) return null

  const mime = file.mime_type || ''
  const isImage = mime.startsWith('image/')
  const isVideo = mime.startsWith('video/')
  const isAudio = mime.startsWith('audio/')
  const isPdf = mime === 'application/pdf'

  const sampleUrl = isImage
    ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
    : isVideo
    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    : isAudio
    ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'

  return (
    <Modal isOpen={Boolean(file)} onClose={onClose} title={file.name} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="w-full min-h-70 max-h-115 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-white">
          {isImage ? (
            <img src={sampleUrl} alt={file.name} className="max-h-110 w-auto object-contain" />
          ) : isVideo ? (
            <video src={sampleUrl} controls className="max-h-110 w-full" />
          ) : isAudio ? (
            <audio src={sampleUrl} controls className="w-full px-6" />
          ) : isPdf ? (
            <iframe src={sampleUrl} title={file.name} className="w-full h-110" />
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
            <a
              href={sampleUrl}
              download={file.name}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default FilePreview
