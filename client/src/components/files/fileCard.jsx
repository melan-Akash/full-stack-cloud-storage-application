import React from 'react'
import { Star, CheckSquare, Square } from 'lucide-react'
import { getFileIcon, formatBytes } from '../../assets/assets'
import ItemDropdown from '../ui/ItemDropdown'
import { useApp } from '../../context/appContext'

const FileCard = ({
  file,
  isSelected = false,
  onToggleSelect,
  onRename,
  onMove,
  onShare,
  onDelete,
  onPreview,
}) => {
  const { isStarred, toggleStar } = useApp()
  const starred = isStarred(file.id)

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
      className={`relative bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all cursor-pointer group select-none min-h-36 ${
        isSelected
          ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
          : 'border-slate-200/80 hover:border-orange-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {/* Checkbox */}
          {onToggleSelect && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleSelect(file.id)
              }}
              className={`transition shrink-0 ${
                isSelected
                  ? 'opacity-100 text-orange-600'
                  : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600'
              }`}
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-orange-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {getFileIcon(file.mime_type, 'w-5 h-5')}
          </div>
        </div>

        {/* Right controls: Star & Dropdown */}
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => toggleStar(file.id)}
            className={`p-1.5 rounded-lg transition ${
              starred
                ? 'text-amber-400 hover:text-amber-500'
                : 'text-slate-300 hover:text-amber-400 opacity-0 group-hover:opacity-100'
            }`}
            title={starred ? 'Starred' : 'Add to Starred'}
          >
            <Star className={`w-4 h-4 ${starred ? 'fill-amber-400' : ''}`} />
          </button>

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
        <h4 className="text-sm font-semibold text-slate-800 truncate" title={file.name}>
          {file.name}
        </h4>

        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span className="font-mono">{formatBytes(file.size)}</span>
          <span className="italic">{formattedDate}</span>
        </div>
      </div>
    </div>
  )
}

export default FileCard
