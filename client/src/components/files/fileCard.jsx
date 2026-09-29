import React from 'react'
import { getFileIcon, formatBytes } from '../../assets/assets'
import ItemDropdown from '../ui/ItemDropdown'

const FileCard = ({ file, onRename, onMove, onShare, onDelete, onPreview }) => {
  const formattedDate = file.created_at
    ? new Date(file.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''

  return (
    <div
      onClick={() => onPreview && onPreview(file)}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group select-none min-h-35"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          {getFileIcon(file.mime_type, 'w-5 h-5')}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <ItemDropdown
            item={file}
            onPreview={onPreview}
            onRename={onRename}
            onMove={onMove}
            onShare={onShare}
            onDelete={onDelete}
          />
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-slate-800 truncate" title={file.name}>
          {file.name}
        </h4>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>{formatBytes(file.size)}</span>
          <span className="italic">{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}

export default FileCard
