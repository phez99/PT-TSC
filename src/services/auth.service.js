// ============================================================
// AUTH SERVICE
// Semua halaman memanggil fungsi di file ini.
// Backend: /api/v1/auth/*  (lihat routes/authRoutes.js)
//
// Mock localStorage HANYA aktif jika SEMUA kondisi ini terpenuhi:
//   1. mode development (import.meta.env.DEV)
//   2. VITE_USE_MOCK=true di file .env frontend
//   3. backend tidak terjangkau (network error / tidak ada status HTTP)
// Error dari backend (400/401/403/409/500, dst.) SELALU diteruskan ke UI.
// ============================================================
import { api, setAuthToken } from './api.js';

const USE_MOCK = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === 'true';

// ------------------------- Helper -------------------------

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const statusOf = (e) => e?.status ?? e?.response?.status;
const isNetworkError = (e) => statusOf(e) === undefined;

function badResponse(message) {
  const err = new Error(message);
  err.status = 500; // supaya tidak dianggap network error dan tidak jatuh ke mock
  return err;
}

// Mendukung bentuk respons: body langsung, { success, message, data }, atau axios response
function unwrap(res) {
  let body = res;
  if (body?.config && body?.headers && body?.data !== undefined) body = body.data;
  if (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    'data' in body &&
    !('token' in body)
  ) {
    body = body.data;
  }
  return body;
}

// Backend memakai isActive (boolean), UI memakai status ('active' | 'inactive')
function normalizeUser(u) {
  if (!u) return u;
  const { password: _password, ...rest } = u;
  return {
    ...rest,
    id: u._id || u.id,
    status: u.status ?? (u.isActive === false ? 'inactive' : 'active'),
  };
}

function toApiPayload(data = {}) {
  const { status, id: _id, _id: __id, ...rest } = data;
  if (status !== undefined) rest.isActive = status === 'active';
  if (!rest.password) delete rest.password;
  return rest;
}

async function withFallback(apiCall, mockCall) {
  try {
    return await apiCall();
  } catch (err) {
    if (USE_MOCK && isNetworkError(err)) {
      console.warn('[Auth mock fallback]:', err.message);
      return mockCall();
    }
    throw err;
  }
}

// ------------------- Data mock (DEV saja) -------------------

const STORAGE_KEY = 'tsc_users';

const SEED_USERS = [
  {
    id: 1,
    name: 'Admin TSC',
    email: 'admin@tsc.local',
    password: 'admin123',
    role: 'admin',
    position: 'Administrator',
    phone: '+62 812-1050-1101',
    status: 'active',
  },
  {
    id: 2,
    name: 'Manager TSC',
    email: 'manager@tsc.local',
    password: 'manager123',
    role: 'manager',
    position: 'Manager Operasional',
    phone: '+62 812-1050-1102',
    status: 'active',
  },
  {
    id: 3,
    name: 'Project Manager',
    email: 'pm@tsc.local',
    password: 'pm123',
    role: 'pm',
    position: 'Project Manager',
    phone: '+62 812-1050-1103',
    status: 'active',
  },
  {
    id: 4,
    name: 'Finance TSC',
    email: 'finance@tsc.local',
    password: 'finance123',
    role: 'finance',
    position: 'Staff Finance',
    phone: '+62 812-1050-1104',
    status: 'active',
  },
  {
    id: 5,
    name: 'Staf Teknisi',
    email: 'staff@tsc.local',
    password: 'staff123',
    role: 'staff',
    position: 'Teknisi Lapangan',
    phone: '+62 812-1050-1105',
    status: 'active',
  },
];

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading users:', e);
  }
  writeUsers(SEED_USERS);
  return JSON.parse(JSON.stringify(SEED_USERS));
}

function writeUsers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error writing users:', e);
  }
}

const sameId = (a, b) => String(a) === String(b);
const stripPassword = ({ password: _password, ...rest }) => rest;

// ------------------------- API -------------------------

export function login(email, password) {
  return withFallback(
    async () => {
      const body = unwrap(await api.post('/auth/login', { email, password }));
      if (!body?.token || !body?.user) {
        throw badResponse('Respons login dari server tidak valid');
      }
      setAuthToken(body.token);
      return { token: body.token, user: normalizeUser(body.user) };
    },
    async () => {
      await delay(200);
      const found = readUsers().find((u) => u.email === email && u.password === password);
      if (!found) throw new Error('Email atau password salah');
      const user = stripPassword(found);
      const token = `mock-token-${user.id}`;
      setAuthToken(token);
      return { token, user };
    }
  );
}

export function getUsers() {
  return withFallback(
    async () => {
      const list = unwrap(await api.get('/auth/users'));
      if (!Array.isArray(list)) throw badResponse('Respons daftar pengguna tidak valid');
      return list.map(normalizeUser);
    },
    async () => {
      await delay(150);
      return readUsers().map(stripPassword);
    }
  );
}

export function createUser(data) {
  return withFallback(
    async () => {
      const user = unwrap(await api.post('/auth/users', toApiPayload(data)));
      if (!user) throw badResponse('Respons pembuatan pengguna tidak valid');
      return normalizeUser(user);
    },
    async () => {
      await delay(200);
      const list = readUsers();
      if (list.some((u) => u.email === data.email)) {
        throw new Error('Email tersebut sudah terdaftar pada sistem.');
      }
      const id = list.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
      const newUser = { ...data, id, status: data.status || 'active' };
      list.push(newUser);
      writeUsers(list);
      return stripPassword(newUser);
    }
  );
}

export function updateUser(id, patch) {
  return withFallback(
    async () => {
      const user = unwrap(await api.put(`/auth/users/${id}`, toApiPayload(patch)));
      if (!user) throw badResponse('Respons pembaruan pengguna tidak valid');
      return normalizeUser(user);
    },
    async () => {
      await delay(150);
      const list = readUsers();
      const index = list.findIndex((u) => sameId(u.id, id));
      if (index === -1) throw new Error('Pengguna tidak ditemukan');
      list[index] = { ...list[index], ...patch };
      writeUsers(list);
      return stripPassword(list[index]);
    }
  );
}

export function changePassword(_userId, oldPassword, newPassword) {
  return withFallback(
    async () => {
      await api.put('/auth/change-password', {
        currentPassword: oldPassword,
        newPassword,
      });
      return true;
    },
    async () => {
      await delay(200);
      const list = readUsers();
      const user = list.find((u) => sameId(u.id, _userId));
      if (!user) throw new Error('Pengguna tidak ditemukan');
      if (user.password !== oldPassword) throw new Error('Password saat ini tidak sesuai');
      user.password = newPassword;
      writeUsers(list);
      return true;
    }
  );
}

// Backend tidak punya hard delete (data presensi/proyek/invoice masih merujuk ke user),
// jadi "hapus" = nonaktifkan akun (isActive: false) lewat PUT /auth/users/:id.
export function deleteUser(id) {
  return withFallback(
    async () => {
      await api.put(`/auth/users/${id}`, { isActive: false });
      return true;
    },
    async () => {
      await delay(150);
      writeUsers(readUsers().filter((u) => !sameId(u.id, id)));
      return true;
    }
  );
}
