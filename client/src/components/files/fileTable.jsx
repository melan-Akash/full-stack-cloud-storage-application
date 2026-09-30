import React from 'react'
import { Link } from 'react-router-dom'
import {
  Folder,
  Star,
  Download,
  Share2,
  MoreVertical,
  Pencil,
  FolderInput,
  Trash2,
  CheckSquare,
  Square,
  Eye,
} from 'lucide-react'
import { formatBytes, getFileIcon } from '../../assets/assets'
import Dropdown, { DropdownItem } from '../ui/Dropdown'
import { useApp } from '../../context/appContext'

const FileTable = ({
  folders = [],
  files = [],
  selectedIds = [],
  onToggleSelect,
  onSelectAll,
  isAllSelected,
  onRename,
  onMove,
  onShare,
  onDelete,
  onPreview,
}) => {
  const { isStarred, toggleStar } = useApp()

  const allItems = [
    ...folders.map((f) => ({ ...f, isFolder: true })),
    ...files.map((f) => ({ ...f, isFolder: false })),
  ]

  if (allItems.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider select-none">
              <th className="w-12 px-4 py-3.5 text-center">
                <button
                  type="button"
                  onClick={onSelectAll}
                  className="text-slate-400 hover:text-slate-700 transition"
                  title={isAllSelected ? 'Deselect All' : 'Select All'}
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-orange-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3.5">Name</th>
              <th className="px-4 py-3.5 hidden md:table-cell">Type</th>
              <th className="px-4 py-3.5 hidden sm:table-cell">Size</th>
              <th className="px-4 py-3.5 hidden lg:table-cell">Modified</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Folders First */}
            {folders.map((folder) => {
              const isSelected = selectedIds.includes(folder.id)
              const starred = isStarred(folder.id)

              return (
                <tr
                  key={folder.id}
                  className={`group transition-colors ${
                    isSelected
                      ? 'bg-orange-50/80'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(folder.id)}
                      className="text-slate-400 hover:text-slate-700 transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Square className="w-4 h-4 group-hover:opacity-100 opacity-40 transition" />
                      )}
                    </button>
                  </td>

                  {/* Name & Star */}
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStar(folder.id)
                        }}
                        className="text-slate-300 hover:text-amber-400 transition shrink-0"
                        title={starred ? 'Starred' : 'Add to Starred'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            starred
                              ? 'text-amber-400 fill-amber-400'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </button>

                      <Link
                        to={`/drive/${folder.id}`}
                        className="flex items-center gap-2.5 min-w-0 hover:text-orange-600 transition"
                      >
                        <Folder className="w-5 h-5 text-orange-500 shrink-0 fill-orange-500/20" />
                        <span className="truncate max-w-xs sm:max-w-md font-semibold">
                          {folder.name}
                        </span>
                      </Link>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                    Folder
                  </td>

                  {/* Size */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden sm:table-cell">
                    —
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                    {new Date(folder.created_at || folder.createdAt || Date.now()).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onShare(folder)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <Dropdown
                        align="right"
                        trigger={
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      >
                        <DropdownItem
                          icon={Pencil}
                          onClick={() => onRename(folder)}
                        >
                          Rename
                        </DropdownItem>
                        <DropdownItem
                          icon={FolderInput}
                          onClick={() => onMove(folder)}
                        >
                          Move
                        </DropdownItem>
                        <DropdownItem
                          icon={Trash2}
                          danger
                          onClick={() => onDelete(folder)}
                        >
                          Move to Trash
                        </DropdownItem>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              )
            })}

            {/* Files */}
            {files.map((file) => {
              const isSelected = selectedIds.includes(file.id)
              const starred = isStarred(file.id)

              return (
                <tr
                  key={file.id}
                  className={`group transition-colors ${
                    isSelected
                      ? 'bg-orange-50/80'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleSelect(file.id)}
                      className="text-slate-400 hover:text-slate-700 transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-600" />
                      ) : (
                        <Square className="w-4 h-4 group-hover:opacity-100 opacity-40 transition" />
                      )}
                    </button>
                  </td>

                  {/* Name & Star */}
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStar(file.id)
                        }}
                        className="text-slate-300 hover:text-amber-400 transition shrink-0"
                        title={starred ? 'Starred' : 'Add to Starred'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            starred
                              ? 'text-amber-400 fill-amber-400'
                              : 'opacity-0 group-hover:opacity-100'
                          }`}
                        />
                      </button>

                      <div
                        onClick={() => onPreview(file)}
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:text-orange-600 transition"
                      >
                        <div className="shrink-0">
                          {getFileIcon(file.mime_type, 'w-5 h-5')}
                        </div>
                        <span className="truncate max-w-xs sm:max-w-md font-medium">
                          {file.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell uppercase font-mono">
                    {file.name.split('.').pop() || 'FILE'}
                  </td>

                  {/* Size */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden sm:table-cell font-mono">
                    {formatBytes(file.size)}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                    {new Date(file.created_at || file.createdAt || Date.now()).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onPreview(file)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onShare(file)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <Dropdown
                        align="right"
                        trigger={
                          <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      >
                        <DropdownItem
                          icon={Download}
                          onClick={() => onPreview(file)}
                        >
                          Download
                        </DropdownItem>
                        <DropdownItem
                          icon={Pencil}
                          onClick={() => onRename(file)}
                        >
                          Rename
                        </DropdownItem>
                        <DropdownItem
                          icon={FolderInput}
                          onClick={() => onMove(file)}
                        >
                          Move
                        </DropdownItem>
                        <DropdownItem
                          icon={Trash2}
                          danger
                          onClick={() => onDelete(file)}
                        >
                          Move to Trash
                        </DropdownItem>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FileTable
