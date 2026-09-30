import React from 'react'
import FolderCard from '../folders/folderCard'
import FileCard from './fileCard'

const FileGrid = ({
  folders = [],
  files = [],
  selectedIds = [],
  onToggleSelect,
  onRename,
  onMove,
  onShare,
  onDelete,
  onPreview,
}) => {
  return (
    <div className="space-y-8">
      {/* Folders Section */}
      {folders.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
            FOLDERS ({folders.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                isSelected={selectedIds.includes(folder.id)}
                onToggleSelect={onToggleSelect}
                onRename={onRename}
                onMove={onMove}
                onShare={onShare}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      {files.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-3">
            FILES ({files.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedIds.includes(file.id)}
                onToggleSelect={onToggleSelect}
                onRename={onRename}
                onMove={onMove}
                onShare={onShare}
                onDelete={onDelete}
                onPreview={onPreview}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileGrid
