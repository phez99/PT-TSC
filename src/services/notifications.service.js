// ============================================================
// NOTIFICATIONS SERVICE
// Mengelola notifikasi in-app tersimpan di localStorage (tsc_notifications)
// Dipersonalisasi berdasarkan role & ID pengguna yang sedang login.
// ============================================================

const STORAGE_KEY = 'tsc_notifications'

const SEED_NOTIFICATIONS = [
  // Notifikasi untuk Admin, Manager, PM, Finance
  {
    id: 1,
    targetRoles: ['admin', 'manager'],
    targetUserId: null,
    title: 'Pengajuan Material Baru',
    message: 'MR-2026-001 (Kabel UTP Cat6 & Konektor RJ45) diajukan oleh Staf Teknisi.',
    link: '/dashboard/material-requests/1',
    type: 'material',
    icon: 'inventory_2',
    color: 'amber-8',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 menit lalu
    read: false
  },
  {
    id: 2,
    targetRoles: ['admin', 'manager'],
    targetUserId: null,
    title: 'Pengajuan Izin / Cuti Karyawan',
    message: 'Staf Teknisi mengajukan Cuti Tahunan selama 2 hari untuk urusan keluarga.',
    link: '/dashboard/leaves',
    type: 'leave',
    icon: 'event_busy',
    color: 'primary',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 jam lalu
    read: false
  },
  {
    id: 3,
    targetRoles: ['admin', 'manager', 'pm'],
    targetUserId: null,
    title: 'Pengajuan Lembur (SPKL)',
    message: 'Staf Teknisi mengajukan lembur 3 jam untuk penarikan kabel proyek Puri Mansion.',
    link: '/dashboard/overtime',
    type: 'overtime',
    icon: 'more_time',
    color: 'teal-7',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    read: false
  },
  {
    id: 4,
    targetRoles: ['admin', 'finance'],
    targetUserId: null,
    title: 'Invoice Termin Jatuh Tempo',
    message: 'Invoice INV-2026-002 (CCTV Gedung Perkantoran Sudirman) senilai Rp 166.500.000 menunggu pembayaran.',
    link: '/dashboard/invoices',
    type: 'invoice',
    icon: 'receipt_long',
    color: 'red-6',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    read: false
  },
  {
    id: 5,
    targetRoles: ['admin', 'manager', 'pm'],
    targetUserId: null,
    title: 'Target BAST Mendekati Batas',
    message: 'Proyek Instalasi CCTV & Access Control Puri Mansion mencapai 78% progres fisik.',
    link: '/dashboard/projects/1',
    type: 'project',
    icon: 'assignment_turned_in',
    color: 'blue-8',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    read: true
  },

  // Notifikasi khusus Staf Teknisi (ID: 5)
  {
    id: 101,
    targetRoles: ['staff'],
    targetUserId: 5,
    title: 'Permintaan Material Disetujui',
    message: 'MR-2026-002 (CCTV dome & Hard disk 4TB) telah disetujui Manager Operasional.',
    link: '/dashboard/material-requests',
    type: 'material',
    icon: 'check_circle',
    color: 'positive',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false
  },
  {
    id: 102,
    targetRoles: ['staff'],
    targetUserId: 5,
    title: 'Izin Cuti Disetujui',
    message: 'Pengajuan Cuti Tahunan Anda telah disetujui HRD & Manager.',
    link: '/dashboard/leaves',
    type: 'leave',
    icon: 'event_available',
    color: 'positive',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    read: false
  },
  {
    id: 103,
    targetRoles: ['staff'],
    targetUserId: 5,
    title: 'SPKL Lembur Diverifikasi',
    message: 'Lembur 3 jam di proyek Puri Mansion telah diverifikasi dan masuk rekap lembur.',
    link: '/dashboard/overtime',
    type: 'overtime',
    icon: 'verified',
    color: 'teal-7',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    read: false
  },
  {
    id: 104,
    targetRoles: ['staff'],
    targetUserId: 5,
    title: 'Pengingat Presensi Lapangan',
    message: 'Pastikan melakukan Clock In sebelum pukul 08:30 WIB di lokasi proyek penugasan.',
    link: '/dashboard/attendance',
    type: 'attendance',
    icon: 'schedule',
    color: 'amber-9',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    read: true
  }
]

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  write(SEED_NOTIFICATIONS)
  return JSON.parse(JSON.stringify(SEED_NOTIFICATIONS))
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function getNotificationsForUser(user) {
  if (!user) return []
  const list = read()
  return list.filter(n => {
    // Jika notifikasi ditujukan ke role user
    if (n.targetRoles && n.targetRoles.includes(user.role)) {
      // Jika targetUserId ditentukan, harus cocok dengan id user
      if (n.targetUserId && Number(n.targetUserId) !== Number(user.id)) {
        return false
      }
      return true
    }
    // Jika target spesifik userId saja
    if (n.targetUserId && Number(n.targetUserId) === Number(user.id)) {
      return true
    }
    return false
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function markAsRead(notificationId) {
  const list = read()
  const item = list.find(n => n.id === notificationId)
  if (item) {
    item.read = true
    write(list)
  }
  return item
}

export function markAllAsReadForUser(user) {
  if (!user) return
  const list = read()
  list.forEach(n => {
    const forThisUser =
      (n.targetRoles && n.targetRoles.includes(user.role)) ||
      (n.targetUserId && Number(n.targetUserId) === Number(user.id))
    if (forThisUser) {
      n.read = true
    }
  })
  write(list)
}

export function addNotification(payload) {
  const list = read()
  const id = list.reduce((max, n) => Math.max(max, n.id), 0) + 1
  const newNotif = {
    id,
    targetRoles: payload.targetRoles || ['admin'],
    targetUserId: payload.targetUserId || null,
    title: payload.title,
    message: payload.message,
    link: payload.link || '/dashboard',
    type: payload.type || 'info',
    icon: payload.icon || 'notifications',
    color: payload.color || 'primary',
    createdAt: new Date().toISOString(),
    read: false
  }
  list.unshift(newNotif)
  write(list)
  return newNotif
}
