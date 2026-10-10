import express from 'express'
import {
  getDocuments,
  createDocument,
  updateDocumentStatus
} from '../controllers/documentController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.use(protect)

router.get('/', getDocuments)
router.post('/', authorize('admin', 'manager', 'pm'), createDocument)
router.put('/:id/status', authorize('admin', 'manager', 'pm'), updateDocumentStatus)

export default router
