import React, { useState } from 'react'
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Clock,
  HardDrive
} from 'lucide-react'
import { formatBytes, getFileIcon } from '../../assets/assets'

const UploadProgressWidget = ({ uploadStatus, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (!uploadStatus.isUploading && !uploadStatus.isSuccess && !uploadStatus.error) {
    return null
  }

  const {
    isUploading,
    percent = 0,
    speed = '0 KB/s',
    remainingTime = '',
    uploadedBytes = 0,
    totalBytes = 0,
    filesCount = 0,
    fileNames = [],
    isSuccess = false,
    error = null,
  } = uploadStatus

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-96 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-200 text-slate-800">
        {/* Top Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-3 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200/70 flex items-center justify-between cursor-pointer select-none transition"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {isUploading ? (
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              </div>
            ) : isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}

            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {isUploading
                  ? `Uploading ${filesCount} file${filesCount > 1 ? 's' : ''}`
                  : isSuccess
                  ? `${filesCount} file${filesCount > 1 ? 's' : ''} uploaded`
                  : 'Upload error'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {isUploading
                  ? `${percent}% completed`
                  : isSuccess
                  ? 'All files saved to cloud'
                  : 'Check connection & retry'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Always visible) */}
        <div className="w-full bg-slate-100 h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-out ${
              isSuccess
                ? 'bg-emerald-500'
                : error
                ? 'bg-red-500'
                : 'bg-linear-to-r from-orange-500 to-amber-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Expanded Details Body */}
        {isExpanded && (
          <div className="p-4 space-y-3.5">
            {/* Live Stats Pill Row (Speed, Time, Total) */}
            {isUploading && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-orange-50/70 border border-orange-200/50 rounded-xl px-2.5 py-1.5 text-orange-900 font-medium">
                  <Zap className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">{speed}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{remainingTime || 'Estimating...'}</span>
                </div>
              </div>
            )}

            {/* Bytes Progress Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                <span>Transferred</span>
              </span>
              <span className="font-mono text-[11px] text-slate-600 font-semibold">
                {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
              </span>
            </div>

            {/* Error Message if any */}
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            {/* Files List */}
            {fileNames.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Files in queue
                </p>
                {fileNames.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-slate-50/80 hover:bg-slate-100/60 transition text-xs border border-slate-100"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="shrink-0">{getFileIcon(file.mime_type, 'w-4 h-4')}</div>
                      <span className="truncate font-medium text-slate-800 max-w-45">
                        {file.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400">{formatBytes(file.size)}</span>
                      {isUploading ? (
                        <div className="w-3 h-3 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                      ) : isSuccess ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadProgressWidget
