import express from 'express'
import {
  uploadFiles,
  getFilePreview,
  renameFile,
  moveFile,
  deleteFile
} from '../controllers/fileController.js'
import { protect } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.use(protect)

router.post('/upload', upload.array('files'), uploadFiles)
router.get('/:id', getFilePreview)
router.patch('/:id', renameFile)
router.patch('/:id/move', moveFile)
router.delete('/:id', deleteFile)

export default router