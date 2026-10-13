<template>
  <q-layout view="hHh LpR fFf">
    <!-- ===== Header (pakai tema dashboard: company-dash-header) ===== -->
    <q-header class="company-dash-header">
      <q-toolbar class="q-gutter-x-sm">
        <q-btn
          flat
          round
          dense
          icon="menu"
          aria-label="Menu"
          class="lt-md"
          @click="drawer = !drawer"
        />

        <q-img
          src="/logo_white-removebg-preview.png"
          width="120px"
          height="32px"
          fit="contain"
          style="flex-shrink: 0"
        />
        <q-toolbar-title class="text-subtitle1 text-weight-medium gt-xs"
          >Monitoring Pintu Darurat</q-toolbar-title
        >
        <q-space class="lt-sm" />

        <q-chip
          dense
          class="company-status"
          :class="backendClass"
          :icon="status.backendOnline ? 'cloud_done' : 'cloud_off'"
          :label="status.backendOnline ? 'Backend OK' : 'Backend terputus'"
        />
        <q-chip
          dense
          class="company-status"
          :class="plcClass"
          icon="memory"
          :label="`PLC ${status.plcOnline}/${status.plcTotal}`"
        />
        <q-chip
          dense
          class="company-status gt-xs"
          :class="sirenClass"
          icon="campaign"
          :label="sirenText"
        />

        <q-space class="gt-xs" />

        <span class="text-caption">{{ clock }}</span>

        <q-btn
          flat
          round
          dense
          :icon="status.muted ? 'volume_off' : 'volume_up'"
          :aria-label="status.muted ? 'Aktifkan suara alarm' : 'Matikan suara alarm'"
          @click="toggleMute()"
        >
          <q-tooltip>{{ status.muted ? 'Suara alarm mati' : 'Suara alarm aktif' }}</q-tooltip>
        </q-btn>

        <q-btn flat no-caps dense icon="account_circle" :label="status.user.name" class="gt-xs">
          <q-menu anchor="bottom right" self="top right" :offset="[0, 6]">
            <q-list style="min-width: 200px">
              <q-item-label header>{{ status.user.name }} · {{ status.user.role }}</q-item-label>
              <q-item clickable v-close-popup @click="onSwitchUser"
                ><q-item-section>Ganti user</q-item-section></q-item
              >
              <q-item clickable v-close-popup :to="routes.about"
                ><q-item-section>Tentang</q-item-section></q-item
              >
              <q-separator />
              <q-item clickable v-close-popup @click="onLogout"
                ><q-item-section>Keluar</q-item-section></q-item
              >
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <!-- Banner global: tampil di semua halaman -->
      <q-banner
        v-if="!status.backendOnline"
        dense
        inline-actions
        class="company-alert company-alert--off"
        role="status"
      >
        <template #avatar><q-icon name="cloud_off" /></template>
        Backend terputus. Data di layar tidak terbaca. Sirine lokal tetap berjalan di PLC.
      </q-banner>
      <q-banner
        v-if="status.openCount > 0"
        dense
        inline-actions
        class="company-alert company-alert--danger"
        role="alert"
      >
        <template #avatar><q-icon name="warning" /></template>
        <span class="text-weight-bold">ALARM: {{ status.openCount }} pintu terbuka</span>
        <template #action
          ><q-btn
            flat
            dense
            no-caps
            label="Lihat alarm aktif"
            icon-right="chevron_right"
            :to="routes.alarm"
        /></template>
      </q-banner>
      <q-banner
        v-else-if="status.waitingReset > 0"
        dense
        inline-actions
        class="company-alert company-alert--warn"
        role="status"
      >
        <template #avatar><q-icon name="restart_alt" /></template>
        <span class="text-weight-bold">{{ status.waitingReset }} alarm menunggu reset</span>
        <template #action
          ><q-btn
            flat
            dense
            no-caps
            label="Buka alarm aktif"
            icon-right="chevron_right"
            :to="routes.alarm"
        /></template>
      </q-banner>
    </q-header>

    <!-- ===== Menu samping mini (pakai tema dashboard: company-dash-drawer) ===== -->
    <q-drawer v-model="drawer" show-if-above mini :mini-width="64" class="company-dash-drawer">
      <div class="column fit">
        <q-list padding>
          <q-item
            v-for="m in mainItems"
            :key="m.to"
            :to="m.to"
            clickable
            class="company-dash-menu-item"
          >
            <q-item-section avatar><q-icon :name="m.icon" /></q-item-section>
            <q-badge v-if="m.badge" floating rounded color="negative" :label="m.badge" />
            <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">{{
              m.label
            }}</q-tooltip>
          </q-item>
        </q-list>

        <q-space />

        <template v-if="adminItems.length">
          <q-separator dark />
          <q-list padding>
            <q-item
              v-for="m in adminItems"
              :key="m.to"
              :to="m.to"
              clickable
              class="company-dash-menu-item"
            >
              <q-item-section avatar><q-icon :name="m.icon" /></q-item-section>
              <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">{{
                m.label
              }}</q-tooltip>
            </q-item>
          </q-list>
        </template>
      </div>
    </q-drawer>

    <!-- ===== Konten halaman (pages/monitor/*.vue) ===== -->
    <q-page-container class="company-dash-page-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { date } from 'quasar';
import { useSystemStatus } from '/src/composables/useSystemStatus.js';

// Layout ini = pages/monitor.vue, halaman anak ada di pages/monitor/*.vue
const BASE = '/monitor';
const routes = { alarm: BASE + '/alarm', about: BASE + '/about' };

const { status, toggleMute, startDemo, stopDemo } = useSystemStatus();
const router = useRouter();
const drawer = ref(false);

// ---- Jam ----
const clock = ref(date.formatDate(Date.now(), 'HH:mm:ss'));
let clockTimer = null;
onMounted(() => {
  clockTimer = setInterval(() => {
    clock.value = date.formatDate(Date.now(), 'HH:mm:ss');
  }, 1000);
  if (import.meta.env.DEV) startDemo(); // HAPUS saat backend sudah terhubung
});
onBeforeUnmount(() => {
  clearInterval(clockTimer);
  stopDemo();
});

// ---- Status header (class modifier dari company-quasar-theme.scss) ----
const backendClass = computed(() =>
  status.backendOnline ? 'company-status--ok' : 'company-status--danger'
);
const plcClass = computed(() => {
  if (status.plcOnline === status.plcTotal) return 'company-status--ok';
  return status.plcOnline === 0 ? 'company-status--danger' : 'company-status--warn';
});
const sirenClass = computed(() => (status.sirenFloors.length ? 'company-status--danger' : ''));
const sirenText = computed(() =>
  status.sirenFloors.length ? 'Sirine: L' + status.sirenFloors.join(', L') : 'Sirine: diam'
);

// ---- Menu mengikuti peran ----
const RANK = { operator: 1, teknisi: 2, admin: 3 };
const allowed = (min) => RANK[status.user.role] >= RANK[min];

const mainItems = computed(() => {
  const alarmBadge = status.openCount + status.waitingReset;
  return [
    { label: 'Operator', icon: 'dashboard', to: BASE + '/operator', min: 'operator' },
    {
      label: 'Alarm Aktif',
      icon: 'notifications_active',
      to: BASE + '/alarm',
      min: 'operator',
      badge: alarmBadge || null,
    },
    { label: 'Log Kejadian', icon: 'receipt_long', to: BASE + '/log', min: 'operator' },
    { label: 'Perbaikan', icon: 'build', to: BASE + '/maintenance', min: 'teknisi' },
    { label: 'Status Sistem', icon: 'dns', to: BASE + '/system', min: 'teknisi' },
  ].filter((m) => allowed(m.min));
});
const adminItems = computed(() =>
  [
    { label: 'Pengaturan', icon: 'settings', to: BASE + '/settings', min: 'admin' },
    { label: 'Pengguna', icon: 'group', to: BASE + '/users', min: 'admin' },
    { label: 'Backup', icon: 'backup', to: BASE + '/backup', min: 'admin' },
  ].filter((m) => allowed(m.min))
);

// ---- Aksi user (sambungkan ke auth nanti) ----
function onSwitchUser() {
  router.push({ path: '/login', query: { switch: 1 } });
}
function onLogout() {
  router.push('/login');
}
</script>
