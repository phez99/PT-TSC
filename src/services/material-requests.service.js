// ============================================================
// MATERIAL REQUESTS SERVICE
// Backend: /api/v1/material-requests  (api.js sudah membuka { data } dari respons)
//
// Mock localStorage HANYA aktif jika SEMUA kondisi ini terpenuhi:
//    1. mode development (import.meta.env.DEV)
//    2. VITE_USE_MOCK=true di file .env frontend
//    3. backend tidak terjangkau (network error / tidak ada status HTTP)
// Error dari backend (401/403/404/409/500, dst.) SELALU diteruskan ke UI.
// ============================================================
import { api } from './api.js';
import { availableActions, APPROVAL_ACTIONS } from '/src/config/approval.js';

const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

// ------------------------- Helper -------------------------

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const isNetworkError = (e) => (e?.status ?? e?.response?.status) === undefined;
const sameId = (a, b) => String(a) === String(b);

function badResponse(message) {
  const err = new Error(message);
  err.status = 500; // supaya tidak dianggap network error dan tidak jatuh ke mock
  return err;
}

const PRIORITY_MAP = {
  low: 'normal',
  medium: 'normal',
  normal: 'normal',
  high: 'urgent',
  urgent: 'urgent',
};

// Backend (MongoDB) memakai _id dan urgency, UI memakai id dan priority
// Normalisasi data langsung apa adanya dari database
const normalizeMaterialRequest = (r) => {
  const priority =
    PRIORITY_MAP[String(r.priority || r.urgency || 'normal').toLowerCase()] ?? 'normal';

  const mappedHistory = (r.history || r.timeline || []).map((h) => ({
    status: h.status || 'submitted',
    action: h.action || 'Pembaruan Status',
    by: h.byName || h.by || 'System',
    at: h.at || h.createdAt,
    note: h.notes || h.note || '',
  }));

  return {
    ...r,
    id: r._id || r.id,
    projectId: r.project?._id || r.projectId,
    requesterId: r.requester?._id || r.requester || r.requesterId,
    requesterPosition: r.requester?.position || r.requesterPosition,
    priority,
    history: mappedHistory,
    items: (r.items || []).map((it) => ({
      ...it,
      id: it._id || it.id,
      name: it.itemName || it.name,
    })),
  };
};

async function withFallback(apiCall, mockCall) {
  try {
    return await apiCall();
  } catch (err) {
    if (USE_MOCK && isNetworkError(err)) {
      console.warn('[Material Requests mock fallback]:', err.message);
      return mockCall();
    }
    throw err;
  }
}

// ------------------- Data mock (DEV saja) -------------------

const STORAGE_KEY = 'tsc_material_requests';

const SEED = [
  {
    id: 1,
    code: 'MR-2026-001',
    projectId: 1,
    requesterId: 5,
    requesterName: 'Staf Teknisi',
    requesterPosition: 'Teknisi Lapangan',
    neededDate: '2026-10-10',
    priority: 'normal',
    notes: 'Untuk pemasangan CCTV lantai 3',
    items: [
      { id: 11, name: 'Kabel UTP Cat6', qty: 5, unit: 'roll' },
      { id: 12, name: 'Konektor RJ45', qty: 200, unit: 'pcs' },
    ],
    status: 'submitted',
    history: [
      {
        status: 'submitted',
        by: 'Staf Teknisi',
        at: '2026-09-25T09:00:00.000Z',
        note: '',
      },
    ],
  },
  {
    id: 2,
    code: 'MR-2026-002',
    projectId: 1,
    requesterId: 3,
    requesterName: 'Project Manager',
    requesterPosition: 'Project Manager',
    neededDate: '2026-10-05',
    priority: 'urgent',
    notes: '',
    items: [
      { id: 21, name: 'Kamera CCTV dome', qty: 8, unit: 'unit' },
      { id: 22, name: 'Hard disk 4TB', qty: 1, unit: 'unit' },
    ],
    status: 'approved',
    history: [
      {
        status: 'submitted',
        by: 'Project Manager',
        at: '2026-09-24T08:30:00.000Z',
        note: '',
      },
      {
        status: 'approved',
        by: 'Manager TSC',
        at: '2026-09-24T13:10:00.000Z',
        note: '',
      },
    ],
  },
];

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // data rusak → pakai data contoh lagi
  }
  write(SEED);
  return JSON.parse(JSON.stringify(SEED));
}

function write(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error writing material requests:', e);
  }
}

// ------------------------- API -------------------------

export function getMaterialRequests() {
  return withFallback(
    async () => {
      const data = await api.get('/material-requests');
      if (!Array.isArray(data)) throw badResponse('Respons daftar permintaan material tidak valid');
      return data.map(normalizeMaterialRequest);
    },
    async () => {
      await delay();
      return read();
    }
  );
}

export function getMaterialRequest(id) {
  return withFallback(
    async () => {
      try {
        const r = await api.get(`/material-requests/${id}`);
        return r ? normalizeMaterialRequest(r) : null;
      } catch (err) {
        if (err?.status === 404) return null;
        throw err;
      }
    },
    async () => {
      await delay(150);
      return read().find((r) => sameId(r.id, id)) ?? null;
    }
  );
}

export function createMaterialRequest(data, user) {
  return withFallback(
    async () => {
      // Petakan nilai 'normal' menjadi 'medium' (atau sesuaikan dengan enum database Anda: low/medium/high)
      let urgencyValue = data.priority;
      if (urgencyValue === 'normal') urgencyValue = 'medium';
      if (urgencyValue === 'urgent') urgencyValue = 'high';

      const payload = {
        projectId: data.projectId,
        neededDate: data.neededDate,
        urgency: urgencyValue, // Menggunakan nilai yang diterima enum backend
        notes: data.notes,
        items: (data.items || []).map((it) => ({
          itemName: it.name,
          qty: it.qty,
          unit: it.unit,
        })),
      };

      const r = await api.post('/material-requests', payload);
      if (!r) throw badResponse('Respons pembuatan permintaan material tidak valid');
      return normalizeMaterialRequest(r);
    },
    async () => {
      // Bagian fallback mock localStorage tetap menggunakan data asli
      await delay();
      const list = read();
      const id = list.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
      const request = {
        ...data,
        id,
        code: `MR-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`,
        projectId: Number(data.projectId),
        requesterId: user?.id,
        requesterName: user?.name || 'Unknown',
        requesterPosition: user?.position || user?.role || '-',
        items: (data.items || []).map((item, i) => ({ id: Date.now() + i, ...item })),
        status: 'submitted',
        history: [
          {
            status: 'submitted',
            by: user?.name || 'Unknown',
            at: new Date().toISOString(),
            note: '',
          },
        ],
      };
      list.unshift(request);
      write(list);
      return request;
    }
  );
}

export function applyAction(id, action, user, note = '') {
  return withFallback(
    async () => {
      const config = APPROVAL_ACTIONS[action];
      if (!config) throw new Error('Aksi tidak valid');

      // Langsung kirim status dari config (misal: 'processed', 'approved', 'rejected')
      const payload = {
        status: config.status,
        notes: note,
      };

      const r = await api.put(`/material-requests/${id}/status`, payload);
      if (!r) throw badResponse('Respons pembaruan status material tidak valid');
      return normalizeMaterialRequest(r);
    },
    async () => {
      // Mock fallback localStorage tetap bersih
      await delay(200);
      const list = read();
      const request = list.find((r) => sameId(r.id, id));
      if (!request) throw new Error('Permintaan tidak ditemukan');

      request.status = config.status;
      request.timeline.push({
        action: config.label,
        byName: user?.name || 'Unknown',
        byRole: user?.role || '-',
        notes: note,
        createdAt: new Date().toISOString(),
      });

      write(list);
      return request;
    }
  );
}

export function deleteMaterialRequest(id) {
  return withFallback(
    async () => {
      await api.delete(`/material-requests/${id}`);
      return true;
    },
    async () => {
      await delay(200);
      const list = read();
      const filtered = list.filter((r) => !sameId(r.id, id));
      write(filtered);
      return true;
    }
  );
}
