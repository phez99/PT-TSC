// ============================================================
// ATTENDANCE SERVICE (ABSENSI KARYAWAN & TEKNISI LAPANGAN)
// ============================================================

const STORAGE_KEY = 'tsc_attendance'

const SEED_ATTENDANCE = [
  {
    id: 1,
    userId: 5,
    userName: 'Staf Teknisi',
    userRole: 'staff',
    position: 'Teknisi Lapangan',
    date: '2026-10-09',
    clockIn: '07:55',
    clockOut: '17:10',
    location: 'Proyek Puri Mansion Apartemen',
    status: 'ontime', // ontime | late | leave | sick
    notes: 'Pemasangan kabel tray FO dan terminasi patch panel rack 2.',
    photo: null,
    coords: {
      latitude: -6.183412,
      longitude: 106.721405,
      accuracy: 12,
      address: 'Jl. Lingkar Luar Barat No. 8, Kembangan, Jakarta Barat'
    },
    apdList: [
      'Helm Keselamatan (Safety Helmet)',
      'Rompi Reflektor',
      'Sepatu Safety'
    ],
    healthStatus: 'fit'
  },
  {
    id: 2,
    userId: 3,
    userName: 'Project Manager',
    userRole: 'pm',
    position: 'Project Manager',
    date: '2026-10-09',
    clockIn: '08:10',
    clockOut: null,
    location: 'Kawasan Industri MM2100 Bekasi',
    status: 'ontime',
    notes:
      'Supervisi pengiriman panel genset 500kVA dan koordinasi dengan safety officer pabrik.',
    photo: null,
    coords: {
      latitude: -6.311245,
      longitude: 107.098712,
      accuracy: 15,
      address: 'Kawasan Industri MM2100 Blok C-2, Cikarang Barat, Bekasi'
    },
    apdList: [
      'Helm Keselamatan (Safety Helmet)',
      'Rompi Reflektor',
      'Sepatu Safety',
      'Full Body Harness'
    ],
    healthStatus: 'fit'
  },
  {
    id: 3,
    userId: 4,
    userName: 'Finance TSC',
    userRole: 'finance',
    position: 'Staff Finance',
    date: '2026-10-09',
    clockIn: '08:25',
    clockOut: null,
    location: 'Head Office - Ruko Newton Square',
    status: 'ontime',
    notes:
      'Rekonsiliasi invoice termin September dan verifikasi berkas faktur pajak.',
    photo: null,
    coords: {
      latitude: -6.372504,
      longitude: 106.942118,
      accuracy: 8,
      address: 'Ruko Newton Square U18/30, Legenda Wisata, Gn. Putri, Bogor'
    },
    apdList: ['ID Badge Karyawan'],
    healthStatus: 'fit'
  },
  {
    id: 4,
    userId: 2,
    userName: 'Manager TSC',
    userRole: 'manager',
    position: 'Manager Operasional',
    date: '2026-10-09',
    clockIn: '08:05',
    clockOut: null,
    location: 'Head Office - Ruko Newton Square',
    status: 'ontime',
    notes: 'Review mingguan BAST proyek Sunter dan approval material request.',
    photo: null,
    coords: {
      latitude: -6.372504,
      longitude: 106.942118,
      accuracy: 9,
      address: 'Ruko Newton Square U18/30, Legenda Wisata, Gn. Putri, Bogor'
    },
    apdList: ['ID Badge Karyawan'],
    healthStatus: 'fit'
  },
  {
    id: 5,
    userId: 1,
    userName: 'Admin TSC',
    userRole: 'admin',
    position: 'Administrator',
    date: '2026-10-09',
    clockIn: '07:45',
    clockOut: null,
    location: 'Head Office - Ruko Newton Square',
    status: 'ontime',
    notes: 'Pemeliharaan server portal dan backup database operasional.',
    photo: null,
    coords: {
      latitude: -6.372504,
      longitude: 106.942118,
      accuracy: 10,
      address: 'Ruko Newton Square U18/30, Legenda Wisata, Gn. Putri, Bogor'
    },
    apdList: ['ID Badge Karyawan'],
    healthStatus: 'fit'
  }
]

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed reading attendance:', e)
  }
  write(SEED_ATTENDANCE)
  return JSON.parse(JSON.stringify(SEED_ATTENDANCE))
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

import { api } from './api.js'

export async function getAttendanceList() {
  try {
    const data = await api.get('/attendance')
    if (Array.isArray(data) && data.length > 0) {
      return data.map(item => ({
        ...item,
        id: item._id || item.id
      }))
    }
  } catch (e) {
    console.warn('[API Attendance Notice]:', e.message)
  }
  await delay()
  return read()
}

export async function recordClockIn(user, location, notes, extra = {}) {
  try {
    const payload = {
      location,
      notes,
      photo: extra.photo || null,
      coords: extra.coords || null,
      apdList: extra.apdList || [],
      healthStatus: extra.healthStatus || 'fit'
    }
    const res = await api.post('/attendance/clock-in', payload)
    if (res) {
      return { ...res, id: res._id || res.id }
    }
  } catch (err) {
    console.warn('[API Clock In Notice]:', err.message)
    if (err.status === 400) {
      throw err
    }
  }

  // Fallback lokal
  await delay()
  const list = read()
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const timeStr = now.toTimeString().slice(0, 5)

  // Cek apakah sudah absen hari ini
  const existingIndex = list.findIndex(
    a => a.userId === user.id && a.date === dateStr
  )
  if (existingIndex !== -1 && list[existingIndex].clockIn) {
    throw new Error('Anda sudah melakukan Clock In hari ini.')
  }

  const id = list.reduce((max, a) => Math.max(max, a.id), 0) + 1
  const isLate = parseInt(timeStr.replace(':', ''), 10) > 830 // > 08:30

  const newEntry = {
    id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    position: user.position,
    date: dateStr,
    clockIn: timeStr,
    clockOut: null,
    location: location || 'Head Office - Ruko Newton Square',
    status: isLate ? 'late' : 'ontime',
    notes: notes || 'Hadir dan bertugas di lapangan/kantor.',
    photo: extra.photo || null,
    coords: extra.coords || null,
    apdList: extra.apdList || [],
    healthStatus: extra.healthStatus || 'fit',
    timestamp: now.toISOString()
  }

  list.unshift(newEntry)
  write(list)
  return newEntry
}

export async function recordClockOut(user, notes, extra = {}) {
  try {
    const payload = {
      notes,
      photo: extra.photo || null,
      coords: extra.coords || null
    }
    const res = await api.post('/attendance/clock-out', payload)
    if (res) {
      return { ...res, id: res._id || res.id }
    }
  } catch (err) {
    console.warn('[API Clock Out Notice]:', err.message)
    if (err.status === 400) {
      throw err
    }
  }

  await delay()
  const list = read()
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const timeStr = now.toTimeString().slice(0, 5)

  const existingIndex = list.findIndex(
    a => a.userId === user.id && a.date === dateStr
  )
  if (existingIndex === -1) {
    throw new Error('Anda belum melakukan Clock In hari ini.')
  }

  list[existingIndex].clockOut = timeStr
  list[existingIndex].clockOutPhoto = extra.photo || null
  list[existingIndex].clockOutCoords = extra.coords || null
  list[existingIndex].clockOutTimestamp = now.toISOString()

  if (notes) {
    list[existingIndex].notes =
      `${list[existingIndex].notes} | Jam Pulang: ${notes}`
  }
  write(list)
  return list[existingIndex]
}
