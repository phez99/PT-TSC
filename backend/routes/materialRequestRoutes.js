import express from 'express'
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateStatus
} from '../controllers/materialRequestController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.use(protect)

router.get('/', getAllRequests)
router.get('/:id', getRequestById)
router.post('/', createRequest)
router.put('/:id/status', authorize('admin', 'manager', 'pm'), updateStatus)

export default router
