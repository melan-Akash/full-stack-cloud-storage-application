import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder, Star, CheckSquare, Square } from 'lucide-react'
import ItemDropdown from '../ui/ItemDropdown'
import { useApp } from '../../context/appContext'

const FolderCard = ({
  folder,
  isSelected = false,
  onToggleSelect,
  onRename,
  onMove,
  onShare,
  onDelete,
}) => {
  const navigate = useNavigate()
  const { isStarred, toggleStar } = useApp()
  const starred = isStarred(folder.id)

  const handleCardClick = () => {
    navigate(`/drive/${folder.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between border transition-all cursor-pointer group select-none ${
        isSelected
          ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/30'
          : 'border-slate-200/80 hover:border-orange-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Checkbox */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(folder.id)
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

        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
          <Folder className="w-5 h-5 fill-orange-500/20 text-orange-600" />
        </div>
        <span className="text-sm font-semibold text-slate-800 truncate">
          {folder.name}
        </span>
      </div>

      {/* Right controls: Star & Dropdown */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => toggleStar(folder.id)}
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
          item={folder}
          onRename={onRename}
          onMove={onMove}
          onShare={onShare}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

export default FolderCard
