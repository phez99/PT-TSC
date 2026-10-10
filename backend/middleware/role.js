import { errorResponse } from '../utils/apiResponse.js'

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Akses ditolak: Autentikasi diperlukan.'
      })
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, {
        statusCode: 403,
        message: `Hak akses ditolak: Role Anda (${req.user.role}) tidak memiliki wewenang untuk mengakses endpoint ini.`
      })
    }

    next()
  }
}
