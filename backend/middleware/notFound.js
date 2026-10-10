import { errorResponse } from '../utils/apiResponse.js'

export const notFound = (req, res, _next) => {
  return errorResponse(res, {
    statusCode: 404,
    message: `Endpoint '${req.method} ${req.originalUrl}' tidak ditemukan pada server API ini.`
  })
}
