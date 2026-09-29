import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

const RenameModal = ({ item, onClose, onRename }) => {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setName(item.name || '')
    }
  }, [item])

  if (!item) return null

  const isFolder = !item.mime_type

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsLoading(true)
    await onRename(item.id, name.trim(), isFolder)
    setIsLoading(false)
    onClose()
  }

  return (
    <Modal isOpen={Boolean(item)} onClose={onClose} title={`Rename ${isFolder ? 'Folder' : 'File'}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Rename
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default RenameModal
