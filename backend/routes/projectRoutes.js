import express from 'express'
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.use(protect)

router.get('/', getProjects)
router.get('/:id', getProjectById)
router.post('/', authorize('admin', 'manager', 'pm'), createProject)
router.put('/:id', authorize('admin', 'manager', 'pm'), updateProject)
router.delete('/:id', authorize('admin'), deleteProject)

export default router
