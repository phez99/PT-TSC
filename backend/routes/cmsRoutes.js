import express from 'express'
import {
  getCmsContent,
  updateCmsContent,
  resetCmsContent
} from '../controllers/cmsController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

// Endpoint publik agar landing page dapat membaca konten langsung
router.get('/', getCmsContent)

// Endpoint proteksi untuk admin/manager mengedit konten
router.put('/', protect, authorize('admin', 'manager'), updateCmsContent)
router.post('/reset', protect, authorize('admin', 'manager'), resetCmsContent)

export default router
