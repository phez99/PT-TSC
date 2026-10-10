import { errorResponse } from '../utils/apiResponse.js'

export const errorHandler = (err, req, res, _next) => {
  let error = { ...err }
  error.message = err.message

  console.error(`[Error Caught]: ${err.name} - ${err.message}`)

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Format ID tidak valid: '${err.value}' untuk field '${err.path}'`
    return errorResponse(res, { statusCode: 400, message, error: message })
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const value = err.keyValue[field]
    const message = `Data duplikat: Nilai '${value}' pada field '${field}' sudah digunakan.`
    return errorResponse(res, { statusCode: 409, message, error: message })
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ')
    return errorResponse(res, {
      statusCode: 422,
      message: `Validasi gagal: ${message}`,
      error: message
    })
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Token otentikasi tidak valid.'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, {
      statusCode: 401,
      message: 'Sesi token telah kedaluwarsa. Silakan login kembali.'
    })
  }

  // Default Error
  return errorResponse(res, {
    statusCode: err.statusCode || 500,
    message: error.message || 'Terjadi kesalahan internal pada server',
    error: err
  })
}
