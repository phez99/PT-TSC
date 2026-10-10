import Overtime from '../models/Overtime.js'
import Project from '../models/Project.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getOvertimes = async (req, res, next) => {
  try {
    const { status, project: projectId } = req.query
    const query = {}

    if (status) query.status = status
    if (projectId) query.project = projectId

    if (req.user.role === 'staff') {
      query.user = req.user._id
    }

    const overtimes = await Overtime.find(query).sort({ date: -1, createdAt: -1 })

    // Hitung total jam lembur yang disetujui
    const approvedHours = overtimes
      .filter(o => o.status === 'approved')
      .reduce((sum, o) => sum + (o.hours || 0), 0)

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar surat perintah kerja lembur (SPKL) berhasil dimuat.',
      data: overtimes,
      meta: {
        total: overtimes.length,
        approvedTotalHours: approvedHours
      }
    })
  } catch (err) {
    next(err)
  }
}

export const createOvertime = async (req, res, next) => {
  try {
    const { projectId, date, startTime, endTime, hours, tasks } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek penugasan lembur tidak ditemukan.' })
    }

    const count = await Overtime.countDocuments()
    const year = new Date().getFullYear()
    const code = `SPKL-${year}-${String(count + 1).padStart(3, '0')}`

    const newOvertime = await Overtime.create({
      code,
      user: req.user._id,
      userName: req.user.name,
      position: req.user.position,
      project: project._id,
      projectName: project.name,
      date,
      startTime,
      endTime,
      hours: Number(hours),
      tasks,
      status: 'pending'
    })

    return successResponse(res, {
      statusCode: 201,
      message: `Pengajuan lembur ${newOvertime.code} untuk ${project.name} berhasil diajukan.`,
      data: newOvertime
    })
  } catch (err) {
    next(err)
  }
}

export const updateOvertimeStatus = async (req, res, next) => {
  try {
    const { status, approvalNotes, compensationAmount } = req.body
    const overtime = await Overtime.findById(req.params.id)

    if (!overtime) {
      return errorResponse(res, { statusCode: 404, message: 'Data lembur tidak ditemukan.' })
    }

    overtime.status = status
    overtime.approvedBy = req.user._id
    overtime.approverName = req.user.name
    overtime.approvalNotes = approvalNotes || ''
    if (compensationAmount) {
      overtime.compensationAmount = Number(compensationAmount)
    }

    await overtime.save()

    return successResponse(res, {
      statusCode: 200,
      message: `Surat lembur ${overtime.code} telah ${status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}.`,
      data: overtime
    })
  } catch (err) {
    next(err)
  }
}
