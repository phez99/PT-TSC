<template>
  <q-layout view="hHh LpR lFf">
    <!-- ================= HEADER ================= -->
    <q-header class="company-dash-header">
      <q-toolbar class="q-px-sm q-px-md-md">
        <!-- Tombol Hamburger HANYA UNTUK ROLE ADMIN / MANAJEMEN -->
        <q-btn
          v-if="user?.role !== 'staff'"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="drawer = !drawer"
        />

        <!-- Brand / Sapaan Header -->
        <div v-if="user?.role === 'staff'" class="row items-center q-gutter-x-sm">
          <img :src="logo" alt="TSC" style="height: 28px; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 6px;" />
          <div>
            <div class="text-caption text-weight-bold text-white line-height-normal" style="font-size: 13px;">
              PT. TRIMITRA SOLUSINDO
            </div>
            <div class="row items-center q-gutter-x-xs">
              <span class="pulse-online"></span>
              <span class="text-caption text-amber-5" style="font-size: 10px; font-weight: 600;">PORTAL TEKNISI (ESS)</span>
            </div>
          </div>
        </div>

        <q-toolbar-title v-else class="text-weight-bold row items-center no-wrap">
          <span>Portal Manajemen &amp; Operasional</span>
        </q-toolbar-title>

        <q-space />

        <!-- LONCENG NOTIFIKASI INTERAKTIF -->
        <q-btn flat round dense icon="notifications" class="q-mr-xs">
          <q-badge
            v-if="unreadCount > 0"
            color="negative"
            floating
            rounded
            class="text-weight-bold"
          >
            {{ unreadCount }}
          </q-badge>
          <q-tooltip>Notifikasi Sistem ({{ unreadCount }} belum dibaca)</q-tooltip>

          <!-- MENU DROPDOWN NOTIFIKASI -->
          <q-menu
            anchor="bottom end"
            self="top end"
            class="shadow-10"
            style="width: 360px; max-width: 92vw; border-radius: 14px"
          >
            <div
              class="row items-center justify-between q-pa-md bg-grey-1"
              style="border-bottom: 1px solid #e2e8f0"
            >
              <div>
                <div class="text-subtitle2 text-weight-bold text-navy-950">Notifikasi Sistem</div>
                <div class="text-caption text-grey-6">{{ unreadCount }} pemberitahuan belum dibaca</div>
              </div>
              <q-btn
                v-if="unreadCount > 0"
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                label="Tandai Dibaca"
                @click="markAllRead"
              />
            </div>

            <q-scroll-area style="height: 320px">
              <q-list separator v-if="notifications.length">
                <q-item
                  v-for="n in notifications"
                  :key="n.id"
                  clickable
                  v-ripple
                  :class="n.read ? 'bg-white' : 'bg-blue-1'"
                  @click="goToNotification(n)"
                >
                  <q-item-section avatar top>
                    <q-avatar
                      :color="n.color || 'primary'"
                      text-color="white"
                      :icon="n.icon || 'notifications'"
                      size="36px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold row items-center justify-between">
                      <span :class="n.read ? 'text-grey-9' : 'text-primary'">{{ n.title }}</span>
                      <q-badge
                        v-if="!n.read"
                        color="negative"
                        rounded
                        style="width: 8px; height: 8px; min-width: 8px; padding: 0"
                      />
                    </q-item-label>
                    <q-item-label caption class="text-grey-8 line-clamp-2 q-mt-xs">
                      {{ n.message }}
                    </q-item-label>
                    <q-item-label caption class="text-grey-5 q-mt-xs" style="font-size: 11px">
                      {{ timeAgo(n.createdAt) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-else class="text-center q-pa-lg text-grey-6">
                <q-icon name="notifications_off" size="40px" color="grey-4" class="q-mb-sm" />
                <div class="text-body2">Tidak ada notifikasi saat ini</div>
              </div>
            </q-scroll-area>
          </q-menu>
        </q-btn>

        <!-- DROPDOWN PROFIL & AKUN -->
        <q-btn flat no-caps class="q-pa-xs q-px-sm rounded-borders">
          <div class="row items-center no-wrap q-gutter-x-sm">
            <q-avatar color="amber-8" text-color="dark" size="32px" class="text-weight-bold">
              {{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}
            </q-avatar>
            <div class="gt-xs text-left">
              <div class="text-caption text-weight-bold text-white line-height-normal">{{ user?.name }}</div>
              <div class="text-caption text-grey-4" style="font-size: 10px">{{ user?.position }}</div>
            </div>
            <q-icon name="arrow_drop_down" color="white" />
          </div>

          <q-menu
            anchor="bottom end"
            self="top end"
            class="shadow-8"
            style="min-width: 240px; border-radius: 12px"
          >
            <div class="q-pa-md bg-grey-1" style="border-bottom: 1px solid #e2e8f0">
              <div class="text-weight-bold text-navy-950">{{ user?.name }}</div>
              <div class="text-caption text-grey-7">{{ user?.email }}</div>
              <q-badge color="amber-8" text-color="dark" class="text-weight-bold q-mt-xs">
                {{ user?.role?.toUpperCase() }} &bull; {{ user?.position }}
              </q-badge>
            </div>

            <q-list padding dense>
              <q-item clickable v-ripple @click="openProfileModal('idcard')">
                <q-item-section avatar>
                  <q-icon name="badge" color="positive" />
                </q-item-section>
                <q-item-section>ID Card Digital Karyawan</q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="openProfileModal('profile')">
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>Profil Saya</q-item-section>
              </q-item>

              <q-item clickable v-ripple @click="openProfileModal('password')">
                <q-item-section avatar>
                  <q-icon name="lock_reset" color="amber-9" />
                </q-item-section>
                <q-item-section>Ubah Password</q-item-section>
              </q-item>

              <q-separator class="q-my-xs" />

              <q-item clickable v-ripple class="text-negative" @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Keluar / Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- ================= SIDEBAR (HANYA UNTUK ROLE ADMIN / MANAJEMEN) ================= -->
    <q-drawer
      v-if="user?.role !== 'staff'"
      v-model="drawer"
      show-if-above
      :width="250"
      class="company-dash-drawer"
    >
      <div class="company-dash-brand">
        <img :src="logo" alt="TSC" />
      </div>

      <!-- Kartu Profil User Singkat -->
      <div class="q-px-md q-py-sm q-mb-xs">
        <div
          class="q-pa-sm bg-navy-950 rounded-borders row items-center no-wrap q-gutter-sm cursor-pointer"
          @click="openProfileModal('profile')"
        >
          <q-avatar color="amber-8" text-color="dark" size="32px" class="text-weight-bold">
            {{ user?.name ? user.name.charAt(0).toUpperCase() : 'U' }}
          </q-avatar>
          <div style="overflow: hidden">
            <div class="text-caption text-weight-bold text-white text-ellipsis">{{ user?.name }}</div>
            <div class="text-caption text-amber-5 text-ellipsis" style="font-size: 10px">{{ user?.position }}</div>
          </div>
        </div>
      </div>

      <div
        class="text-caption text-grey-5 text-uppercase q-px-md q-pt-xs q-pb-xs"
        style="font-size: 10px; letter-spacing: 0.5px"
      >
        Menu Manajemen Operasional
      </div>

      <q-list padding>
        <q-item
          v-for="item in visibleMenu"
          :key="item.to"
          :to="item.to"
          exact
          clickable
          v-ripple
          class="company-dash-menu-item"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>

        <q-separator dark class="q-my-sm" />

        <q-item to="/" clickable v-ripple class="company-dash-menu-item text-grey-4">
          <q-item-section avatar>
            <q-icon name="open_in_new" />
          </q-item-section>
          <q-item-section>Website Utama</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- ================= ISI HALAMAN ================= -->
    <q-page-container
      class="company-dash-page-bg"
      :class="{ 'staff-mobile-container': user?.role === 'staff' }"
    >
      <router-view />
    </q-page-container>

    <!-- ================= DOCK / BOTTOM NAVIGATION BAR KARYAWAN (ALA TIKTOK / INSTAGRAM) ================= -->
    <div
      v-if="user?.role === 'staff'"
      class="employee-bottom-bar"
    >
      <div class="row no-wrap items-center justify-around full-width q-px-xs" style="height: 62px;">
        <!-- Tab 1: Beranda / Feed -->
        <div
          class="bottom-nav-item"
          :class="{ active: currentRoutePath === '/dashboard' }"
          @click="router.push('/dashboard')"
        >
          <q-icon :name="currentRoutePath === '/dashboard' ? 'dynamic_feed' : 'feed'" size="23px" />
          <span>Beranda</span>
        </div>

        <!-- Tab 2: Absensi GPS -->
        <div
          class="bottom-nav-item"
          :class="{ active: currentRoutePath === '/dashboard/attendance' }"
          @click="router.push('/dashboard/attendance')"
        >
          <q-icon :name="currentRoutePath === '/dashboard/attendance' ? 'fmd_good' : 'place'" size="23px" />
          <span>Absensi</span>
        </div>

        <!-- Tab 3: Action Center (+) - Tombol Tengah Menonjol -->
        <div class="bottom-nav-center-btn" @click="quickActionDialog = true">
          <q-icon name="add" size="28px" />
          <q-tooltip>Ajukan Cepat Lapangan</q-tooltip>
        </div>

        <!-- Tab 4: Material Request (MR) -->
        <div
          class="bottom-nav-item"
          :class="{ active: currentRoutePath.startsWith('/dashboard/material-requests') }"
          @click="router.push('/dashboard/material-requests')"
        >
          <q-icon :name="currentRoutePath.startsWith('/dashboard/material-requests') ? 'inventory_2' : 'inventory'" size="23px" />
          <span>Material</span>
        </div>

        <!-- Tab 5: Cuti & SPKL -->
        <div
          class="bottom-nav-item"
          :class="{ active: currentRoutePath === '/dashboard/leaves' || currentRoutePath === '/dashboard/overtime' }"
          @click="router.push('/dashboard/leaves')"
        >
          <q-icon :name="currentRoutePath === '/dashboard/leaves' || currentRoutePath === '/dashboard/overtime' ? 'event_available' : 'event_note'" size="23px" />
          <span>Cuti &amp; SPKL</span>
        </div>
      </div>
    </div>

    <!-- ================= MODAL QUICK ACTION (+) KARYAWAN ================= -->
    <q-dialog v-model="quickActionDialog" position="bottom">
      <q-card style="width: 440px; max-width: 95vw; border-radius: 20px 20px 0 0; background: #ffffff;">
        <div class="text-center q-pt-sm">
          <div style="width: 40px; height: 4px; background: #cbd5e1; border-radius: 2px; margin: 0 auto;"></div>
        </div>

        <q-card-section class="q-pb-xs">
          <div class="text-subtitle1 text-weight-bold text-navy-950">
            Pusat Pengajuan Cepat Lapangan
          </div>
          <div class="text-caption text-grey-7">
            Pilih jenis permohonan yang ingin diajukan ke manajemen:
          </div>
        </q-card-section>

        <q-card-section class="q-pt-sm q-gutter-y-sm">
          <!-- Item 1: Material Request -->
          <q-card
            clickable
            v-ripple
            class="q-pa-md cursor-pointer row items-center no-wrap q-gutter-x-md"
            style="border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;"
            @click="navigateQuick('/dashboard/material-requests')"
          >
            <q-avatar color="primary" text-color="white" icon="inventory_2" size="44px" />
            <div style="flex: 1;">
              <div class="text-weight-bold text-navy-950">Permintaan Material (MR)</div>
              <div class="text-caption text-grey-6">Ajukan kebutuhan kabel, CCTV, konektor, atau alat kerja proyek</div>
            </div>
            <q-icon name="chevron_right" color="grey-6" size="24px" />
          </q-card>

          <!-- Item 2: Izin & Cuti -->
          <q-card
            clickable
            v-ripple
            class="q-pa-md cursor-pointer row items-center no-wrap q-gutter-x-md"
            style="border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;"
            @click="navigateQuick('/dashboard/leaves')"
          >
            <q-avatar color="amber-8" text-color="dark" icon="event_available" size="44px" />
            <div style="flex: 1;">
              <div class="text-weight-bold text-navy-950">Pengajuan Izin / Cuti</div>
              <div class="text-caption text-grey-6">Cuti tahunan, izin sakit dokter, atau keperluan keluarga</div>
            </div>
            <q-icon name="chevron_right" color="grey-6" size="24px" />
          </q-card>

          <!-- Item 3: Lembur SPKL -->
          <q-card
            clickable
            v-ripple
            class="q-pa-md cursor-pointer row items-center no-wrap q-gutter-x-md"
            style="border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;"
            @click="navigateQuick('/dashboard/overtime')"
          >
            <q-avatar color="teal-8" text-color="white" icon="more_time" size="44px" />
            <div style="flex: 1;">
              <div class="text-weight-bold text-navy-950">Surat Lembur Lapangan (SPKL)</div>
              <div class="text-caption text-grey-6">Catat jam lembur percepatan instalasi &amp; commissioning</div>
            </div>
            <q-icon name="chevron_right" color="grey-6" size="24px" />
          </q-card>

          <!-- Item 4: Clock In / Absensi -->
          <q-card
            clickable
            v-ripple
            class="q-pa-md cursor-pointer row items-center no-wrap q-gutter-x-md"
            style="border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;"
            @click="navigateQuick('/dashboard/attendance')"
          >
            <q-avatar color="positive" text-color="white" icon="place" size="44px" />
            <div style="flex: 1;">
              <div class="text-weight-bold text-navy-950">Presensi &amp; Absensi GPS</div>
              <div class="text-caption text-grey-6">Pencatatan jam masuk &amp; pulang di lokasi proyek</div>
            </div>
            <q-icon name="chevron_right" color="grey-6" size="24px" />
          </q-card>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-md">
          <q-btn flat no-caps color="grey-7" label="Tutup Menu" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ================= MODAL PROFIL & UBAH PASSWORD & ID CARD ================= -->
    <q-dialog v-model="profileDialog">
      <q-card style="width: 520px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-h6 text-weight-bold text-navy-950">
            Pengaturan Akun &amp; Identitas
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-tabs
          v-model="profileTab"
          dense
          active-color="amber-8"
          indicator-color="amber-8"
          class="text-grey-7 q-px-md q-pt-sm"
          align="left"
        >
          <q-tab name="idcard" label="ID Card Digital" icon="badge" no-caps />
          <q-tab name="profile" label="Profil Saya" icon="person" no-caps />
          <q-tab name="password" label="Ubah Password" icon="lock_reset" no-caps />
        </q-tabs>

        <q-separator />

        <!-- TAB ID CARD DIGITAL -->
        <q-tab-panels v-model="profileTab" animated>
          <q-tab-panel name="idcard" class="q-pa-md flex justify-center">
            <div
              class="id-card-wrapper q-pa-lg text-white shadow-6"
              style="width: 340px; border-radius: 18px; background: linear-gradient(145deg, #090d16 0%, #0f172a 60%, #1e293b 100%); border: 2px solid #f59e0b;"
            >
              <!-- Kop ID Card -->
              <div class="row items-center justify-between q-pb-sm" style="border-bottom: 1px solid rgba(255,255,255,0.15);">
                <img :src="logo" alt="TSC" style="height: 24px;" />
                <span class="text-caption text-amber-5 text-weight-bold" style="font-size: 10px; letter-spacing: 1px;">
                  PT. TSC INDONESIA
                </span>
              </div>

              <!-- Foto & Identitas -->
              <div class="text-center q-my-md">
                <q-avatar size="72px" color="amber-8" text-color="dark" class="text-h4 text-weight-bold shadow-4 q-mb-sm">
                  {{ user?.name?.charAt(0).toUpperCase() }}
                </q-avatar>
                <div class="text-subtitle1 text-weight-bold text-white">{{ user?.name }}</div>
                <div class="text-caption text-amber-4 text-weight-bold">{{ user?.position }}</div>
                <q-badge color="positive" class="text-weight-bold q-mt-xs">
                  STATUS: AKTIF BERTUGAS
                </q-badge>
              </div>

              <!-- Data Lapangan -->
              <div class="q-gutter-y-xs q-my-sm text-caption" style="font-size: 11px; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 8px;">
                <div class="row justify-between">
                  <span class="text-grey-4">ID Karyawan:</span>
                  <span class="font-mono text-weight-bold text-amber-4">TSC-EMP-2026-{{ String(user?.id || 1).padStart(2, '0') }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-4">Role Sistem:</span>
                  <span class="text-capitalize text-white">{{ user?.role }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-4">No. HP / WA:</span>
                  <span class="text-white">{{ user?.phone || '+62 812-xxxx' }}</span>
                </div>
              </div>

              <!-- Barcode Simulasi -->
              <div class="text-center q-mt-md q-pt-xs" style="border-top: 1px dashed rgba(255,255,255,0.2);">
                <div class="text-caption text-grey-5" style="font-size: 9px; font-family: monospace; letter-spacing: 3px;">
                  ||||| | |||| || |||||| | |||||
                </div>
                <div class="text-caption text-grey-4" style="font-size: 9px;">
                  Terdaftar Resmi &bull; Dokumen K3 Sah Lapangan
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- TAB PROFIL -->
          <q-tab-panel name="profile" class="q-pa-md">
            <q-form @submit.prevent="saveProfile">
              <div class="text-center q-mb-md">
                <q-avatar size="64px" color="navy-900" text-color="amber-5" class="text-h5 text-weight-bold q-mb-xs">
                  {{ user?.name?.charAt(0).toUpperCase() }}
                </q-avatar>
                <div class="text-weight-bold text-navy-950">{{ user?.name }}</div>
                <div class="text-caption text-grey-6">{{ user?.email }}</div>
              </div>

              <div class="q-gutter-y-sm">
                <q-input
                  v-model="profileForm.name"
                  dense
                  outlined
                  label="Nama Lengkap"
                  :rules="[v => !!v || 'Nama tidak boleh kosong']"
                />

                <q-input
                  :model-value="user?.email"
                  dense
                  outlined
                  label="Alamat Email"
                  readonly
                  hint="Email login tidak dapat diubah sendiri (hubungi Admin IT)"
                />

                <q-input
                  v-model="profileForm.phone"
                  dense
                  outlined
                  label="Nomor Telepon / WhatsApp"
                  placeholder="+62 812-xxxx-xxxx"
                  :rules="[v => !!v || 'Nomor telepon wajib diisi']"
                />

                <q-input
                  v-model="profileForm.position"
                  dense
                  outlined
                  label="Jabatan / Posisi"
                  :readonly="user?.role === 'staff'"
                  :hint="user?.role === 'staff' ? 'Ditetapkan oleh manajemen operasional' : ''"
                />
              </div>

              <div class="row justify-end q-mt-md q-gutter-x-sm">
                <q-btn flat no-caps label="Batal" v-close-popup />
                <q-btn
                  type="submit"
                  class="btn-gold"
                  no-caps
                  icon="save"
                  label="Simpan Profil"
                  :loading="savingProfile"
                />
              </div>
            </q-form>
          </q-tab-panel>

          <!-- TAB UBAH PASSWORD -->
          <q-tab-panel name="password" class="q-pa-md">
            <q-form @submit.prevent="savePassword">
              <div class="q-gutter-y-sm">
                <q-input
                  v-model="passwordForm.currentPassword"
                  dense
                  outlined
                  :type="showCurPass ? 'text' : 'password'"
                  label="Password Saat Ini"
                  :rules="[v => !!v || 'Password saat ini wajib diisi']"
                >
                  <template #append>
                    <q-icon
                      :name="showCurPass ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showCurPass = !showCurPass"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="passwordForm.newPassword"
                  dense
                  outlined
                  :type="showNewPass ? 'text' : 'password'"
                  label="Password Baru"
                  :rules="[
                    v => !!v || 'Password baru wajib diisi',
                    v => v.length >= 6 || 'Minimal 6 karakter'
                  ]"
                >
                  <template #append>
                    <q-icon
                      :name="showNewPass ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showNewPass = !showNewPass"
                    />
                  </template>
                </q-input>

                <q-input
                  v-model="passwordForm.confirmPassword"
                  dense
                  outlined
                  :type="showNewPass ? 'text' : 'password'"
                  label="Konfirmasi Password Baru"
                  :rules="[
                    v => !!v || 'Konfirmasi password wajib diisi',
                    v => v === passwordForm.newPassword || 'Password konfirmasi tidak cocok'
                  ]"
                />
              </div>

              <div class="row justify-end q-mt-md q-gutter-x-sm">
                <q-btn flat no-caps label="Batal" v-close-popup />
                <q-btn
                  type="submit"
                  class="btn-gold"
                  no-caps
                  icon="lock"
                  label="Perbarui Password"
                  :loading="savingPassword"
                />
              </div>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'
import { menuItems } from '/src/config/menu.js'
import {
  getNotificationsForUser,
  markAsRead,
  markAllAsReadForUser
} from '/src/services/notifications.service.js'
import { updateUser, changePassword } from '/src/services/auth.service.js'

const $q = useQuasar()
const router = useRouter()
const { user, logout: clearSession, updateCurrentUser } = useAuth()

const logo = '/logo_white-removebg-preview.png'
const drawer = ref(false)
const quickActionDialog = ref(false)

const currentRoutePath = computed(() => router.currentRoute.value.path)

// Notifications State
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function loadNotifications() {
  if (user.value) {
    notifications.value = getNotificationsForUser(user.value)
  }
}

function markAllRead() {
  markAllAsReadForUser(user.value)
  loadNotifications()
  $q.notify({ type: 'positive', message: 'Semua notifikasi telah ditandai dibaca' })
}

function goToNotification(notif) {
  markAsRead(notif.id)
  loadNotifications()
  if (notif.link) {
    router.push(notif.link)
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / (60 * 1000))
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

function navigateQuick(path) {
  quickActionDialog.value = false
  router.push(path)
}

// Menu Items (Admin)
const visibleMenu = computed(() =>
  menuItems.filter(m => m.ready && m.roles.includes(user.value?.role))
)

function logout() {
  clearSession()
  router.push('/login')
}

// Profile & Password Dialog State
const profileDialog = ref(false)
const profileTab = ref('profile')
const savingProfile = ref(false)
const savingPassword = ref(false)
const showCurPass = ref(false)
const showNewPass = ref(false)

const profileForm = ref({
  name: '',
  phone: '',
  position: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function openProfileModal(tab = 'profile') {
  profileTab.value = tab
  if (user.value) {
    profileForm.value = {
      name: user.value.name || '',
      phone: user.value.phone || '',
      position: user.value.position || ''
    }
  }
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  profileDialog.value = true
}

async function saveProfile() {
  if (!user.value) return
  savingProfile.value = true
  try {
    const updated = await updateUser(user.value.id, {
      name: profileForm.value.name,
      phone: profileForm.value.phone,
      position: profileForm.value.position
    })
    updateCurrentUser(updated)
    $q.notify({ type: 'positive', message: 'Profil Anda berhasil diperbarui' })
    profileDialog.value = false
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal menyimpan profil' })
  } finally {
    savingProfile.value = false
  }
}

async function savePassword() {
  if (!user.value) return
  savingPassword.value = true
  try {
    await changePassword(
      user.value.id,
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword
    )
    $q.notify({ type: 'positive', message: 'Password berhasil diubah. Gunakan password baru saat login.' })
    profileDialog.value = false
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memperbarui password' })
  } finally {
    savingPassword.value = false
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.staff-mobile-container {
  padding-bottom: 84px !important;
}

.employee-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2000;
  background: rgba(15, 23, 42, 0.96);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.25);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 0;
  user-select: none;
}

.bottom-nav-item.active {
  color: #f59e0b; /* amber gold */
  font-weight: 700;
}

.bottom-nav-item:active {
  transform: scale(0.92);
}

.bottom-nav-center-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.45);
  cursor: pointer;
  margin: -18px 4px 0 4px;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 3px solid #0f172a;
  user-select: none;
}

.bottom-nav-center-btn:active {
  transform: scale(0.88);
}

.pulse-online {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
  display: inline-block;
}
</style>
