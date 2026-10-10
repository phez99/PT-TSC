import Attendance from '../models/Attendance.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

/**
 * @desc    Clock In Presensi Masuk (Selfie + GPS)
 * @route   POST /api/v1/attendance/clock-in
 * @access  Private
 */
export const clockIn = async (req, res, next) => {
  try {
    const user = req.user
    const { location, notes, photo, coords, apdList, healthStatus } = req.body

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = now.toTimeString().slice(0, 5)

    // Cek apakah sudah absen hari ini
    const existing = await Attendance.findOne({ user: user._id, date: dateStr })
    if (existing && existing.clockIn) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Anda sudah melakukan Clock In untuk hari ini.'
      })
    }

    // Hitung status tepat waktu (> 08:30 WIB dianggap terlambat)
    const isLate = parseInt(timeStr.replace(':', ''), 10) > 830

    const attendance = await Attendance.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      position: user.position,
      date: dateStr,
      clockIn: timeStr,
      clockOut: null,
      location: location || 'Head Office - Ruko Newton Square',
      status: isLate ? 'late' : 'ontime',
      notes: notes || 'Hadir dan bertugas di lapangan/kantor.',
      photo: photo || null,
      coords: coords || null,
      apdList: apdList || [],
      healthStatus: healthStatus || 'fit'
    })

    return successResponse(res, {
      statusCode: 201,
      message: `Presensi Masuk berhasil dicatat di ${attendance.location} (${attendance.status === 'ontime' ? 'Tepat Waktu' : 'Terlambat'})!`,
      data: attendance
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Clock Out Presensi Pulang
 * @route   POST /api/v1/attendance/clock-out
 * @access  Private
 */
export const clockOut = async (req, res, next) => {
  try {
    const user = req.user
    const { notes, photo, coords } = req.body

    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    const timeStr = now.toTimeString().slice(0, 5)

    const attendance = await Attendance.findOne({ user: user._id, date: dateStr })
    if (!attendance) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Anda belum melakukan Clock In hari ini.'
      })
    }

    if (attendance.clockOut) {
      return errorResponse(res, {
        statusCode: 400,
        message: `Anda sudah melakukan Clock Out hari ini pada pukul ${attendance.clockOut} WIB.`
      })
    }

    attendance.clockOut = timeStr
    attendance.clockOutPhoto = photo || null
    attendance.clockOutCoords = coords || null
    if (notes) {
      attendance.notes = `${attendance.notes} | Jam Pulang: ${notes}`
    }

    await attendance.save()

    return successResponse(res, {
      statusCode: 200,
      message: 'Presensi Pulang berhasil dicatat. Selamat beristirahat!',
      data: attendance
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Dapatkan seluruh log presensi (Admin, Manager, PM, Finance)
 * @route   GET /api/v1/attendance
 * @access  Private
 */
export const getAllAttendance = async (req, res, next) => {
  try {
    const { date, status, user: userId } = req.query
    const query = {}

    if (date) query.date = date
    if (status) query.status = status
    if (userId) query.user = userId

    // Jika staff biasa, hanya dapat melihat presensi miliknya sendiri
    if (req.user.role === 'staff') {
      query.user = req.user._id
    }

    const list = await Attendance.find(query).sort({ date: -1, createdAt: -1 })

    return successResponse(res, {
      statusCode: 200,
      message: 'Data riwayat presensi berhasil dimuat.',
      data: list,
      meta: {
        total: list.length,
        ontimeCount: list.filter(a => a.status === 'ontime').length,
        lateCount: list.filter(a => a.status === 'late').length
      }
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Dapatkan presensi saya hari ini
 * @route   GET /api/v1/attendance/today
 * @access  Private
 */
export const getMyTodayAttendance = async (req, res, next) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10)
    const today = await Attendance.findOne({ user: req.user._id, date: dateStr })

    return successResponse(res, {
      statusCode: 200,
      message: today ? 'Presensi hari ini ditemukan' : 'Belum melakukan presensi hari ini',
      data: today
    })
  } catch (err) {
    next(err)
  }
}
