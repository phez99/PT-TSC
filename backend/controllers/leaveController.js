import Leave from '../models/Leave.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getLeaves = async (req, res, next) => {
  try {
    const { status, type } = req.query
    const query = {}

    if (status) query.status = status
    if (type) query.type = type

    if (req.user.role === 'staff') {
      query.user = req.user._id
    }

    const leaves = await Leave.find(query).sort({ createdAt: -1 })

    // Hitung sisa cuti jika staff
    let balance = 12
    if (req.user.role === 'staff') {
      const approvedDays = await Leave.aggregate([
        { $match: { user: req.user._id, status: 'approved', type: 'annual' } },
        { $group: { _id: null, total: { $sum: '$totalDays' } } }
      ])
      const used = approvedDays[0]?.total || 0
      balance = Math.max(0, 12 - used)
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar pengajuan izin & cuti berhasil dimuat.',
      data: leaves,
      meta: {
        total: leaves.length,
        ...(req.user.role === 'staff' && { remainingAnnualLeaveDays: balance })
      }
    })
  } catch (err) {
    next(err)
  }
}

export const createLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, totalDays, reason } = req.body

    const newLeave = await Leave.create({
      user: req.user._id,
      userName: req.user.name,
      position: req.user.position,
      type: type || 'annual',
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason,
      status: 'pending'
    })

    return successResponse(res, {
      statusCode: 201,
      message: 'Pengajuan cuti/izin berhasil dikirim dan menunggu persetujuan atasan.',
      data: newLeave
    })
  } catch (err) {
    next(err)
  }
}

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, approvalNotes } = req.body
    const leave = await Leave.findById(req.params.id)

    if (!leave) {
      return errorResponse(res, { statusCode: 404, message: 'Data pengajuan cuti tidak ditemukan.' })
    }

    leave.status = status
    leave.approvedBy = req.user._id
    leave.approverName = req.user.name
    leave.approvalNotes = approvalNotes || ''

    await leave.save()

    return successResponse(res, {
      statusCode: 200,
      message: `Pengajuan cuti atas nama ${leave.userName} telah ${status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}.`,
      data: leave
    })
  } catch (err) {
    next(err)
  }
}
