// ============================================================
// STANDAR FORMAT RESPONS API (PT. TSC)
// Menjamin konsistensi struktur respons di seluruh endpoint
// ============================================================

/**
 * Respons Sukses Standar
 * @param {Response} res Express response object
 * @param {Object} options { statusCode, message, data, meta }
 */
export const successResponse = (
  res,
  { statusCode = 200, message = 'Operasi berhasil dilakukan', data = null, meta = null } = {}
) => {
  const responseBody = {
    success: true,
    statusCode,
    message,
    data
  }

  if (meta) {
    responseBody.meta = meta
  }

  return res.status(statusCode).json(responseBody)
}

/**
 * Respons Gagal / Error Standar
 * @param {Response} res Express response object
 * @param {Object} options { statusCode, message, error }
 */
export const errorResponse = (
  res,
  { statusCode = 500, message = 'Terjadi kesalahan pada server', error = null } = {}
) => {
  const responseBody = {
    success: false,
    statusCode,
    message
  }

  if (error && process.env.NODE_ENV !== 'production') {
    responseBody.error = typeof error === 'string' ? error : error.message || error
    if (error.stack) {
      responseBody.stack = error.stack
    }
  }

  return res.status(statusCode).json(responseBody)
}
