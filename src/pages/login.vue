<template>
  <div class="company-login-wrap">
    <!-- Tombol Kembali ke Beranda untuk Mobile -->
    <div class="lt-md absolute-top-left q-pa-md z-top">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        color="dark"
        to="/"
        aria-label="Kembali ke Beranda"
      >
        <q-tooltip>Kembali ke Beranda</q-tooltip>
      </q-btn>
    </div>

    <!-- ================= KIRI: Branding (Layar Sedang & Besar) ================= -->
    <div class="company-login-brand gt-sm">
      <div class="absolute-top-left q-pa-lg">
        <q-btn
          flat
          no-caps
          icon="arrow_back"
          label="Kembali ke Beranda"
          color="white"
          to="/"
          class="text-weight-medium"
        />
      </div>

      <div class="company-login-brand-inner">
        <img :src="logo" alt="TSC" class="company-login-brand-logo" />
        <h2
          class="text-h4 text-white text-weight-bold q-mt-lg q-mb-md"
          style="line-height: 1.3"
        >
          Selamat Datang di
          <span class="company-gradient-text">Portal TSC</span>
        </h2>
        <p class="text-grey-4 q-mb-xl" style="line-height: 1.8">
          Sistem manajemen terintegrasi untuk Security System, Mechanical,
          Electrical &amp; Plumbing (MEP), Advertising, dan Pengadaan Material.
        </p>

        <!-- Feature bullet points -->
        <div class="q-gutter-y-md">
          <div class="row items-center no-wrap q-gutter-sm text-grey-3">
            <div class="company-icon-box-sm">
              <q-icon name="security" size="16px" />
            </div>
            <span>Security System &amp; Automation Control</span>
          </div>
          <div class="row items-center no-wrap q-gutter-sm text-grey-3">
            <div class="company-icon-box-sm">
              <q-icon name="bolt" size="16px" />
            </div>
            <span>Mechanical, Electrical &amp; Plumbing (MEP)</span>
          </div>
          <div class="row items-center no-wrap q-gutter-sm text-grey-3">
            <div class="company-icon-box-sm">
              <q-icon name="inventory" size="16px" />
            </div>
            <span>Material Request &amp; Multi-Level Approval</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= KANAN: Form Login ================= -->
    <div class="company-login-form-side">
      <div class="company-login-form-box">
        <div class="lt-md row items-center justify-between q-mb-md">
          <img :src="logo" alt="TSC" class="company-login-mobile-logo" />
          <q-btn
            flat
            no-caps
            dense
            icon="home"
            label="Beranda"
            to="/"
            color="primary"
          />
        </div>

        <span class="company-eyebrow" style="color: #d97706">Portal Login</span>
        <h1
          class="text-h5 text-weight-bold q-mt-md q-mb-xs"
          style="color: #0f172a"
        >
          Masuk ke Akun Anda
        </h1>
        <p class="text-grey-7 q-mb-md">
          Gunakan kredensial akun kerja atau pilih akun demo di bawah ini.
        </p>

        <!-- Banner Akun Demo / Quick Login Chips -->
        <q-card
          flat
          bordered
          class="q-pa-sm q-mb-lg bg-blue-1 text-blue-10"
          style="border-radius: 12px; border-color: #bfdbfe"
        >
          <div class="row items-center q-gutter-xs q-mb-xs">
            <q-icon name="info" size="18px" color="primary" />
            <span class="text-caption text-weight-bold"
              >Pilih Akun Demo Cepat:</span
            >
          </div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="acc in demoAccounts"
              :key="acc.email"
              clickable
              outline
              dense
              :color="email === acc.email ? 'amber-9' : 'primary'"
              :class="{ 'bg-amber-1 text-weight-bold': email === acc.email }"
              @click="selectDemoAccount(acc)"
            >
              <q-avatar
                :icon="acc.icon"
                :color="email === acc.email ? 'amber-8' : 'blue-7'"
                text-color="white"
              />
              {{ acc.label }}
            </q-chip>
          </div>
        </q-card>

        <!-- Alert pesan error inline jika login gagal -->
        <q-banner
          v-if="errorMessage"
          dense
          rounded
          class="bg-red-1 text-negative q-mb-md"
          style="border: 1px solid #fecaca"
        >
          <template #avatar>
            <q-icon name="error" color="negative" />
          </template>
          {{ errorMessage }}
        </q-banner>

        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input
            v-model="email"
            type="email"
            label="Alamat Email"
            placeholder="nama@tsc.local"
            outlined
            lazy-rules
            :rules="[
              v => !!v || 'Email wajib diisi',
              v => /.+@.+\..+/.test(v) || 'Format email tidak valid'
            ]"
            @update:model-value="errorMessage = ''"
          >
            <template #prepend>
              <q-icon name="mail" color="grey-6" />
            </template>
            <template #append v-if="email">
              <q-icon
                name="clear"
                class="cursor-pointer"
                @click="email = ''"
              />
            </template>
          </q-input>

          <q-input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            placeholder="••••••••"
            outlined
            lazy-rules
            :rules="[
              v => !!v || 'Password wajib diisi',
              v => v.length >= 6 || 'Minimal 6 karakter'
            ]"
            @update:model-value="errorMessage = ''"
          >
            <template #prepend>
              <q-icon name="lock" color="grey-6" />
            </template>
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <div class="row items-center justify-between">
            <q-checkbox
              v-model="remember"
              label="Ingat saya"
              dense
              color="amber-8"
            />
            <a
              href="javascript:void(0)"
              class="text-body2 text-primary text-weight-medium"
              @click="showForgotDialog = true"
              >Lupa password?</a
            >
          </div>

          <q-btn
            type="submit"
            class="btn-gold full-width"
            no-caps
            size="lg"
            label="Masuk ke Portal"
            icon-right="login"
            :loading="loading"
          />
        </q-form>

        <div class="text-center text-caption text-grey-6 q-mt-lg">
          &copy; {{ new Date().getFullYear() }} PT. Trimitra Solusindo Cemerlang.
          All rights reserved.
        </div>
      </div>
    </div>

    <!-- Dialog Lupa Password -->
    <q-dialog v-model="showForgotDialog">
      <q-card style="width: 420px; max-width: 90vw; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Bantuan Lupa Password</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <p class="text-body2 text-grey-8" style="line-height: 1.7">
            Untuk menjaga keamanan data perusahaan, pengaturan ulang kata sandi
            (password reset) dilakukan melalui Administrator IT atau Departemen
            HRD.
          </p>
          <div class="bg-grey-2 q-pa-md rounded-borders q-mt-sm">
            <div class="text-caption text-weight-bold text-grey-7"
              >Kontak Administrator IT:</div
            >
            <div class="text-body2 text-weight-medium text-primary q-mt-xs"
              >admin@tsc.local</div
            >
            <div class="text-caption text-grey-6"
              >Ekstensi: 104 (Senin - Jumat, 08:30 - 17:00 WIB)</div
            >
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Tutup" color="primary" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const { login } = useAuth()

// Sesuaikan path logo dengan file di public/
const logo = '/logo_white-removebg-preview.png'

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showForgotDialog = ref(false)

const demoAccounts = [
  {
    label: 'Admin',
    email: 'admin@tsc.local',
    password: 'admin123',
    icon: 'shield'
  },
  {
    label: 'Manager',
    email: 'manager@tsc.local',
    password: 'manager123',
    icon: 'business_center'
  },
  {
    label: 'PM',
    email: 'pm@tsc.local',
    password: 'pm123',
    icon: 'assignment'
  },
  {
    label: 'Finance',
    email: 'finance@tsc.local',
    password: 'finance123',
    icon: 'payments'
  },
  {
    label: 'Teknisi',
    email: 'staff@tsc.local',
    password: 'staff123',
    icon: 'build'
  }
]

function selectDemoAccount(acc) {
  email.value = acc.email
  password.value = acc.password
  errorMessage.value = ''
  $q.notify({
    type: 'info',
    icon: acc.icon,
    message: `Akun ${acc.label} dipilih (${acc.email})`,
    timeout: 1500,
    position: 'top'
  })
}

async function onSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)

    // Kembali ke halaman yang tadi dituju (kalau ada), hanya di area /dashboard
    const target = String(route.query.redirect || '')
    router.push(target.startsWith('/dashboard') ? target : '/dashboard')

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Login berhasil, selamat datang di Portal TSC',
      position: 'top',
      timeout: 2500
    })
  } catch (err) {
    const msg = err.message || 'Login gagal, periksa email dan password Anda.'
    errorMessage.value = msg
    $q.notify({
      type: 'negative',
      icon: 'warning',
      message: msg,
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}
</script>
