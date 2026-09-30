import React, { useRef } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { HardDrive, Users, Trash2, Plus, FolderPlus, Upload } from 'lucide-react'
import { useApp } from '../../context/appContext'
import { formatBytes } from '../../assets/assets'
import ProgressBar from '../ui/ProgressBar'
import Dropdown, { DropdownItem } from '../ui/Dropdown'

const Sidebar = ({ onOpenCreateFolder, onUploadFiles }) => {
  const { user } = useApp()
  const fileInputRef = useRef(null)

  const storageUsed = user?.storage_used !== undefined ? Number(user.storage_used) : 0
  const storageLimit = user?.storage_limit ? Number(user.storage_limit) : 1073741824
  const percentage = Math.min(100, Math.round((storageUsed / storageLimit) * 100))

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    if (selected.length > 0 && onUploadFiles) {
      onUploadFiles(selected)
    }
  }

  const navItems = [
    { name: 'My Drive', path: '/', icon: HardDrive, exact: true },
    { name: 'Shared Files', path: '/shared', icon: Users },
    { name: 'Trash', path: '/trash', icon: Trash2 },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-6 select-none shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Logo Header */}
        <Link to="/" className="flex items-center gap-3 px-1 py-2">
          <img src="/logo.svg" alt="Drivea Logo" className="h-8 w-auto" />
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-wider text-slate-900 leading-none">
              DRIVEA
            </span>
            <span className="text-[10px] tracking-widest text-slate-400 font-semibold mt-1">
              CLOUD STORAGE
            </span>
          </div>
        </Link>

        {/* New Item Button with Dropdown */}
        <div className="mt-8 mb-6">
          <Dropdown
            className="w-48"
            align="left"
            trigger={
              <button
                type="button"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition duration-150 active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm font-semibold">New Item</span>
              </button>
            }
          >
            <DropdownItem
              icon={FolderPlus}
              onClick={onOpenCreateFolder}
            >
              New Folder
            </DropdownItem>
            <DropdownItem
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Files
            </DropdownItem>
          </Dropdown>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                  isActive
                    ? 'bg-orange-50/80 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-orange-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-600 rounded-l-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Storage Indicator */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-700 mb-2 font-medium">
          <span>Storage</span>
          <span className="font-semibold text-slate-800">{percentage}%</span>
        </div>

        <ProgressBar progress={percentage} className="h-2" color="bg-orange-600" />

        <p className="mt-2 text-xs text-slate-400">
          {formatBytes(storageUsed)} of {formatBytes(storageLimit)} used
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Built by</span>
          <a
            href="https://melanakash.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:underline font-medium"
          >
            Melan Akash ↗
          </a>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
