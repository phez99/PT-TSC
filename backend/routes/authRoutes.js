import express from 'express'
import {
  login,
  getMe,
  changePassword,
  getAllUsers,
  createUser,
  updateUser
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.post('/login', login)
router.get('/me', protect, getMe)
router.put('/change-password', protect, changePassword)

// User Management (Admin & Manager)
router.get('/users', protect, authorize('admin', 'manager'), getAllUsers)
router.post('/users', protect, authorize('admin'), createUser)
router.put('/users/:id', protect, updateUser)

export default router
