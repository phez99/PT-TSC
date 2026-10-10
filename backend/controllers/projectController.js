import Project from '../models/Project.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getProjects = async (req, res, next) => {
  try {
    const { status, search } = req.query
    const query = {}

    if (status) query.status = status
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } }
      ]
    }

    const projects = await Project.find(query).populate('projectManager', 'name email').sort({ createdAt: -1 })

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar proyek berhasil dimuat.',
      data: projects,
      meta: { total: projects.length }
    })
  } catch (err) {
    next(err)
  }
}

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('projectManager', 'name email phone')
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek tidak ditemukan.' })
    }
    return successResponse(res, { statusCode: 200, data: project })
  } catch (err) {
    next(err)
  }
}

export const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body)
    return successResponse(res, {
      statusCode: 201,
      message: `Proyek '${project.name}' (${project.code}) berhasil ditambahkan.`,
      data: project
    })
  } catch (err) {
    next(err)
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek tidak ditemukan.' })
    }
    return successResponse(res, {
      statusCode: 200,
      message: `Proyek '${project.name}' berhasil diperbarui.`,
      data: project
    })
  } catch (err) {
    next(err)
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek tidak ditemukan.' })
    }
    return successResponse(res, {
      statusCode: 200,
      message: `Proyek '${project.name}' berhasil dihapus.`
    })
  } catch (err) {
    next(err)
  }
}
