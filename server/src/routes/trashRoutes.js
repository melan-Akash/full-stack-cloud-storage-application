import express from 'express'
import {
  getTrashItems,
  restoreItem,
  permanentlyDeleteItem,
  emptyTrash
} from '../controllers/trashController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.get('/', getTrashItems)
router.post('/restore', restoreItem)
router.patch('/restore', restoreItem)
router.delete('/permanent', permanentlyDeleteItem)
router.post('/permanent', permanentlyDeleteItem)
router.delete('/empty', emptyTrash)
router.post('/empty', emptyTrash)

export default router