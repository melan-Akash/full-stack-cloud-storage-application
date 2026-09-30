import express from 'express'
import {
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

router.post('/', createFolder)
router.get('/root', getRootContent)
router.get('/:id', getFolderById)
router.patch('/:id', renameFolder)
router.patch('/:id/move', moveFolder)
router.delete('/:id', deleteFolder)

export default router