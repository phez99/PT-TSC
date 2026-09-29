// ============================================================
// PROJECTS SERVICE (MOCK)
// Sementara backend Express belum ada, data disimpan di
// localStorage browser (kunci: tsc_projects) supaya data yang
// kamu tambah tidak hilang saat halaman di-refresh.
//
// Semua halaman hanya memanggil fungsi di file ini. Saat Express
// siap, ganti ISI fungsi-fungsinya dengan panggilan axios, contoh:
//   getProjects()   → const { data } = await api.get('/projects'); return data
//   createProject() → const { data } = await api.post('/projects', payload); return data
// Bentuk data yang dikembalikan tidak perlu berubah.
// ============================================================

const STORAGE_KEY = 'tsc_projects';

// Data contoh. HAPUS saat sudah pakai backend sungguhan.
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

export async function getProjects() {
  await delay();
  return read();
}

export async function getProject(id) {
  await delay(150);
  return read().find((p) => p.id === Number(id)) ?? null;
}

export async function createProject(data) {
  await delay();
  const list = read();
  const id = list.reduce((max, p) => Math.max(max, p.id), 0) + 1;
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

export async function updateProject(id, patch) {
  await delay(150);
  const list = read();
  const index = list.findIndex((p) => p.id === Number(id));
  if (index === -1) throw new Error('Proyek tidak ditemukan');
  list[index] = { ...list[index], ...patch };
  write(list);
  return list[index];
}

export async function addMember(projectId, member) {
  await delay(150);
  const list = read();
  const project = list.find((p) => p.id === Number(projectId));
  if (!project) throw new Error('Proyek tidak ditemukan');
  project.members.push({ id: Date.now(), ...member });
  write(list);
  return project;
}

export async function removeMember(projectId, memberId) {
  await delay(150);
  const list = read();
  const project = list.find((p) => p.id === Number(projectId));
  if (!project) throw new Error('Proyek tidak ditemukan');
  project.members = project.members.filter((m) => m.id !== memberId);
  write(list);
  return project;
}
