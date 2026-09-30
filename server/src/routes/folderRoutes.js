import express from 'express'
import {
  getFolders,
  createFolder,
  getRootContent,
  getFolderById,
  renameFolder,
  moveFolder,
  deleteFolder
} from '../controllers/folderController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

// List & Create
router.get('/', getFolders)
router.post('/', createFolder)

// Special routes
router.get('/root', getRootContent)
router.get('/:id', getFolderById)

// Rename (support both POST and PATCH)
router.post('/:id/rename', renameFolder)
router.patch('/:id/rename', renameFolder)
router.patch('/:id', renameFolder)

// Move (support both POST and PATCH)
router.post('/:id/move', moveFolder)
router.patch('/:id/move', moveFolder)

// Delete (Soft delete to trash)
router.delete('/:id', deleteFolder)

export default router