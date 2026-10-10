import Document from '../models/Document.js'
import Project from '../models/Project.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getDocuments = async (req, res, next) => {
  try {
    const { type, project: projectId, status } = req.query
    const query = {}

    if (type) query.type = type
    if (projectId) query.project = projectId
    if (status) query.status = status

    const docs = await Document.find(query).sort({ date: -1, createdAt: -1 })

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar dokumen & BAST berhasil dimuat.',
      data: docs,
      meta: { total: docs.length }
    })
  } catch (err) {
    next(err)
  }
}

export const createDocument = async (req, res, next) => {
  try {
    const { docNumber, title, type, projectId, date, notes } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek terkait tidak ditemukan.' })
    }

    const doc = await Document.create({
      docNumber,
      title,
      type: type || 'bast',
      project: project._id,
      projectName: project.name,
      client: project.client,
      date,
      status: 'draft',
      notes
    })

    return successResponse(res, {
      statusCode: 201,
      message: `Dokumen ${doc.docNumber} (${doc.title}) berhasil dibuat.`,
      data: doc
    })
  } catch (err) {
    next(err)
  }
}

export const updateDocumentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body
    const doc = await Document.findById(req.params.id)

    if (!doc) {
      return errorResponse(res, { statusCode: 404, message: 'Dokumen tidak ditemukan.' })
    }

    doc.status = status
    if (notes) doc.notes = notes
    await doc.save()

    return successResponse(res, {
      statusCode: 200,
      message: `Status dokumen ${doc.docNumber} diperbarui menjadi ${status}.`,
      data: doc
    })
  } catch (err) {
    next(err)
  }
}
