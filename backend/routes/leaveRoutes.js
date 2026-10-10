import express from 'express'
import {
  getLeaves,
  createLeave,
  updateLeaveStatus
} from '../controllers/leaveController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.use(protect)

router.get('/', getLeaves)
router.post('/', createLeave)
router.put('/:id/status', authorize('admin', 'manager'), updateLeaveStatus)

export default router
