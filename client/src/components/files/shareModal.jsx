import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { copyShareLink } from '../../assets/assets'
import { Copy, Link2 } from 'lucide-react'

const ShareModal = ({ item, onClose, onShare }) => {
  const [permission, setPermission] = useState('download')
  const [createdLink, setCreatedLink] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!item) return null

  const handleGenerate = async () => {
    setIsLoading(true)
    const result = await onShare(item.id, {
      resource_type: item.mime_type ? 'file' : 'folder',
      permission,
    })
    setIsLoading(false)
    if (result?.token) {
      setCreatedLink(result.token)
    }
  }

  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={`Share "${item.name}"`}>
      <div className="space-y-4">
        {!createdLink ? (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Permission
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600"
              >
                <option value="download">Can view and download</option>
                <option value="view">View only (no download)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleGenerate} isLoading={isLoading}>
                Generate Link
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs text-slate-600 truncate font-mono">
                {window.location.origin}/s/{createdLink}
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => copyShareLink(createdLink)}
                icon={Copy}
              >
                Copy
              </Button>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ShareModal
