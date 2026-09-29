import React, { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'

const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!folderName.trim()) return
    setIsLoading(true)
    await onCreate(folderName.trim())
    setIsLoading(false)
    setFolderName('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Folder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Folder Name"
          placeholder="Untitled Folder"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          autoFocus
          required
        />
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CreateFolderModal
