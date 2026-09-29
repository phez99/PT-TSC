// ============================================================
// KONSTANTA MODUL PROYEK
// Dipakai bersama oleh halaman daftar dan halaman detail proyek.
// Mau tambah status/kategori baru? Cukup tambah di sini.
// ============================================================

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Perencanaan', color: 'blue-grey' },
  { value: 'ongoing', label: 'Berjalan', color: 'amber-8' },
  { value: 'hold', label: 'Ditunda', color: 'red-5' },
  { value: 'done', label: 'Selesai', color: 'green-7' },
];

// Disamakan dengan bagian "Layanan & Produk" di company profile
export const PROJECT_CATEGORIES = [
  { value: 'electronic', label: 'Electronic / Instrumentation & Telecommunication' },
  { value: 'electrical', label: 'Electrical System' },
  { value: 'mechanical', label: 'Mechanical (HVAC & Plumbing)' },
  { value: 'advertising', label: 'Advertising & Signage' },
];

export const statusOf = (value) =>
  PROJECT_STATUSES.find((s) => s.value === value) ?? { label: value, color: 'grey' };

export const categoryLabel = (value) =>
  PROJECT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
