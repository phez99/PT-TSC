import { defineRouter } from '#q-app';
import { routes, handleHotUpdate } from 'vue-router/auto-routes';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import { useAuth } from '/src/composables/useAuth.js';
import { canAccess } from '/src/config/menu.js';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = import.meta.env.QUASAR_SERVER
    ? createMemoryHistory
    : import.meta.env.QUASAR_VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(import.meta.env.QUASAR_VUE_ROUTER_BASE),
  });

  // ---------- NAVIGATION GUARD ----------
  // Semua URL yang diawali /dashboard wajib login.
  // Catatan: ini hanya mengatur tampilan. Pengecekan hak akses yang sebenarnya
  // dilakukan di backend (middleware protect + authorize).
  Router.beforeEach((to) => {
    const { isLoggedIn, user } = useAuth();

    if (to.path.startsWith('/dashboard')) {
      if (!isLoggedIn.value) {
        return { path: '/login', query: { redirect: to.fullPath } };
      }
      if (!canAccess(to.path, user.value?.role)) {
        return { path: '/dashboard' }; // role tidak berhak → balik ke ringkasan
      }
    }

    // Sudah login tapi buka /login → langsung ke dashboard
    if (to.path === '/login' && isLoggedIn.value) {
      return { path: '/dashboard' };
    }
  });

  // ---------- SESI BERAKHIR ----------
  // api.js mengirim event 'tsc:unauthorized' saat server menolak token
  // (kedaluwarsa / akun dinonaktifkan). useAuth sudah mengosongkan sesi,
  // di sini user langsung diarahkan ke halaman login.
  if (typeof window !== 'undefined') {
    window.addEventListener('tsc:unauthorized', () => {
      const current = Router.currentRoute.value;
      if (current.path.startsWith('/dashboard')) {
        Router.push({ path: '/login', query: { redirect: current.fullPath } });
      }
    });
  }

  // enable HMR for it
  if (import.meta.hot) {
    handleHotUpdate(Router);
  }

  return Router;
});
