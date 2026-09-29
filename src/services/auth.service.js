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

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function login(email, password) {
  await delay(400) // simulasi waktu request jaringan

  const users = readUsers()
  const found = users.find(u => u.email === email && u.password === password)
  if (!found) {
    throw new Error('Email atau password salah')
  }

  // eslint-disable-next-line no-unused-vars
  const { password: _password, ...user } = found
  return { token: `mock-token-${user.id}`, user }
}

export async function getUsers() {
  await delay(150)
  return readUsers()
}

export async function createUser(data) {
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
  await delay(150)
  const list = readUsers()
  const index = list.findIndex(u => u.id === Number(id))
  if (index === -1) throw new Error('Pengguna tidak ditemukan')
  list[index] = { ...list[index], ...patch }
  writeUsers(list)
  return list[index]
}

export async function changePassword(userId, oldPassword, newPassword) {
  await delay(200)
  const list = readUsers()
  const user = list.find(u => u.id === Number(userId))
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
  list = list.filter(u => u.id !== Number(id))
  writeUsers(list)
  return true
}
