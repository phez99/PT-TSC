import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const toSafeObject = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

/**
 * @desc    Login pengguna & dapatkan JWT Token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Mohon masukkan email dan password.',
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Format email atau password tidak valid.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Kombinasi email atau password tidak sesuai.',
      });
    }

    if (!user.isActive) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Akun Anda telah dinonaktifkan oleh administrator. Hubungi HRD / IT.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, {
        statusCode: 401,
        message: 'Kombinasi email atau password tidak sesuai.',
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateToken();

    return successResponse(res, {
      statusCode: 200,
      message: `Selamat datang kembali, ${user.name}!`,
      data: {
        token,
        user: toSafeObject(user),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Dapatkan data profil user yang sedang login
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return successResponse(res, {
      statusCode: 200,
      message: 'Data profil berhasil diambil',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Ubah password sendiri
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Password saat ini dan password baru wajib disertakan.',
      });
    }

    if (newPassword.length < 6) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Password baru minimal 6 karakter.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Password saat ini yang Anda masukkan salah.',
      });
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message:
        'Password Anda berhasil diperbarui. Silakan gunakan password baru pada sesi berikutnya.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Dapatkan seluruh daftar pengguna (Admin & Manager)
 * @route   GET /api/v1/auth/users
 * @access  Private (admin, manager)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar pengguna berhasil dimuat',
      data: users,
      meta: { total: users.length },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Buat pengguna baru (Admin)
 * @route   POST /api/v1/auth/users
 * @access  Private (admin)
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, position, phone, isActive } = req.body;

    if (!name || !email || typeof email !== 'string') {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Nama dan email wajib diisi.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, {
        statusCode: 409,
        message: 'Email tersebut sudah terdaftar pada sistem.',
      });
    }

    const user = await User.create({
      name,
      email,
      // Password awal bisa diatur lewat DEFAULT_USER_PASSWORD di .env
      password: password || process.env.DEFAULT_USER_PASSWORD || 'tsc123456',
      role: role || 'staff',
      position: position || 'Teknisi Lapangan',
      phone: phone || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    return successResponse(res, {
      statusCode: 201,
      message: `Pengguna ${user.name} berhasil dibuat.`,
      data: toSafeObject(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Perbarui data pengguna
 * @route   PUT /api/v1/auth/users/:id
 * @access  Private (admin / self)
 *
 * - Non-admin: hanya boleh mengubah name & phone miliknya sendiri.
 * - Admin: boleh mengubah semua field termasuk role, isActive, position,
 *   dan mereset password (di-hash lewat hook pre('save')).
 * - "Hapus" user = isActive: false (soft delete).
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, position, role, isActive, password } = req.body;

    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user._id.toString() === id;

    if (!isAdmin && !isSelf) {
      return errorResponse(res, {
        statusCode: 403,
        message: 'Anda tidak memiliki hak akses untuk mengubah data pengguna lain.',
      });
    }

    // Cegah admin mengunci dirinya sendiri
    if (isAdmin && isSelf) {
      if (isActive === false) {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Anda tidak dapat menonaktifkan akun Anda sendiri.',
        });
      }
      if (role && role !== 'admin') {
        return errorResponse(res, {
          statusCode: 400,
          message: 'Anda tidak dapat menurunkan role akun Anda sendiri.',
        });
      }
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, { statusCode: 404, message: 'Pengguna tidak ditemukan.' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (isAdmin) {
      if (position) user.position = position;
      if (role) user.role = role;
      if (typeof isActive === 'boolean') user.isActive = isActive;
      if (password) {
        if (typeof password !== 'string' || password.length < 6) {
          return errorResponse(res, {
            statusCode: 400,
            message: 'Password baru minimal 6 karakter.',
          });
        }
        user.password = password;
      }
    }

    await user.save();

    return successResponse(res, {
      statusCode: 200,
      message: 'Data pengguna berhasil diperbarui.',
      data: toSafeObject(user),
    });
  } catch (err) {
    next(err);
  }
};
