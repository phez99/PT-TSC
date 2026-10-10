import express from 'express'
import {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost
} from '../controllers/feedController.js'
import { protect } from '../middleware/auth.js'
import { authorize } from '../middleware/role.js'

const router = express.Router()

router.use(protect)

router.get('/', getPosts)
router.post('/', authorize('admin', 'manager', 'pm'), createPost)
router.post('/:id/like', toggleLike)
router.post('/:id/comments', addComment)
router.delete('/:id', deletePost)

export default router
