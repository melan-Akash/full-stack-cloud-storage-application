import express from 'express'
import {
  createShareLink,
  getMySharedLinks,
  getPublicSharedItem,
  downloadSharedFile,
  revokeShareLink
} from '../controllers/shareController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Public Routes (No Auth Needed)
router.get('/public/:token', getPublicSharedItem)
router.get('/download/:token', downloadSharedFile)

// Protected Routes
router.use(protect)
router.post('/', createShareLink)
router.get('/my-links', getMySharedLinks)
router.get('/', getMySharedLinks)
router.delete('/:id', revokeShareLink)

export default router