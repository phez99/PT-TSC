import mongoose from 'mongoose';
import Project from '../models/Project.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Invoice from '../models/Invoice.js';
import DocumentModel from '../models/Document.js';
import Overtime from '../models/Overtime.js';
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

// Hanya role ini yang boleh melihat daftar proyek terarsip
const ARCHIVE_VIEW_ROLES = ['admin', 'manager'];

// Dokumen lama yang belum punya field isArchived dianggap tidak terarsip
const NOT_ARCHIVED = { $ne: true };

const archivedConflict = (res) =>
  errorResponse(res, {
    statusCode: 409,
    message: 'Proyek sudah diarsipkan. Pulihkan proyek terlebih dahulu sebelum mengubah datanya.',
  });

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
    const { status, search, archived } = req.query;
    const query = {};

    // archived=true → hanya terarsip, archived=all → semuanya (khusus admin & manager).
    // Selain itu (atau role lain) hanya proyek yang tidak terarsip.
    const canSeeArchived = ARCHIVE_VIEW_ROLES.includes(req.user?.role);
    if (canSeeArchived && archived === 'true') query.isArchived = true;
    else if (!(canSeeArchived && archived === 'all')) query.isArchived = NOT_ARCHIVED;

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

    // Proyek terarsip tidak bisa diubah (filter atomik, tanpa celah antara cek dan simpan)
    const project = await Project.findOneAndUpdate({ _id: id, isArchived: NOT_ARCHIVED }, data, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return (await Project.exists({ _id: id })) ? archivedConflict(res) : notFound(res);
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Proyek '${project.name}' berhasil diperbarui.`,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// Hapus permanen hanya untuk proyek berstatus 'planning' yang belum dipakai data lain
// (Material Request, Lembur, Invoice, Dokumen), supaya tidak ada referensi yatim.
// Selain itu proyek diarsipkan lewat archiveProject.
export const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);

    const existing = await Project.findById(id).select('status name');
    if (!existing) return notFound(res);

    if (existing.status !== 'planning') {
      return errorResponse(res, {
        statusCode: 409,
        message:
          'Hanya proyek berstatus "planning" yang bisa dihapus permanen. Arsipkan proyek ini sebagai gantinya.',
      });
    }

    const [materialRequests, overtimes, invoices, documents] = await Promise.all([
      MaterialRequest.countDocuments({ project: id }),
      Overtime.countDocuments({ project: id }),
      Invoice.countDocuments({ project: id }),
      DocumentModel.countDocuments({ project: id }),
    ]);

    const usage = [
      materialRequests && `${materialRequests} Material Request`,
      overtimes && `${overtimes} Lembur`,
      invoices && `${invoices} Invoice`,
      documents && `${documents} Dokumen`,
    ].filter(Boolean);

    if (usage.length > 0) {
      return errorResponse(res, {
        statusCode: 409,
        message: `Proyek tidak dapat dihapus karena masih dipakai oleh ${usage.join(', ')}. Arsipkan proyek ini sebagai gantinya.`,
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

// ------------------------- Arsip -------------------------

// Arsipkan proyek (soft delete): disembunyikan dari daftar utama, seluruh data
// Material Request, Lembur, Invoice, dan Dokumen miliknya tetap utuh.
export const archiveProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);

    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
    if (reason.length > 500) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Alasan arsip maksimal 500 karakter.',
      });
    }

    const project = await Project.findOneAndUpdate(
      { _id: id, isArchived: NOT_ARCHIVED },
      { isArchived: true, archivedAt: new Date(), archivedBy: req.user._id, archiveReason: reason },
      { new: true }
    );
    if (!project) {
      return (await Project.exists({ _id: id }))
        ? errorResponse(res, { statusCode: 409, message: 'Proyek sudah diarsipkan.' })
        : notFound(res);
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Proyek '${project.name}' berhasil diarsipkan.`,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

export const restoreProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) return notFound(res);

    const project = await Project.findOneAndUpdate(
      { _id: id, isArchived: true },
      { isArchived: false, archivedAt: null, archivedBy: null, archiveReason: '' },
      { new: true }
    );
    if (!project) {
      return (await Project.exists({ _id: id }))
        ? errorResponse(res, { statusCode: 409, message: 'Proyek tidak dalam keadaan diarsipkan.' })
        : notFound(res);
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Proyek '${project.name}' berhasil dipulihkan.`,
      data: project,
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
    if (project.isArchived) return archivedConflict(res);

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
    if (project.isArchived) return archivedConflict(res);

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
