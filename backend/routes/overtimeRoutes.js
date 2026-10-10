import express from 'express'
import {
  getOvertimes,
  createOvertime,
  updateOvertimeStatus
} from '../controllers/overtimeController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.use(protect)

router.get('/', getOvertimes)
router.post('/', createOvertime)
router.put('/:id/status', authorize('admin', 'manager', 'pm'), updateOvertimeStatus)

export default router
