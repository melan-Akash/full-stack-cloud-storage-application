import React from 'react'
import { Search, ArrowUpDown, LogOut, Menu } from 'lucide-react'
import { useApp } from '../../context/appContext'
import { SORT_OPTIONS } from '../../assets/assets'
import Dropdown, { DropdownItem } from '../ui/Dropdown'

const Header = ({ onToggleMobileSidebar }) => {
  const { user, logout, searchQuery, setSearchQuery, sortBy, setSortBy } = useApp()

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'Sort'

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'A'

  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-30">
      {/* Left: Mobile Hamburger Toggle + Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden shrink-0 transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100/70 border border-slate-200/60 rounded-xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500 transition duration-150"
          />
        </div>
      </div>

      {/* Right Controls: Sort & User Profile */}
      <div className="flex items-center gap-3">
        {/* Sort Options Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Sort</span>
            </button>
          }
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => setSortBy(option.value)}
            >
              <span
                className={
                  sortBy === option.value ? 'font-semibold text-orange-600' : ''
                }
              >
                {option.label}
              </span>
            </DropdownItem>
          ))}
        </Dropdown>

        {/* User Avatar Circle */}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-orange-600 text-white font-semibold text-sm flex items-center justify-center hover:bg-orange-700 transition select-none"
            >
              {userInitial}
            </button>
          }
        >
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {user?.name || 'Alex Morgan'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email || 'alex.morgan@example.com'}
            </p>
          </div>
          <DropdownItem icon={LogOut} danger onClick={logout}>
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  )
}

export default Header
