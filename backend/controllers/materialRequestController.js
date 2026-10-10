import MaterialRequest from '../models/MaterialRequest.js'
import Project from '../models/Project.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getAllRequests = async (req, res, next) => {
  try {
    const { status, project: projectId } = req.query
    const query = {}

    if (status) query.status = status
    if (projectId) query.project = projectId

    // Staff hanya melihat request yang mereka buat sendiri
    if (req.user.role === 'staff') {
      query.requester = req.user._id
    }

    const requests = await MaterialRequest.find(query)
      .populate('project', 'code name location')
      .populate('requester', 'name position')
      .sort({ createdAt: -1 })

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar permohonan material berhasil dimuat.',
      data: requests,
      meta: { total: requests.length }
    })
  } catch (err) {
    next(err)
  }
}

export const getRequestById = async (req, res, next) => {
  try {
    const request = await MaterialRequest.findById(req.params.id)
      .populate('project')
      .populate('requester', 'name email phone position')

    if (!request) {
      return errorResponse(res, { statusCode: 404, message: 'Permohonan material tidak ditemukan.' })
    }

    return successResponse(res, { statusCode: 200, data: request })
  } catch (err) {
    next(err)
  }
}

export const createRequest = async (req, res, next) => {
  try {
    const { projectId, items, urgency, neededDate, notes } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek penugasan tidak ditemukan.' })
    }

    // Auto-generate nomor MR
    const count = await MaterialRequest.countDocuments()
    const year = new Date().getFullYear()
    const code = `MR-${year}-${String(count + 1).padStart(3, '0')}`

    const newRequest = await MaterialRequest.create({
      code,
      project: project._id,
      projectName: project.name,
      requester: req.user._id,
      requesterName: req.user.name,
      items: items || [],
      urgency: urgency || 'medium',
      status: 'submitted',
      neededDate,
      notes,
      timeline: [
        {
          action: 'Pengajuan Baru Dibuat',
          byName: req.user.name,
          byRole: req.user.role,
          notes: notes || 'Permohonan diajukan dari lapangan'
        }
      ]
    })

    return successResponse(res, {
      statusCode: 201,
      message: `Permohonan material ${newRequest.code} berhasil diajukan untuk proyek ${project.name}.`,
      data: newRequest
    })
  } catch (err) {
    next(err)
  }
}

export const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body
    const request = await MaterialRequest.findById(req.params.id)

    if (!request) {
      return errorResponse(res, { statusCode: 404, message: 'Permohonan material tidak ditemukan.' })
    }

    request.status = status
    request.timeline.push({
      action: `Status diubah menjadi: ${status.toUpperCase()}`,
      byName: req.user.name,
      byRole: req.user.role,
      notes: notes || `Diverifikasi oleh ${req.user.name}`
    })

    await request.save()

    return successResponse(res, {
      statusCode: 200,
      message: `Status permohonan ${request.code} berhasil diperbarui menjadi ${status}.`,
      data: request
    })
  } catch (err) {
    next(err)
  }
}
