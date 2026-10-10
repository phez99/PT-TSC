// ============================================================
// AUTH SERVICE (MOCK)
// Sementara backend Express belum ada, login dicek ke data
// contoh di bawah. Semua halaman memanggil fungsi di file ini,
// jadi saat Express siap, CUKUP ubah isi fungsi login() di sini.
//
// Nanti (dengan axios):
//   const { data } = await api.post('/auth/login', { email, password })
//   return data   // bentuknya tetap: { token, user }
// ============================================================

// HAPUS blok DEMO_USERS ini saat sudah pakai backend sungguhan.
const STORAGE_KEY = 'tsc_users'

const SEED_USERS = [
  {
    id: 1,
    name: 'Admin TSC',
    email: 'admin@tsc.local',
    password: 'admin123',
    role: 'admin',
    position: 'Administrator',
    phone: '+62 812-1050-1101',
    status: 'active'
  },
  {
    id: 2,
    name: 'Manager TSC',
    email: 'manager@tsc.local',
    password: 'manager123',
    role: 'manager',
    position: 'Manager Operasional',
    phone: '+62 812-1050-1102',
    status: 'active'
  },
  {
    id: 3,
    name: 'Project Manager',
    email: 'pm@tsc.local',
    password: 'pm123',
    role: 'pm',
    position: 'Project Manager',
    phone: '+62 812-1050-1103',
    status: 'active'
  },
  {
    id: 4,
    name: 'Finance TSC',
    email: 'finance@tsc.local',
    password: 'finance123',
    role: 'finance',
    position: 'Staff Finance',
    phone: '+62 812-1050-1104',
    status: 'active'
  },
  {
    id: 5,
    name: 'Staf Teknisi',
    email: 'staff@tsc.local',
    password: 'staff123',
    role: 'staff',
    position: 'Teknisi Lapangan',
    phone: '+62 812-1050-1105',
    status: 'active'
  }
]

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading users:', e)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS))
  return JSON.parse(JSON.stringify(SEED_USERS))
}

function writeUsers(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

import { api, setAuthToken } from './api.js'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function login(email, password) {
  try {
    const res = await api.post('/auth/login', { email, password })
    if (res?.token) {
      setAuthToken(res.token)
      const user = {
        ...res.user,
        id: res.user._id || res.user.id
      }
      return { token: res.token, user }
    }
  } catch (err) {
    console.warn('[API Auth Notice]:', err.message)
    // Jika backend secara eksplisit mengembalikan 401 (password salah), lempar error aslinya
    if (err.status === 401 || err.status === 400 || err.status === 403) {
      throw err
    }
  }

  // Fallback lokal jika backend belum terhubung ke Atlas
  await delay(200)
  const users = readUsers()
  const found = users.find(u => u.email === email && u.password === password)
  if (!found) {
    throw new Error('Email atau password salah')
  }

  const { password: _password, ...user } = found
  setAuthToken(`mock-token-${user.id}`)
  return { token: `mock-token-${user.id}`, user }
}

export async function getUsers() {
  try {
    const data = await api.get('/auth/users')
    if (Array.isArray(data)) {
      return data.map(u => ({ ...u, id: u._id || u.id }))
    }
  } catch (e) {
    console.warn('[API Get Users Notice]:', e.message)
  }
  await delay(150)
  return readUsers()
}

export async function createUser(data) {
  try {
    const res = await api.post('/auth/users', data)
    if (res) return { ...res, id: res._id || res.id }
  } catch (e) {
    console.warn('[API Create User Notice]:', e.message)
  }
  await delay(200)
  const list = readUsers()
  const id = list.reduce((max, u) => Math.max(max, u.id), 0) + 1
  const newUser = {
    ...data,
    id,
    status: data.status || 'active'
  }
  list.push(newUser)
  writeUsers(list)
  return newUser
}

export async function updateUser(id, patch) {
  try {
    const res = await api.put(`/auth/users/${id}`, patch)
    if (res) return { ...res, id: res._id || res.id }
  } catch (e) {
    console.warn('[API Update User Notice]:', e.message)
  }
  await delay(150)
  const list = readUsers()
  const index = list.findIndex(u => u.id === Number(id) || u.id === id)
  if (index === -1) throw new Error('Pengguna tidak ditemukan')
  list[index] = { ...list[index], ...patch }
  writeUsers(list)
  return list[index]
}

export async function changePassword(userId, oldPassword, newPassword) {
  try {
    await api.put('/auth/change-password', {
      currentPassword: oldPassword,
      newPassword
    })
    return true
  } catch (e) {
    console.warn('[API Change Password Notice]:', e.message)
  }
  await delay(200)
  const list = readUsers()
  const user = list.find(u => u.id === Number(userId) || u.id === userId)
  if (!user) throw new Error('Pengguna tidak ditemukan')
  if (user.password !== oldPassword) {
    throw new Error('Password saat ini tidak sesuai')
  }
  user.password = newPassword
  writeUsers(list)
  return true
}

export async function deleteUser(id) {
  await delay(150)
  let list = readUsers()
  list = list.filter(u => u.id !== Number(id) && u.id !== id)
  writeUsers(list)
  return true
}
