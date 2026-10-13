import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyNotifications,
  markRead,
  markAllRead,
} from '../controllers/notificationController.js';

const router = express.Router();
router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllRead); // harus di atas '/:id/read'
router.patch('/:id/read', markRead);

export default router;
