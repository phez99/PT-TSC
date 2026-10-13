// ============================================================
// PROJECTS SERVICE
// Backend: /api/v1/projects  (api.js sudah membuka { data } dari respons)
//
// Mock localStorage HANYA aktif jika SEMUA kondisi ini terpenuhi:
//   1. mode development (import.meta.env.DEV)
//   2. VITE_USE_MOCK=true di file .env frontend
//   3. backend tidak terjangkau (network error / tidak ada status HTTP)
// Error dari backend (401/403/404/409/500, dst.) SELALU diteruskan ke UI.
// ============================================================
import { api } from './api.js';

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

// Backend (MongoDB) memakai _id, UI memakai id (termasuk untuk anggota proyek)
const normalizeProject = (p) => ({
  ...p,
  id: p._id || p.id,
  members: (p.members || []).map((m) => ({ ...m, id: m._id || m.id })),
});

async function withFallback(apiCall, mockCall) {
  try {
    return await apiCall();
  } catch (err) {
    if (USE_MOCK && isNetworkError(err)) {
      console.warn('[Projects mock fallback]:', err.message);
      return mockCall();
    }
    throw err;
  }
}

// ------------------- Data mock (DEV saja) -------------------

const STORAGE_KEY = 'tsc_projects';

const SEED = [
  {
    id: 1,
    code: 'PRJ-2026-001',
    name: 'Contoh: Gedung Perkantoran - CCTV & Access Control',
    client: 'PT Contoh Klien A',
    location: 'Jakarta Selatan',
    category: 'electronic',
    status: 'ongoing',
    startDate: '2026-06-01',
    endDate: '2026-12-15',
    progress: 45,
    members: [
      { id: 101, name: 'Budi Santoso', role: 'Project Manager' },
      { id: 102, name: 'Dedi Kurniawan', role: 'Site Engineer' },
    ],
  },
  {
    id: 2,
    code: 'PRJ-2026-002',
    name: 'Contoh: Pabrik - Instalasi Genset & Panel',
    client: 'PT Contoh Klien B',
    location: 'Bekasi',
    category: 'electrical',
    status: 'planning',
    startDate: '2026-10-01',
    endDate: '2027-01-30',
    progress: 0,
    members: [{ id: 201, name: 'Rina Marlina', role: 'Project Manager' }],
  },
  {
    id: 3,
    code: 'PRJ-2026-003',
    name: 'Contoh: Apartemen - HVAC & Plumbing',
    client: 'PT Contoh Klien C',
    location: 'Jakarta Utara',
    category: 'mechanical',
    status: 'done',
    startDate: '2026-01-10',
    endDate: '2026-08-20',
    progress: 100,
    members: [],
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
    console.error('Error writing projects:', e);
  }
}

// ------------------------- API -------------------------

// options.archived: 'true' → hanya proyek terarsip, 'all' → semuanya (khusus admin & manager).
// Tanpa opsi, backend hanya mengirim proyek yang tidak terarsip.
export function getProjects({ archived } = {}) {
  const query = archived ? `?archived=${encodeURIComponent(archived)}` : '';
  return withFallback(
    async () => {
      const data = await api.get(`/projects${query}`);
      // Daftar kosong dari database adalah hasil yang sah, bukan alasan memakai data contoh
      if (!Array.isArray(data)) throw badResponse('Respons daftar proyek tidak valid');
      return data.map(normalizeProject);
    },
    async () => {
      await delay();
      const list = read();
      if (archived === 'all') return list;
      return list.filter((p) => (archived === 'true' ? p.isArchived : !p.isArchived));
    }
  );
}

export function getProject(id) {
  return withFallback(
    async () => {
      try {
        const p = await api.get(`/projects/${id}`);
        return p ? normalizeProject(p) : null;
      } catch (err) {
        if (err?.status === 404) return null; // halaman detail menampilkan "tidak ditemukan"
        throw err;
      }
    },
    async () => {
      await delay(150);
      return read().find((p) => sameId(p.id, id)) ?? null;
    }
  );
}

export function createProject(data) {
  return withFallback(
    async () => {
      const p = await api.post('/projects', data);
      if (!p) throw badResponse('Respons pembuatan proyek tidak valid');
      return normalizeProject(p);
    },
    async () => {
      await delay();
      const list = read();
      const id = list.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
      const project = {
        ...data,
        id,
        code: `PRJ-${new Date().getFullYear()}-${String(id).padStart(3, '0')}`,
        progress: 0,
        members: [],
      };
      list.unshift(project);
      write(list);
      return project;
    }
  );
}

export function updateProject(id, patch) {
  return withFallback(
    async () => {
      const p = await api.put(`/projects/${id}`, patch);
      if (!p) throw badResponse('Respons pembaruan proyek tidak valid');
      return normalizeProject(p);
    },
    async () => {
      await delay(150);
      const list = read();
      const index = list.findIndex((p) => sameId(p.id, id));
      if (index === -1) throw new Error('Proyek tidak ditemukan');
      list[index] = { ...list[index], ...patch };
      write(list);
      return list[index];
    }
  );
}

// ------------------------- Arsip & hapus -------------------------
// Backend: PUT /projects/:id/archive, PUT /projects/:id/restore (admin),
//          DELETE /projects/:id (admin, hanya proyek 'planning' tanpa relasi).

export function archiveProject(id, reason = '') {
  return withFallback(
    async () => {
      const p = await api.put(`/projects/${id}/archive`, { reason });
      if (!p) throw badResponse('Respons pengarsipan proyek tidak valid');
      return normalizeProject(p);
    },
    async () => {
      await delay(150);
      const list = read();
      const index = list.findIndex((p) => sameId(p.id, id));
      if (index === -1) throw new Error('Proyek tidak ditemukan');
      list[index] = { ...list[index], isArchived: true, archiveReason: reason };
      write(list);
      return list[index];
    }
  );
}

export function restoreProject(id) {
  return withFallback(
    async () => {
      const p = await api.put(`/projects/${id}/restore`, {});
      if (!p) throw badResponse('Respons pemulihan proyek tidak valid');
      return normalizeProject(p);
    },
    async () => {
      await delay(150);
      const list = read();
      const index = list.findIndex((p) => sameId(p.id, id));
      if (index === -1) throw new Error('Proyek tidak ditemukan');
      list[index] = { ...list[index], isArchived: false, archiveReason: '' };
      write(list);
      return list[index];
    }
  );
}

export function deleteProject(id) {
  return withFallback(
    async () => {
      await api.delete(`/projects/${id}`);
      return true;
    },
    async () => {
      await delay(150);
      write(read().filter((p) => !sameId(p.id, id)));
      return true;
    }
  );
}

// ------------------------- Anggota proyek -------------------------
// Backend: POST /projects/:id/members  dan  DELETE /projects/:id/members/:memberId
// Keduanya mengembalikan proyek terbaru (dengan daftar anggota).

export function addMember(projectId, member) {
  const { id: _id, ...payload } = member || {};
  return withFallback(
    async () => {
      const p = await api.post(`/projects/${projectId}/members`, payload);
      if (!p) throw badResponse('Respons penambahan anggota tidak valid');
      return normalizeProject(p);
    },
    async () => {
      await delay(150);
      const list = read();
      const project = list.find((p) => sameId(p.id, projectId));
      if (!project) throw new Error('Proyek tidak ditemukan');
      project.members.push({ id: Date.now(), ...payload });
      write(list);
      return project;
    }
  );
}

export function removeMember(projectId, memberId) {
  return withFallback(
    async () => {
      const p = await api.delete(`/projects/${projectId}/members/${memberId}`);
      if (!p) throw badResponse('Respons penghapusan anggota tidak valid');
      return normalizeProject(p);
    },
    async () => {
      await delay(150);
      const list = read();
      const project = list.find((p) => sameId(p.id, projectId));
      if (!project) throw new Error('Proyek tidak ditemukan');
      project.members = project.members.filter((m) => !sameId(m.id, memberId));
      write(list);
      return project;
    }
  );
}
