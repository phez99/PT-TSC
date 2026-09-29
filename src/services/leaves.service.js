// ============================================================
// LEAVES SERVICE (PENGAJUAN IZIN & CUTI KARYAWAN)
// ============================================================

const STORAGE_KEY = 'tsc_leaves'

const SEED_LEAVES = [
  {
    id: 1,
    userId: 5,
    userName: 'Staf Teknisi',
    userRole: 'staff',
    position: 'Teknisi Lapangan',
    leaveType: 'annual', // annual (cuti tahunan) | sick (sakit) | urgent (keperluan mendesak)
    startDate: '2026-10-02',
    endDate: '2026-10-03',
    daysCount: 2,
    reason: 'Urusan keluarga di luar kota (pernikahan adik kandung).',
    status: 'pending', // pending | approved | rejected
    approverName: null,
    approvedAt: null,
    notes: null,
    createdAt: '2026-09-28'
  },
  {
    id: 2,
    userId: 5,
    userName: 'Staf Teknisi',
    userRole: 'staff',
    position: 'Teknisi Lapangan',
    leaveType: 'sick',
    startDate: '2026-09-14',
    endDate: '2026-09-15',
    daysCount: 2,
    reason: 'Sakit demam & flu berat, ada surat keterangan dokter klinik.',
    status: 'approved',
    approverName: 'Manager TSC',
    approvedAt: '2026-09-14',
    notes: 'Disetujui, istirahat dan lekas pulih.',
    createdAt: '2026-09-14'
  },
  {
    id: 3,
    userId: 3,
    userName: 'Project Manager',
    userRole: 'pm',
    position: 'Project Manager',
    leaveType: 'annual',
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    daysCount: 3,
    reason: 'Cuti tahunan yang telah direncanakan sebelumnya.',
    status: 'pending',
    approverName: null,
    approvedAt: null,
    notes: null,
    createdAt: '2026-09-27'
  }
]

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading leaves:', e)
  }
  write(SEED_LEAVES)
  return JSON.parse(JSON.stringify(SEED_LEAVES))
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function getLeaves() {
  await delay()
  return read()
}

export async function createLeave(user, payload) {
  await delay()
  const list = read()
  const id = list.reduce((max, l) => Math.max(max, l.id), 0) + 1
  const newLeave = {
    id,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    position: user.position,
    leaveType: payload.leaveType,
    startDate: payload.startDate,
    endDate: payload.endDate,
    daysCount: payload.daysCount || 1,
    reason: payload.reason,
    status: 'pending',
    approverName: null,
    approvedAt: null,
    notes: null,
    createdAt: new Date().toISOString().slice(0, 10)
  }
  list.unshift(newLeave)
  write(list)
  return newLeave
}

export async function updateLeaveStatus(id, approver, status, notes) {
  await delay()
  const list = read()
  const idx = list.findIndex(l => l.id === Number(id))
  if (idx === -1) throw new Error('Pengajuan izin tidak ditemukan')
  list[idx].status = status
  list[idx].approverName = approver.name
  list[idx].approvedAt = new Date().toISOString().slice(0, 10)
  list[idx].notes = notes || null
  write(list)
  return list[idx]
}
