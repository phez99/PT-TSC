import express from 'express'
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus
} from '../controllers/invoiceController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.use(protect)

router.get('/', authorize('admin', 'manager', 'finance'), getInvoices)
router.get('/:id', authorize('admin', 'manager', 'finance'), getInvoiceById)
router.post('/', authorize('admin', 'manager', 'finance'), createInvoice)
router.put('/:id/status', authorize('admin', 'manager', 'finance'), updateInvoiceStatus)

export default router
