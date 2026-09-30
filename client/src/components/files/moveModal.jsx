import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import API from '../../config/api'
import { Folder, HardDrive } from 'lucide-react'

const MoveModal = ({ item, currentFolderId, onClose, onMove }) => {
  const [folders, setFolders] = useState([])
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAllFolders = async () => {
      try {
        const { data } = await API.get('/api/folders')
        const all = data?.folders || []
        // Filter out the current item if it is a folder (can't move folder into itself)
        const valid = all.filter((f) => f.id !== item?.id)
        setFolders(valid)
      } catch (err) {
        // ignore
      }
    }
    fetchAllFolders()
  }, [item])

  if (!item) return null

  const isFolder = !item.mime_type

  const handleMove = async () => {
    setIsLoading(true)
    await onMove(item.id, selectedFolderId, isFolder)
    setIsLoading(false)
    onClose()
  }

  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={`Move "${item.name}"`}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">Select destination folder:</p>

        <div className="max-h-60 overflow-y-auto space-y-1.5 border border-slate-200 rounded-xl p-2">
          {/* Root Option */}
          <div
            onClick={() => setSelectedFolderId(null)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
              selectedFolderId === null
                ? 'bg-orange-50 text-orange-600 font-medium'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <HardDrive className="w-4 h-4 text-orange-600 shrink-0" />
            <span>My Drive (Root)</span>
          </div>

          {folders.map((f) => (
            <div
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm transition ${
                selectedFolderId === f.id
                  ? 'bg-orange-50 text-orange-600 font-medium'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Folder className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleMove} isLoading={isLoading}>
            Move Here
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default MoveModal
