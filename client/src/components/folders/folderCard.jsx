import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Folder } from 'lucide-react'
import ItemDropdown from '../ui/ItemDropdown'

const FolderCard = ({ folder, onRename, onMove, onShare, onDelete }) => {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/drive/${folder.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer group select-none"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
          <Folder className="w-5 h-5 fill-orange-500/20 text-orange-600" />
        </div>
        <span className="text-sm font-medium text-slate-800 truncate">
          {folder.name}
        </span>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
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
