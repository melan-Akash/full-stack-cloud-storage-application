import React, { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import Sidebar from './sidebar'
import Header from './header'
import CreateFolderModal from '../folders/createFolderModal'
import { useDrive } from '../../hooks/useDrive'

const DashboardLayout = () => {
  const { folderId } = useParams()
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const { createFolder, uploadFiles } = useDrive(folderId)

  return (
    <div className="min-h-screen flex bg-white text-slate-900">
      {/* Left Sidebar */}
      <Sidebar
        onOpenCreateFolder={() => setIsCreateFolderOpen(true)}
        onUploadFiles={(files) => uploadFiles(files, folderId)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#fafbfc]">
        {/* Top Header */}
        <Header />

        {/* Prototype Orange Banner from screenshot */}
        <div className="bg-orange-600 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center select-none shadow-xs">
          This is a sample UI platform designed exclusively for testing and prototyping.
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Create Folder Modal triggerable from Sidebar */}
      {isCreateFolderOpen && (
        <CreateFolderModal
          isOpen={isCreateFolderOpen}
          onClose={() => setIsCreateFolderOpen(false)}
          onCreate={(name) => createFolder(name, folderId)}
        />
      )}
    </div>
  )
}

export default DashboardLayout
