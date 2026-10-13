// ============================================================
// CENTRAL API CLIENT (FRONTEND <-> BACKEND BRIDGE)
// Menghubungkan antarmuka Frontend ke API RESTful Express
//
// Development : biarkan VITE_API_URL kosong, request relatif '/api/v1/...'
//               diteruskan ke backend oleh proxy di quasar.config.js
// Production  : jika frontend & backend beda domain, isi VITE_API_URL
//               (mis. https://api-tsc.vercel.app) tanpa garis miring di akhir
// ============================================================

const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}/api/v1`;

/**
 * Ambil token autentikasi dari localStorage
 */
export function getAuthToken() {
  return localStorage.getItem('tsc_token') || '';
}

/**
 * Simpan token autentikasi
 */
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('tsc_token', token);
  } else {
    localStorage.removeItem('tsc_token');
  }
}

/**
 * Request Handler terpusat dengan header otomatis & token
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const resData = await response.json().catch(() => null);

  if (!response.ok) {
    // Token ditolak server (kedaluwarsa / akun dinonaktifkan): bersihkan sesi.
    // Pengecualian endpoint login, karena 401 di sana berarti email/password salah.
    if (response.status === 401 && token && !/^\/?auth\/login/.test(endpoint)) {
      setAuthToken(null);
      window.dispatchEvent(new Event('tsc:unauthorized'));
    }

    const errorMsg = resData?.message || `HTTP Error ${response.status}: ${response.statusText}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = resData;
    throw error;
  }

  return resData?.data !== undefined ? resData.data : resData;
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  patch: (endpoint, body, options) =>
    apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: 'DELETE', ...options }),
};
