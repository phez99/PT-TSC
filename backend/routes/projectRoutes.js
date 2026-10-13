import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  restoreProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize('admin', 'manager', 'pm'), createProject);
router.put('/:id', authorize('admin', 'manager', 'pm'), updateProject);
router.delete('/:id', authorize('admin'), deleteProject);

// Arsip (soft delete) dan pemulihan
router.put('/:id/archive', authorize('admin'), archiveProject);
router.put('/:id/restore', authorize('admin'), restoreProject);

// Anggota proyek
router.post('/:id/members', authorize('admin', 'manager', 'pm'), addProjectMember);
router.delete('/:id/members/:memberId', authorize('admin', 'manager', 'pm'), removeProjectMember);

export default router;
