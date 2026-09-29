// ============================================================
// MENU DASHBOARD + HAK AKSES PER ROLE
// Satu tempat untuk mengatur: menu apa yang muncul di sidebar
// dan role mana yang boleh membuka halamannya.
//
// Cara pakai:
//  - ready: false  → menu disembunyikan (halamannya belum dibuat)
//  - kalau halaman sudah ada, ubah jadi ready: true
//  - roles → daftar role yang boleh melihat & membuka menu itu
// ============================================================

const ALL = ['admin', 'manager', 'pm', 'finance', 'staff']

export const menuItems = [
  {
    label: 'Ringkasan',
    icon: 'dashboard',
    to: '/dashboard',
    roles: ALL,
    ready: true
  },
  {
    label: 'Manajemen Proyek',
    icon: 'engineering',
    to: '/dashboard/projects',
    roles: ['admin', 'manager', 'pm'],
    ready: true
  },
  {
    label: 'Permintaan Material',
    icon: 'inventory_2',
    to: '/dashboard/material-requests',
    roles: ALL,
    ready: true
  },
  {
    label: 'Izin & Cuti',
    icon: 'event_busy',
    to: '/dashboard/leaves',
    roles: ALL,
    ready: true
  },
  {
    label: 'Lembur (Overtime)',
    icon: 'more_time',
    to: '/dashboard/overtime',
    roles: ['admin', 'manager', 'pm', 'staff'],
    ready: true
  },
  {
    label: 'Invoices & Penagihan',
    icon: 'receipt_long',
    to: '/dashboard/invoices',
    roles: ['admin', 'manager', 'finance'],
    ready: true
  },
  {
    label: 'Dokumen & BAST',
    icon: 'verified',
    to: '/dashboard/documents',
    roles: ALL,
    ready: true
  },
  {
    label: 'Absensi Lapangan',
    icon: 'fingerprint',
    to: '/dashboard/attendance',
    roles: ALL,
    ready: true
  },
  {
    label: 'Karyawan & Akses',
    icon: 'manage_accounts',
    to: '/dashboard/users',
    roles: ['admin', 'manager'],
    ready: true
  }
]

// Dipakai navigation guard: boleh tidak role ini membuka path ini?
export function canAccess(path, role) {
  // Cari menu dengan path paling spesifik yang cocok dengan awal URL
  const match = menuItems
    .filter(m => path === m.to || path.startsWith(m.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0]

  if (!match) return true // path tidak terdaftar di menu → biarkan
  return match.roles.includes(role)
}
