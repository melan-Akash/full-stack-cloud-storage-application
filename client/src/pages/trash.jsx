import React, { useState, useEffect } from 'react'
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import API from '../config/api'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const Trash = () => {
  const [trashedItems, setTrashedItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false)
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false)

  const fetchTrash = async () => {
    setIsLoading(true)
    try {
      const res = await API.get('/api/trash')
      setTrashedItems(res.data.items || [])
    } catch (error) {
      toast.error('Failed to load trash items')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTrash()
  }, [])

  const handleRestore = async (itemId, isFolder) => {
    try {
      await API.post(`/api/trash/restore`, { id: itemId, isFolder })
      toast.success('Item restored successfully')
      setTrashedItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      toast.error('Failed to restore item')
    }
  }

  const handlePermanentDelete = async (itemId, isFolder) => {
    try {
      await API.delete(`/api/trash/permanent`, { data: { id: itemId, isFolder } })
      toast.success('Item permanently deleted')
      setTrashedItems((prev) => prev.filter((item) => item.id !== itemId))
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  const handleEmptyTrash = async () => {
    setIsEmptyingTrash(true)
    try {
      await API.delete('/api/trash/empty')
      toast.success('Trash emptied completely')
      setTrashedItems([])
      setShowConfirmEmpty(false)
    } catch (error) {
      toast.error('Failed to empty trash')
    } finally {
      setIsEmptyingTrash(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Title & Clear Trash Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-xl">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2>Trash Bin</h2>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Items in trash can be restored or permanently removed.
          </p>
        </div>

        {trashedItems.length > 0 && (
          <button
            onClick={() => setShowConfirmEmpty(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-2xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {/* Trash Items Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Spinner size="lg" />
          <p className="mt-3 text-sm">Loading deleted items...</p>
        </div>
      ) : trashedItems.length === 0 ? (
        <EmptyState
          title="Trash is empty"
          description="Items you delete will show up here before permanent removal."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trashedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <p className="font-medium text-slate-900 text-sm truncate">{item.name}</p>
                <p className="text-xs text-slate-400">
                  Deleted: {new Date(item.deleted_at || item.deletedAt || item.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleRestore(item.id, item.isFolder)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => handlePermanentDelete(item.id, item.isFolder)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Permanently"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Empty Dialog */}
      {showConfirmEmpty && (
        <ConfirmDialog
          isOpen={showConfirmEmpty}
          title="Empty Trash Bin?"
          description="All items in the trash will be permanently deleted. This action cannot be undone."
          confirmLabel="Empty Trash"
          isDanger
          isLoading={isEmptyingTrash}
          onConfirm={handleEmptyTrash}
          onClose={() => setShowConfirmEmpty(false)}
        />
      )}
    </div>
  )
}

export default Trash
