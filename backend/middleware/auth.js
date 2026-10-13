import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Akses ditolak: Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
      });
    }

    // Kesalahan konfigurasi server bukan salah token → lempar sebagai 500
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET belum diset di file .env');
    }

    // Hanya kegagalan verifikasi token yang dijawab 401
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Token kedaluwarsa atau tidak valid.',
        error: error.message,
      });
    }

    // Error database di sini menjadi 500 (via next), bukan 401 yang memaksa user logout
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Pengguna dengan token ini tidak lagi terdaftar dalam sistem.',
      });
    }

    // Akun yang dinonaktifkan langsung kehilangan akses, tanpa menunggu token kedaluwarsa
    if (!user.isActive) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Akun Anda telah dinonaktifkan oleh administrator. Hubungi HRD / IT.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
