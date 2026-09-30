import React, { useState, useRef, useEffect } from 'react'
import { UploadCloud, FileUp } from 'lucide-react'

const DragDropZone = ({ onDropFiles, folderName = 'My Drive', children }) => {
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      onDropFiles(Array.from(files))
    }
  }

  useEffect(() => {
    // Reset if window drag ends outside
    const handleWindowDragEnd = () => {
      dragCounter.current = 0
      setIsDragging(false)
    }
    window.addEventListener('dragend', handleWindowDragEnd)
    return () => window.removeEventListener('dragend', handleWindowDragEnd)
  }, [])

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative min-h-[calc(100vh-8rem)] w-full"
    >
      {/* Wrapped Content */}
      {children}

      {/* Glassmorphism Drag & Drop Active Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-white/85 backdrop-blur-md border-3 border-dashed border-orange-500 rounded-3xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-200 pointer-events-none shadow-2xl">
          <div className="relative flex items-center justify-center mb-5">
            <div className="absolute w-24 h-24 bg-orange-500/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-orange-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/30 transform transition-transform animate-bounce">
              <UploadCloud className="w-10 h-10" />
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight text-center">
            Drop files to upload
          </h3>
          <p className="mt-2 text-sm sm:text-base text-slate-600 text-center max-w-sm">
            Release your files to upload directly to{' '}
            <span className="font-semibold text-orange-600 underline underline-offset-2">
              {folderName}
            </span>
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <span className="px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-700">
              Multiple files supported
            </span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-600">
              All file formats
            </span>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-slate-600">
              Up to 100 MB per file
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default DragDropZone
