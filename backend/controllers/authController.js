import User from '../models/User.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

/**
 * @desc    Login pengguna & dapatkan JWT Token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Mohon masukkan email dan password.'
      })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Kombinasi email atau password tidak sesuai.'
      })
    }

    if (!user.isActive) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Akun Anda telah dinonaktifkan oleh administrator. Hubungi HRD / IT.'
      })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Kombinasi email atau password tidak sesuai.'
      })
    }

    user.lastLogin = new Date()
    await user.save({ validateBeforeSave: false })

    const token = user.generateToken()
    const userObj = user.toObject()
    delete userObj.password

    return successResponse(res, {
      statusCode: 200,
      message: `Selamat datang kembali, ${user.name}!`,
      data: {
        token,
        user: userObj
      }
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Dapatkan data profil user yang sedang login
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    return successResponse(res, {
      statusCode: 200,
      message: 'Data profil berhasil diambil',
      data: user
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Ubah password sendiri
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Password saat ini dan password baru wajib disertakan.'
      })
    }

    if (newPassword.length < 6) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Password baru minimal 6 karakter.'
      })
    }

    const user = await User.findById(req.user._id).select('+password')
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Password saat ini yang Anda masukkan salah.'
      })
    }

    user.password = newPassword
    await user.save()

    return successResponse(res, {
      statusCode: 200,
      message: 'Password Anda berhasil diperbarui. Silakan gunakan password baru pada sesi berikutnya.'
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Dapatkan seluruh daftar pengguna (Admin & Manager)
 * @route   GET /api/v1/auth/users
 * @access  Private (admin, manager)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 })
    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar pengguna berhasil dimuat',
      data: users,
      meta: { total: users.length }
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Buat pengguna baru (Admin)
 * @route   POST /api/v1/auth/users
 * @access  Private (admin)
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, position, phone } = req.body

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'Email tersebut sudah terdaftar pada sistem.'
      })
    }

    const user = await User.create({
      name,
      email,
      password: password || 'tsc123456',
      role: role || 'staff',
      position: position || 'Teknisi Lapangan',
      phone: phone || ''
    })

    const userObj = user.toObject()
    delete userObj.password

    return successResponse(res, {
      statusCode: 201,
      message: `Pengguna ${user.name} berhasil dibuat.`,
      data: userObj
    })
  } catch (err) {
    next(err)
  }
}

/**
 * @desc    Perbarui data pengguna
 * @route   PUT /api/v1/auth/users/:id
 * @access  Private (admin / self)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, phone, position, role, isActive } = req.body

    // Cek otorisasi jika bukan admin dan ingin mengubah user lain
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Anda tidak memiliki hak akses untuk mengubah data pengguna lain.'
      })
    }

    const updateData = { name, phone }
    if (req.user.role === 'admin') {
      if (position) updateData.position = position
      if (role) updateData.role = role
      if (typeof isActive === 'boolean') updateData.isActive = isActive
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'Pengguna tidak ditemukan.' })
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Data pengguna berhasil diperbarui.',
      data: user
    })
  } catch (err) {
    next(err)
  }
}
