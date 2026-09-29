import { availableActions, APPROVAL_ACTIONS } from '/src/config/approval.js';

// ============================================================
// MATERIAL REQUESTS SERVICE (MOCK)
// Data disimpan di localStorage (kunci: tsc_material_requests).
// Saat Express siap, ganti ISI fungsi-fungsi ini dengan panggilan
// axios; bentuk data yang dikembalikan tidak perlu berubah.
//
// Data proyek TIDAK disalin ke sini, hanya projectId. Nama proyek
// diambil dari projects.service (seperti relasi tabel di database).
//
// PENTING: pengecekan "siapa boleh menyetujui" di applyAction()
// hanya untuk pengembangan. Di Express, pengecekan yang sama HARUS
// dilakukan di server.
// ============================================================

const STORAGE_KEY = 'tsc_material_requests';

// Data contoh. HAPUS saat sudah pakai backend sungguhan.
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
      { status: 'submitted', by: 'Staf Teknisi', at: '2026-09-25T09:00:00.000Z', note: '' },
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
      { status: 'submitted', by: 'Project Manager', at: '2026-09-24T08:30:00.000Z', note: '' },
      { status: 'approved', by: 'Manager TSC', at: '2026-09-24T13:10:00.000Z', note: '' },
    ],
  },
  {
    id: 3,
    code: 'MR-2026-003',
    projectId: 2,
    requesterId: 5,
    requesterName: 'Staf Teknisi',
    requesterPosition: 'Teknisi Lapangan',
    neededDate: '2026-10-20',
    priority: 'normal',
    notes: '',
    items: [{ id: 31, name: 'Panel box', qty: 2, unit: 'unit' }],
    status: 'rejected',
    history: [
      { status: 'submitted', by: 'Staf Teknisi', at: '2026-09-22T10:00:00.000Z', note: '' },
      {
        status: 'rejected',
        by: 'Manager TSC',
        at: '2026-09-23T09:15:00.000Z',
        note: 'Spesifikasi kurang jelas, mohon dilengkapi.',
      },
    ],
  },
];

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function getMaterialRequests() {
  await delay();
  return read();
}

export async function getMaterialRequest(id) {
  await delay(150);
  return read().find((r) => r.id === Number(id)) ?? null;
}

// data: { projectId, neededDate, priority, notes, items: [{ name, qty, unit }] }
// user: { id, name } → orang yang login
export async function createMaterialRequest(data, user) {
  await delay();
  const list = read();
  const id = list.reduce((max, r) => Math.max(max, r.id), 0) + 1;

  const request = {
    id,
    code: `MR-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`,
    projectId: Number(data.projectId),
    requesterId: user.id,
    requesterName: user.name,
    requesterPosition: user.position || '-',
    neededDate: data.neededDate,
    priority: data.priority,
    notes: data.notes || '',
    items: data.items.map((item, i) => ({ id: Date.now() + i, ...item })),
    status: 'submitted',
    history: [{ status: 'submitted', by: user.name, at: new Date().toISOString(), note: '' }],
  };

  list.unshift(request);
  write(list);
  return request;
}

// action: 'approve' | 'reject' | 'process'
export async function applyAction(id, action, user, note = '') {
  await delay(200);
  const list = read();
  const request = list.find((r) => r.id === Number(id));
  if (!request) throw new Error('Permintaan tidak ditemukan');

  if (!availableActions(request.status, user.role).includes(action)) {
    throw new Error('Anda tidak berhak melakukan aksi ini pada status saat ini');
  }

  const config = APPROVAL_ACTIONS[action];
  if (config.needsNote && !note.trim()) {
    throw new Error('Catatan wajib diisi');
  }

  request.status = config.status;
  request.history.push({
    status: config.status,
    by: user.name,
    at: new Date().toISOString(),
    note: note.trim(),
  });

  write(list);
  return request;
}
