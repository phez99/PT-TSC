import { reactive, computed } from 'vue';
import { login as loginRequest } from '/src/services/auth.service.js';
import { setAuthToken } from '/src/services/api.js';

// ============================================================
// useAuth — menyimpan siapa yang sedang login.
// Pakai Vue reactive biasa (tanpa Pinia), jadi tidak perlu
// install apa pun. Kalau nanti mau pindah ke Pinia, cukup
// pindahkan isi file ini ke sebuah store.
// ============================================================

const STORAGE_KEY = 'tsc_auth';

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

// State ada di luar fungsi supaya dipakai bersama oleh semua komponen
const state = reactive({
  token: null,
  user: null,
  ...loadSaved(),
});

// Token juga disimpan terpisah oleh api.js (kunci tsc_token) untuk header Authorization.
// Samakan keduanya saat aplikasi dibuka.
if (state.token) setAuthToken(state.token);

function clearSession() {
  state.token = null;
  state.user = null;
  localStorage.removeItem(STORAGE_KEY);
  setAuthToken(null); // hapus juga tsc_token, kalau tidak token lama tetap terkirim
}

// Dikirim oleh api.js saat server menolak token (kedaluwarsa / akun dinonaktifkan)
if (typeof window !== 'undefined') {
  window.addEventListener('tsc:unauthorized', clearSession);
}

export function useAuth() {
  const user = computed(() => state.user);
  const role = computed(() => state.user?.role || null);
  const isLoggedIn = computed(() => !!state.token);

  // Contoh: hasRole('admin', 'manager') → true jika role user salah satunya
  const hasRole = (...roles) => roles.includes(state.user?.role);

  async function login(email, password) {
    const { token, user: u } = await loginRequest(email, password);
    state.token = token;
    state.user = u;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: u }));
  }

  function logout() {
    clearSession();
  }

  function updateCurrentUser(updatedUser) {
    state.user = { ...state.user, ...updatedUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }));
  }

  return { user, role, isLoggedIn, hasRole, login, logout, updateCurrentUser };
}
