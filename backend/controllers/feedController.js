import FeedPost from '../models/FeedPost.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getPosts = async (req, res, next) => {
  try {
    const { category } = req.query
    const query = {}
    if (category && category !== 'all') {
      query.category = category
    }

    const posts = await FeedPost.find(query).sort({ createdAt: -1 })

    return successResponse(res, {
      statusCode: 200,
      message: 'Postingan feed & pengumuman berhasil dimuat.',
      data: posts,
      meta: { total: posts.length }
    })
  } catch (err) {
    next(err)
  }
}

export const createPost = async (req, res, next) => {
  try {
    const { category, title, content, projectName, taggedUsers } = req.body

    const post = await FeedPost.create({
      author: {
        id: req.user._id,
        name: req.user.name,
        position: req.user.position,
        role: req.user.role,
        avatarColor: req.user.role === 'admin' ? 'navy-950' : req.user.role === 'manager' ? 'amber-9' : 'teal-8'
      },
      category: category || 'announcement',
      title,
      content,
      projectName: projectName || 'Seluruh Proyek Lapangan',
      taggedUsers: taggedUsers || [],
      likes: [],
      comments: []
    })

    return successResponse(res, {
      statusCode: 201,
      message: 'Pengumuman / briefing berhasil diterbitkan.',
      data: post
    })
  } catch (err) {
    next(err)
  }
}

export const toggleLike = async (req, res, next) => {
  try {
    const post = await FeedPost.findById(req.params.id)
    if (!post) {
      return errorResponse(res, { statusCode: 404, message: 'Postingan tidak ditemukan.' })
    }

    const userIdStr = req.user._id.toString()
    const index = post.likes.findIndex(id => id.toString() === userIdStr)

    if (index === -1) {
      post.likes.push(req.user._id)
    } else {
      post.likes.splice(index, 1)
    }

    await post.save()

    return successResponse(res, {
      statusCode: 200,
      message: index === -1 ? 'Disukai' : 'Batal menyukai',
      data: {
        likesCount: post.likes.length,
        isLiked: index === -1
      }
    })
  } catch (err) {
    next(err)
  }
}

export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body
    if (!text || !text.trim()) {
      return errorResponse(res, { statusCode: 400, message: 'Teks tanggapan wajib diisi.' })
    }

    const post = await FeedPost.findById(req.params.id)
    if (!post) {
      return errorResponse(res, { statusCode: 404, message: 'Postingan tidak ditemukan.' })
    }

    const newComment = {
      author: {
        id: req.user._id,
        name: req.user.name,
        position: req.user.position,
        role: req.user.role
      },
      text: text.trim(),
      createdAt: new Date()
    }

    post.comments.push(newComment)
    await post.save()

    return successResponse(res, {
      statusCode: 201,
      message: 'Tanggapan berhasil dikirim.',
      data: post
    })
  } catch (err) {
    next(err)
  }
}

export const deletePost = async (req, res, next) => {
  try {
    const post = await FeedPost.findById(req.params.id)
    if (!post) {
      return errorResponse(res, { statusCode: 404, message: 'Postingan tidak ditemukan.' })
    }

    // Hanya author atau admin yang boleh menghapus
    if (req.user.role !== 'admin' && post.author.id.toString() !== req.user._id.toString()) {
      return errorResponse(res, { statusCode: 403, message: 'Anda tidak memiliki hak akses menghapus postingan ini.' })
    }

    await FeedPost.findByIdAndDelete(req.params.id)

    return successResponse(res, {
      statusCode: 200,
      message: 'Postingan berhasil dihapus.'
    })
  } catch (err) {
    next(err)
  }
}
