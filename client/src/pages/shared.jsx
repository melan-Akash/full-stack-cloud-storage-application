import React, { useState, useEffect } from 'react'
import { Share2, Link2, Copy, Trash2, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'
import API from '../config/api'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

const SharedFiles = () => {
  const [sharedLinks, setSharedLinks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSharedLinks = async () => {
    setIsLoading(true)
    try {
      const res = await API.get('/api/share/my-links')
      setSharedLinks(res.data.links || [])
    } catch (error) {
      toast.error('Failed to load shared links')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSharedLinks()
  }, [])

  const copyLinkToClipboard = (token) => {
    const fullUrl = `${window.location.origin}/s/${token}`
    navigator.clipboard.writeText(fullUrl)
    toast.success('Link copied to clipboard')
  }

  const handleRevokeShare = async (shareId) => {
    try {
      await API.delete(`/api/share/${shareId}`)
      toast.success('Share link revoked')
      setSharedLinks((prev) => prev.filter((item) => item.id !== shareId))
    } catch (error) {
      toast.error('Failed to revoke link')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-xl">
          <Share2 className="w-6 h-6 text-orange-600" />
          <h2>Shared Links</h2>
        </div>
        <p className="text-slate-500 text-sm mt-1">
          Manage all active public share links created for your files and folders.
        </p>
      </div>

      {/* Shared Links List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Spinner size="lg" />
          <p className="mt-3 text-sm">Loading shared links...</p>
        </div>
      ) : sharedLinks.length === 0 ? (
        <EmptyState
          title="No active shared links"
          description="Select any file or folder in your drive and generate a shareable link."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3.5">Item Name</th>
                  <th className="px-6 py-3.5">Access Type</th>
                  <th className="px-6 py-3.5">Created Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {sharedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      <Link2 className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="truncate max-w-xs">{link.itemName || 'Shared Item'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        {link.permission || 'Public View'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => copyLinkToClipboard(link.token)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={`/s/${link.token}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Open Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleRevokeShare(link.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Revoke Share Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default SharedFiles