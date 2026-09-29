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
    date: '2026-09-29',
    clockIn: '07:55',
    clockOut: '17:10',
    location: 'Proyek Puri Mansion Apartemen',
    status: 'ontime', // ontime | late | leave | sick
    notes: 'Pemasangan kabel tray FO dan terminasi patch panel rack 2.',
    photo: null
  },
  {
    id: 2,
    userId: 3,
    userName: 'Project Manager',
    userRole: 'pm',
    position: 'Project Manager',
    date: '2026-09-29',
    clockIn: '08:10',
    clockOut: null,
    location: 'Kawasan Industri MM2100 Bekasi',
    status: 'ontime',
    notes: 'Supervisi pengiriman panel genset 500kVA dan koordinasi dengan safety officer pabrik.',
    photo: null
  },
  {
    id: 3,
    userId: 4,
    userName: 'Finance TSC',
    userRole: 'finance',
    position: 'Staff Finance',
    date: '2026-09-29',
    clockIn: '08:25',
    clockOut: null,
    location: 'Head Office - Ruko Newton Square',
    status: 'ontime',
    notes: 'Rekonsiliasi invoice termin September dan verifikasi berkas faktur pajak.',
    photo: null
  },
  {
    id: 4,
    userId: 2,
    userName: 'Manager TSC',
    userRole: 'manager',
    position: 'Manager Operasional',
    date: '2026-09-29',
    clockIn: '08:05',
    clockOut: null,
    location: 'Head Office - Ruko Newton Square',
    status: 'ontime',
    notes: 'Review mingguan BAST proyek Sunter dan approval material request.',
    photo: null
  },
  {
    id: 5,
    userId: 1,
    userName: 'Admin TSC',
    userRole: 'admin',
    position: 'Administrator',
    date: '2026-09-29',
    clockIn: '07:45',
    clockOut: null,
    location: 'Head Office - Ruko Newton Square',
    status: 'ontime',
    notes: 'Pemeliharaan server portal dan backup database operasional.',
    photo: null
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

export async function getAttendanceList() {
  await delay()
  return read()
}

export async function recordClockIn(user, location, notes) {
  await delay()
  const list = read()
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const timeStr = now.toTimeString().slice(0, 5)

  // Cek apakah sudah absen hari ini
  const existingIndex = list.findIndex(a => a.userId === user.id && a.date === dateStr)
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
    photo: null
  }

  list.unshift(newEntry)
  write(list)
  return newEntry
}

export async function recordClockOut(user, notes) {
  await delay()
  const list = read()
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const timeStr = now.toTimeString().slice(0, 5)

  const existingIndex = list.findIndex(a => a.userId === user.id && a.date === dateStr)
  if (existingIndex === -1) {
    throw new Error('Anda belum melakukan Clock In hari ini.')
  }

  list[existingIndex].clockOut = timeStr
  if (notes) {
    list[existingIndex].notes = `${list[existingIndex].notes} | Jam Pulang: ${notes}`
  }
  write(list)
  return list[existingIndex]
}
