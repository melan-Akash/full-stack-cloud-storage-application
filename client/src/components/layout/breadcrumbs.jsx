import React from 'react'
import { Link } from 'react-router-dom'
import { HardDrive, ChevronRight } from 'lucide-react'

const Breadcrumbs = ({ currentFolderId, folderName }) => {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 text-xs sm:text-sm font-medium text-slate-800 hover:bg-orange-100 transition-colors"
      >
        <HardDrive className="w-3.5 h-3.5 text-orange-600" />
        <span>My Drive</span>
      </Link>
      {folderName && (
        <>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="px-3 py-1.5 rounded-full bg-slate-100 text-xs sm:text-sm font-medium text-slate-800 max-w-32.5 sm:max-w-xs truncate inline-block" title={folderName}>
            {folderName}
          </span>
        </>
      )}
    </div>
  )
}

export default Breadcrumbs
