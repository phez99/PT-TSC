import MaterialRequest from '../models/MaterialRequest.js';
import Project from '../models/Project.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { notifyRoles, notifyUser } from '../utils/notify.js';

export const getAllRequests = async (req, res, next) => {
  try {
    const { status, project: projectId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (projectId) query.project = projectId;

    // Staff hanya melihat request yang mereka buat sendiri
    if (req.user.role === 'staff') {
      query.requester = req.user._id;
    }

    const requests = await MaterialRequest.find(query)
      .populate('project', 'code name location')
      .populate('requester', 'name position')
      .sort({ createdAt: -1 });

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar permohonan material berhasil dimuat.',
      data: requests,
      meta: { total: requests.length },
    });
  } catch (err) {
    next(err);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const request = await MaterialRequest.findById(req.params.id)
      .populate('project')
      .populate('requester', 'name email phone position');

    if (!request) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Permohonan material tidak ditemukan.',
      });
    }

    return successResponse(res, { statusCode: 200, data: request });
  } catch (err) {
    next(err);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const { projectId, items, urgency, neededDate, notes } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek penugasan tidak ditemukan.' });
    }

    const count = await MaterialRequest.countDocuments();
    const year = new Date().getFullYear();
    const code = `MR-${year}-${String(count + 1).padStart(3, '0')}`;

    const newRequest = await MaterialRequest.create({
      code,
      project: project._id,
      projectName: project.name,
      requester: req.user._id,
      requesterName: req.user.name,
      items: items || [],
      urgency: urgency || 'medium',
      status: 'submitted',
      neededDate,
      notes,
      timeline: [
        {
          status: 'submitted', // Disimpan agar UI timeline mengenali warna & ikon status diajukan
          action: 'Diajukan',
          byName: req.user.name,
          byRole: req.user.role,
          notes: notes || 'Permohonan material baru diajukan dari lapangan',
        },
      ],
    });

    try {
      await notifyRoles(
        ['admin', 'manager', 'pm'],
        {
          title: 'Permintaan material baru',
          message: `${req.user.name} mengajukan ${newRequest.code} untuk proyek ${project.name}`,
          link: `/dashboard/material-requests/${newRequest._id}`,
        },
        req.user._id
      );
    } catch (e) {
      console.error('Gagal membuat notifikasi:', e.message);
    }

    return successResponse(res, {
      statusCode: 201,
      message: `Permohonan material ${newRequest.code} berhasil diajukan.`,
      data: newRequest,
    });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const request = await MaterialRequest.findById(req.params.id);

    if (!request) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Permohonan material tidak ditemukan.',
      });
    }

    const labels = {
      approved: 'Disetujui',
      rejected: 'Ditolak',
      processed: 'Diproses',
      fulfilled: 'Terpenuhi',
    };

    request.status = status;

    // Catat entri timeline baru dengan status & label yang konsisten
    request.timeline.push({
      status: status,
      action: labels[status] || 'Pembaruan Status',
      byName: req.user.name,
      byRole: req.user.role,
      notes: notes || `Status diperbarui menjadi ${labels[status] || status} oleh ${req.user.name}`,
    });

    await request.save();

    try {
      const statusMeta = {
        approved: { color: 'positive', icon: 'check_circle' },
        rejected: { color: 'negative', icon: 'cancel' },
        processed: { color: 'primary', icon: 'local_shipping' },
        fulfilled: { color: 'teal-7', icon: 'task_alt' },
      };
      const label = labels[status] || 'Diperbarui';
      const meta = statusMeta[status] || { color: 'amber-8', icon: 'inventory_2' };

      // Jangan kirim notifikasi ke diri sendiri (admin yang menyetujui permintaannya sendiri)
      if (String(request.requester) !== String(req.user._id)) {
        await notifyUser(request.requester, {
          title: `Permintaan Material ${label}`,
          message:
            `${request.code} telah ${label.toLowerCase()} oleh ${req.user.name}.` +
            (status === 'rejected' && notes ? ` Alasan: ${notes}` : ''),
          link: `/dashboard/material-requests/${request._id}`,
          color: meta.color,
          icon: meta.icon,
        });
      }
    } catch (e) {
      console.error('Gagal membuat notifikasi status:', e.message);
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Status permohonan ${request.code} berhasil ${labels[status] ? labels[status].toLowerCase() : 'diperbarui'}.`,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const request = await MaterialRequest.findById(req.params.id);

    if (!request) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Permohonan material tidak ditemukan.',
      });
    }

    const deletableStatuses = ['draft', 'submitted', 'rejected'];
    if (!deletableStatuses.includes(request.status)) {
      return errorResponse(res, {
        statusCode: 409,
        message: `Permohonan dengan status "${request.status}" tidak dapat dihapus.`,
      });
    }

    await MaterialRequest.findByIdAndDelete(req.params.id);

    return successResponse(res, {
      statusCode: 200,
      message: `Permohonan material ${request.code} berhasil dihapus.`,
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
