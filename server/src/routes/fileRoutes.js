import express from 'express'
import {
  getFiles,
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

// List & Upload
router.get('/', getFiles)
router.post('/upload', upload.array('files'), uploadFiles)

// Preview / Download URL (support both /:id and /:id/preview)
router.get('/:id/preview', getFilePreview)
router.get('/:id', getFilePreview)

// Rename (support both POST and PATCH)
router.post('/:id/rename', renameFile)
router.patch('/:id/rename', renameFile)
router.patch('/:id', renameFile)

// Move (support both POST and PATCH)
router.post('/:id/move', moveFile)
router.patch('/:id/move', moveFile)

// Delete (Soft delete to trash)
router.delete('/:id', deleteFile)

export default router