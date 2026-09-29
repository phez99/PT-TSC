// ============================================================
// OVERTIME SERVICE (PENGAJUAN LEMBUR / SPKL KARYAWAN)
// ============================================================

const STORAGE_KEY = 'tsc_overtime'

const SEED_OVERTIME = [
  {
    id: 1,
    userId: 5,
    userName: 'Staf Teknisi',
    userRole: 'staff',
    position: 'Teknisi Lapangan',
    projectId: 1,
    projectName: 'Puri Mansion Apartemen - Electronic System',
    date: '2026-09-29',
    startTime: '17:00',
    endTime: '21:00',
    hours: 4,
    activity: 'Penarikan kabel optik darurat dan konfigurasi rekaman server NVR sebelum serah terima.',
    status: 'pending', // pending | approved | rejected
    approverName: null,
    approvedAt: null,
    notes: null,
    createdAt: '2026-09-29'
  },
  {
    id: 2,
    userId: 5,
    userName: 'Staf Teknisi',
    userRole: 'staff',
    position: 'Teknisi Lapangan',
    projectId: 2,
    projectName: 'Pabrik Bekasi - Instalasi Genset & Panel Listrik',
    date: '2026-09-20',
    startTime: '17:30',
    endTime: '21:30',
    hours: 4,
    activity: 'Pemasangan grounding tembaga dan pengecekan koneksi busbar panel induk.',
    status: 'approved',
    approverName: 'Manager TSC',
    approvedAt: '2026-09-21',
    notes: 'Disetujui untuk kompensasi lembur proyek.',
    createdAt: '2026-09-20'
  }
]

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading overtime:', e)
  }
  write(SEED_OVERTIME)
  return JSON.parse(JSON.stringify(SEED_OVERTIME))
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function getOvertimes() {
  await delay()
  return read()
}

export async function createOvertime(user, payload) {
  await delay()
  const list = read()
  const id = list.reduce((max, o) => Math.max(max, o.id), 0) + 1
  const newOt = {
    id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    position: user.position,
    projectId: payload.projectId,
    projectName: payload.projectName,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    hours: payload.hours || 3,
    activity: payload.activity,
    status: 'pending',
    approverName: null,
    approvedAt: null,
    notes: null,
    createdAt: new Date().toISOString().slice(0, 10)
  }
  list.unshift(newOt)
  write(list)
  return newOt
}

export async function updateOvertimeStatus(id, approver, status, notes) {
  await delay()
  const list = read()
  const idx = list.findIndex(o => o.id === Number(id))
  if (idx === -1) throw new Error('Pengajuan lembur tidak ditemukan')
  list[idx].status = status
  list[idx].approverName = approver.name
  list[idx].approvedAt = new Date().toISOString().slice(0, 10)
  list[idx].notes = notes || null
  write(list)
  return list[idx]
}
