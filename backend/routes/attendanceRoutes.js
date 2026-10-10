import express from 'express'
import {
  clockIn,
  clockOut,
  getAllAttendance,
  getMyTodayAttendance
} from '../controllers/attendanceController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

router.post('/clock-in', clockIn)
router.post('/clock-out', clockOut)
router.get('/today', getMyTodayAttendance)
router.get('/', getAllAttendance)

export default router
