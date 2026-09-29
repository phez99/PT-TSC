// ============================================================
// ALUR PERSETUJUAN (APPROVAL) — dipakai bersama
// Dipakai oleh Request Material sekarang, dan Kasbon nanti.
// Alurnya: Diajukan → Disetujui / Ditolak → Diproses
//
// Mau ubah siapa yang boleh menyetujui/memproses? Cukup ubah
// APPROVER_ROLES dan PROCESSOR_ROLES di bawah.
// ============================================================

export const APPROVAL_STATUSES = [
  { value: 'submitted', label: 'Diajukan', color: 'amber-8' },
  { value: 'approved', label: 'Disetujui', color: 'green-7' },
  { value: 'rejected', label: 'Ditolak', color: 'red-5' },
  { value: 'processed', label: 'Diproses', color: 'blue-7' },
];

export const approvalStatusOf = (value) =>
  APPROVAL_STATUSES.find((s) => s.value === value) ?? { label: value, color: 'grey' };

// Role yang boleh menyetujui / menolak
export const APPROVER_ROLES = ['admin', 'manager'];

// Role yang boleh menandai "Diproses" setelah disetujui
export const PROCESSOR_ROLES = ['admin', 'finance'];

// needsNote: true → wajib mengisi catatan (mis. alasan penolakan)
export const APPROVAL_ACTIONS = {
  approve: {
    status: 'approved',
    label: 'Setujui',
    icon: 'check_circle',
    color: 'positive',
    needsNote: false,
  },
  reject: {
    status: 'rejected',
    label: 'Tolak',
    icon: 'cancel',
    color: 'negative',
    needsNote: true,
  },
  process: {
    status: 'processed',
    label: 'Tandai Diproses',
    icon: 'inventory',
    color: 'primary',
    needsNote: false,
  },
};

// Aksi apa yang boleh dilakukan role ini pada status ini?
export function availableActions(status, role) {
  if (status === 'submitted' && APPROVER_ROLES.includes(role)) return ['approve', 'reject'];
  if (status === 'approved' && PROCESSOR_ROLES.includes(role)) return ['process'];
  return [];
}

export function formatDateTime(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
