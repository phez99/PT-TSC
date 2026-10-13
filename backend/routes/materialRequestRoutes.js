import express from 'express';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateStatus,
  deleteRequest, // <-- Import controller delete
} from '../controllers/materialRequestController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.put('/:id/status', authorize('admin', 'manager', 'pm'), updateStatus);
router.delete('/:id', authorize('admin', 'manager', 'pm'), deleteRequest); // <-- Tambahkan route delete

export default router;
