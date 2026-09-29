import { reactive, computed } from 'vue'
import { login as loginRequest } from '/src/services/auth.service.js'

// ============================================================
// useAuth — menyimpan siapa yang sedang login.
// Pakai Vue reactive biasa (tanpa Pinia), jadi tidak perlu
// install apa pun. Kalau nanti mau pindah ke Pinia, cukup
// pindahkan isi file ini ke sebuah store.
// ============================================================

const STORAGE_KEY = 'tsc_auth'

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

// State ada di luar fungsi supaya dipakai bersama oleh semua komponen
const state = reactive({
  token: null,
  user: null,
  ...loadSaved()
})

export function useAuth() {
  const user = computed(() => state.user)
  const isLoggedIn = computed(() => !!state.token)

  async function login(email, password) {
    const { token, user: u } = await loginRequest(email, password)
    state.token = token
    state.user = u
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: u }))
  }

  function logout() {
    state.token = null
    state.user = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function updateCurrentUser(updatedUser) {
    state.user = { ...state.user, ...updatedUser }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: state.token, user: state.user }))
  }

  return { user, isLoggedIn, login, logout, updateCurrentUser }
}
