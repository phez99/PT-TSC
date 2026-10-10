import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { errorResponse } from '../utils/apiResponse.js'

export const protect = async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.'
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Pengguna dengan token ini tidak lagi terdaftar dalam sistem.'
      })
    }

    req.user = user
    next()
  } catch (error) {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Token kedaluwarsa atau tidak valid.',
      error: error.message
    })
  }
}
