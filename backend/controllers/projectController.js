import mongoose from 'mongoose';
import Project from '../models/Project.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Invoice from '../models/Invoice.js';
import DocumentModel from '../models/Document.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ------------------------- Konfigurasi -------------------------

// Hanya field ini yang boleh diisi dari request (mencegah mass assignment)
const CREATE_FIELDS = [
  'code',
  'name',
  'client',
  'location',
  'category',
  'status',
  'progress',
  'contractValue',
  'startDate',
  'endDate',
  'projectManager',
  'description',
];
// Kode proyek tidak boleh diubah setelah dibuat
const UPDATE_FIELDS = CREATE_FIELDS.filter((field) => field !== 'code');
const MEMBER_FIELDS = ['user', 'name', 'role'];

// Role yang TIDAK boleh melihat nilai kontrak. Ubah sesuai kebijakan perusahaan
// (finance sengaja tidak disembunyikan karena berurusan dengan invoice).
const HIDE_CONTRACT_VALUE_ROLES = ['staff'];

// ------------------------- Helper -------------------------

const pickFields = (body = {}, allowed) =>
  Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const canSeeContractValue = (user) => !HIDE_CONTRACT_VALUE_ROLES.includes(user?.role);

const notFound = (res, message = 'Proyek tidak ditemukan.') =>
  errorResponse(res, { statusCode: 404, message });

// Kode otomatis: PRJ-<tahun>-<nomor 3 digit>, mis. PRJ-2026-004
const generateProjectCode = async () => {
  const prefix = `PRJ-${new Date().getFullYear()}-`;
  const existing = await Project.find({ code: new RegExp(`^${prefix}\\d+$`) })
    .select('code')
    .lean();
  const maxNumber = existing.reduce(
    (max, p) => Math.max(max, parseInt(p.code.slice(prefix.length), 10) || 0),
    0
  );
  return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
};

// ------------------------- Proyek -------------------------

export const getProjects = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (typeof status === 'string' && status) query.status = status;
    if (typeof search === 'string' && search) {
      const pattern = escapeRegex(search);
      query.$or = [
        { code: { $regex: pattern, $options: 'i' } },
        { name: { $regex: pattern, $options: 'i' } },
        { client: { $regex: pattern, $options: 'i' } },
      ];
    }

    let dbQuery = Project.find(query)
      .populate('projectManager', 'name email')
      .sort({ createdAt: -1 });
    if (!canSeeContractValue(req.user)) dbQuery = dbQuery.select('-contractValue');

    const projects = await dbQuery;

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar proyek berhasil dimuat.',
      data: projects,
      meta: { total: projects.length },
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);

    let dbQuery = Project.findById(id).populate('projectManager', 'name email phone');
    if (!canSeeContractValue(req.user)) dbQuery = dbQuery.select('-contractValue');

    const project = await dbQuery;
    if (!project) return notFound(res);

    return successResponse(res, { statusCode: 200, data: project });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const data = pickFields(req.body, CREATE_FIELDS);
    const customCode = typeof data.code === 'string' ? data.code.trim() : '';

    // Percobaan ulang jika nomor otomatis bentrok (dua proyek dibuat bersamaan)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const project = await Project.create({
          ...data,
          code: customCode || (await generateProjectCode()),
        });
        return successResponse(res, {
          statusCode: 201,
          message: `Proyek '${project.name}' (${project.code}) berhasil ditambahkan.`,
          data: project,
        });
      } catch (err) {
        if (err.code === 11000) {
          if (customCode) {
            return errorResponse(res, {
              statusCode: 409,
              message: `Kode proyek ${customCode} sudah digunakan.`,
            });
          }
          continue;
        }
        throw err;
      }
    }

    return errorResponse(res, {
      statusCode: 409,
      message: 'Gagal membuat kode proyek otomatis, silakan coba lagi.',
    });
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);

    const data = pickFields(req.body, UPDATE_FIELDS);
    if (Object.keys(data).length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Tidak ada data yang dapat diperbarui.',
      });
    }

    const project = await Project.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!project) return notFound(res);

    return successResponse(res, {
      statusCode: 200,
      message: `Proyek '${project.name}' berhasil diperbarui.`,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// Hapus permanen ditolak jika proyek sudah dipakai data lain, supaya tidak ada
// referensi yatim. Gunakan status 'hold' / 'done' untuk menutup proyek.
// Catatan: pengecekan Invoice & Dokumen mengasumsikan field relasinya bernama `project`.
// Jika nama field di model tersebut berbeda, sesuaikan filter di bawah.
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);

    const [materialRequests, invoices, documents] = await Promise.all([
      MaterialRequest.countDocuments({ project: id }),
      Invoice.countDocuments({ project: id }),
      DocumentModel.countDocuments({ project: id }),
    ]);

    const usage = [
      materialRequests && `${materialRequests} Material Request`,
      invoices && `${invoices} Invoice`,
      documents && `${documents} Dokumen`,
    ].filter(Boolean);

    if (usage.length > 0) {
      return errorResponse(res, {
        statusCode: 409,
        message: `Proyek tidak dapat dihapus karena masih dipakai oleh ${usage.join(', ')}. Ubah statusnya menjadi "hold" atau "done" sebagai gantinya.`,
      });
    }

    const project = await Project.findByIdAndDelete(id);
    if (!project) return notFound(res);

    return successResponse(res, {
      statusCode: 200,
      message: `Proyek '${project.name}' berhasil dihapus.`,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------- Anggota proyek -------------------------

export const addProjectMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);

    const member = pickFields(req.body, MEMBER_FIELDS);
    if (typeof member.name !== 'string' || !member.name.trim()) {
      return errorResponse(res, { statusCode: 400, message: 'Nama anggota wajib diisi.' });
    }
    if (member.user && !mongoose.isObjectIdOrHexString(member.user)) {
      return errorResponse(res, { statusCode: 400, message: 'ID pengguna anggota tidak valid.' });
    }
    if (!member.user) delete member.user;

    const project = await Project.findById(id);
    if (!project) return notFound(res);

    project.members.push(member);
    await project.save();
    await project.populate('projectManager', 'name email phone');

    return successResponse(res, {
      statusCode: 201,
      message: `Anggota '${member.name}' berhasil ditambahkan ke proyek.`,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const removeProjectMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);
    if (!mongoose.isObjectIdOrHexString(memberId)) return notFound(res, 'Anggota tidak ditemukan.');

    const project = await Project.findById(id);
    if (!project) return notFound(res);

    const member = project.members.id(memberId);
    if (!member) return notFound(res, 'Anggota tidak ditemukan.');

    project.members.pull(memberId);
    await project.save();
    await project.populate('projectManager', 'name email phone');

    return successResponse(res, {
      statusCode: 200,
      message: 'Anggota berhasil dikeluarkan dari proyek.',
      data: project,
    });
  } catch (err) {
    next(err);
  }
};
