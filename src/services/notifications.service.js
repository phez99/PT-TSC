// ============================================================
// NOTIFICATIONS SERVICE
// Backend: /api/v1/notifications (api.js sudah membuka { data } dari respons)
// Notifikasi dibuat oleh backend (utils/notify.js), frontend hanya membaca.
// ============================================================
import { api } from './api.js';

const normalize = (n) => ({
  ...n,
  id: n._id || n.id,
  read: n.isRead ?? n.read ?? false,
});

export async function getNotificationsForUser() {
  const data = await api.get('/notifications');
  return (data?.items || []).map(normalize);
}

export async function markAsRead(notificationId) {
  await api.patch(`/notifications/${notificationId}/read`, {});
}

export async function markAllAsReadForUser() {
  await api.patch('/notifications/read-all', {});
}

// Dipertahankan agar import di halaman lain tidak error.
// Notifikasi sekarang dibuat oleh backend, jadi fungsi ini tidak melakukan apa-apa.
export function addNotification() {
  return null;
}
