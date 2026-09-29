<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">
          Absensi &amp; Presensi Lapangan
        </div>
        <div class="text-grey-7 text-body2">
          Pencatatan kehadiran personel teknisi dan pengawas proyek berbasis lokasi kerja.
        </div>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn
          outline
          color="primary"
          no-caps
          icon="download"
          label="Export CSV / Excel"
          @click="exportToCsv"
        />
        <q-btn
          class="btn-gold"
          no-caps
          icon="print"
          label="Cetak Rekap Presensi"
          @click="openPrintRecap"
        />
      </div>
    </div>

    <!-- ================= KARTU CLOCK IN / CLOCK OUT INTERAKTIF ================= -->
    <q-card
      class="q-pa-lg q-mb-lg text-white"
      style="
        background: linear-gradient(
          135deg,
          #090d16 0%,
          #0f172a 60%,
          #1e293b 100%
        );
        border-radius: 16px;
        border: 1px solid #334155;
      "
    >
      <div class="row items-center justify-between q-col-gutter-md">
        <div class="col-12 col-md-7">
          <div class="row items-center q-gutter-xs q-mb-xs">
            <q-badge color="amber-8" text-color="dark" class="text-weight-bold">
              PRESENSI HARI INI
            </q-badge>
            <span class="text-caption text-grey-4 q-ml-sm">
              {{ user?.name }} &bull; {{ user?.position }}
            </span>
          </div>

          <h2 class="text-h4 text-weight-bold text-white q-my-xs">
            {{ currentTime }} <span class="text-h6 text-amber-5">WIB</span>
          </h2>

          <div
            v-if="myAttendanceToday"
            class="row items-center q-gutter-md q-mt-xs text-body2"
          >
            <div class="text-positive text-weight-bold row items-center">
              <q-icon name="check_circle" size="18px" class="q-mr-xs" />
              Clock In: {{ myAttendanceToday.clockIn }} WIB
            </div>
            <div
              v-if="myAttendanceToday.clockOut"
              class="text-blue-3 row items-center"
            >
              <q-icon name="logout" size="18px" class="q-mr-xs" />
              Clock Out: {{ myAttendanceToday.clockOut }} WIB
            </div>
            <div class="text-grey-3">
              <q-icon name="place" size="16px" class="q-mr-xs text-amber-5" />
              {{ myAttendanceToday.location }}
            </div>
          </div>
          <div v-else class="text-grey-4 text-body2 q-mt-xs">
            Anda belum melakukan presensi masuk hari ini. Silakan pilih lokasi
            penugasan dan klik Clock In.
          </div>
        </div>

        <div class="col-12 col-md-5 text-left text-md-right">
          <div class="row q-gutter-sm justify-start justify-md-end">
            <q-btn
              v-if="!myAttendanceToday"
              class="btn-gold"
              size="lg"
              no-caps
              icon="login"
              label="Clock In (Masuk)"
              @click="clockInDialog = true"
            />
            <q-btn
              v-else-if="!myAttendanceToday.clockOut"
              color="amber-9"
              size="lg"
              no-caps
              icon="logout"
              label="Clock Out (Pulang)"
              @click="clockOutDialog = true"
            />
            <q-badge
              v-else
              color="positive"
              class="q-pa-md text-subtitle2 text-weight-bold"
            >
              <q-icon name="verified" size="20px" class="q-mr-xs" />
              Presensi Hari Ini Selesai
            </q-badge>
          </div>
        </div>
      </div>
    </q-card>

    <!-- ================= METRIK KPI ABSENSI ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >HADIR HARI INI</div
          >
          <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">{{
            attendanceList.length
          }}</div>
          <div class="text-caption text-grey-6">Personel Tercatat</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >TEPAT WAKTU</div
          >
          <div class="text-h4 text-weight-bold text-positive q-my-xs">
            {{ attendanceList.filter(a => a.status === 'ontime').length }}
          </div>
          <div class="text-caption text-positive text-weight-medium"
            >Sebelum 08:30 WIB</div
          >
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >DI LOKASI PROYEK</div
          >
          <div class="text-h4 text-weight-bold text-primary q-my-xs">
            {{
              attendanceList.filter(
                a =>
                  a.location.toLowerCase().includes('proyek') ||
                  a.location.toLowerCase().includes('kawasan')
              ).length
            }}
          </div>
          <div class="text-caption text-grey-6">Teknisi Lapangan</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >TERLAMBAT / IZIN</div
          >
          <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">
            {{
              attendanceList.filter(
                a => a.status === 'late' || a.status === 'leave'
              ).length
            }}
          </div>
          <div class="text-caption text-grey-6">Perlu Verifikasi HR</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABEL LOG PRESENSI ================= -->
    <q-card class="company-dash-card">
      <q-table
        flat
        :rows="attendanceList"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada catatan presensi hari ini"
        class="company-dash-table"
      >
        <template #top>
          <div class="text-subtitle1 text-weight-bold" style="color: #0f172a">
            Log Presensi Personel &amp; Teknisi
          </div>
          <q-space />
          <q-chip dense color="blue-1" text-color="primary" icon="place">
            Presensi GPS / On-Site
          </q-chip>
        </template>

        <!-- Nama Karyawan -->
        <template #body-cell-userName="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-sm">
              <q-avatar
                color="navy-900"
                text-color="amber-5"
                size="32px"
                class="text-weight-bold"
              >
                {{ props.row.userName.charAt(0).toUpperCase() }}
              </q-avatar>
              <div>
                <div class="text-weight-bold">{{ props.row.userName }}</div>
                <div class="text-caption text-grey-6">{{
                  props.row.position
                }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Waktu Masuk & Pulang -->
        <template #body-cell-times="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              Masuk:
              <strong class="text-positive">{{ props.row.clockIn }} WIB</strong>
            </div>
            <div class="text-caption text-grey-7">
              Pulang:
              <strong>{{
                props.row.clockOut ? `${props.row.clockOut} WIB` : 'Bertugas'
              }}</strong>
            </div>
          </q-td>
        </template>

        <!-- Lokasi Kerja -->
        <template #body-cell-location="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-xs">
              <q-icon name="place" color="primary" size="16px" />
              <span class="text-weight-medium">{{ props.row.location }}</span>
            </div>
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="props.row.status === 'ontime' ? 'positive' : 'warning'"
              :label="
                props.row.status === 'ontime' ? 'TEPAT WAKTU' : 'TERLAMBAT'
              "
              class="q-pa-xs q-px-sm text-weight-bold"
            />
          </q-td>
        </template>

        <!-- Catatan Pekerjaan -->
        <template #body-cell-notes="props">
          <q-td :props="props">
            <div class="text-caption text-grey-8" style="max-width: 280px">
              {{ props.row.notes }}
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Clock In -->
    <q-dialog v-model="clockInDialog">
      <q-card style="width: 480px; max-width: 90vw; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Presensi Masuk (Clock In)</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-form @submit.prevent="submitClockIn">
          <q-card-section class="q-pt-md q-gutter-y-md">
            <q-select
              v-model="inForm.location"
              :options="locationOptions"
              outlined
              dense
              label="Lokasi Penugasan Hari Ini"
              :rules="[v => !!v || 'Wajib memilih lokasi']"
            />
            <q-input
              v-model="inForm.notes"
              type="textarea"
              rows="3"
              outlined
              dense
              label="Rencana Pekerjaan / Aktivitas"
              placeholder="Contoh: Instalasi kabel tray dan testing kamera CCTV di lantai 2"
              :rules="[v => !!v || 'Rencana aktivitas wajib diisi']"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
            <q-btn
              type="submit"
              class="btn-gold"
              icon="login"
              label="Konfirmasi Clock In"
              no-caps
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog Clock Out -->
    <q-dialog v-model="clockOutDialog">
      <q-card style="width: 460px; max-width: 90vw; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold"
            >Presensi Pulang (Clock Out)</div
          >
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-form @submit.prevent="submitClockOut">
          <q-card-section class="q-pt-md q-gutter-y-md">
            <div class="text-body2 text-grey-8">
              Pastikan seluruh perlengkapan APD dan perkakas kerja di lapangan
              telah tersimpan dengan aman sebelum meninggalkan lokasi.
            </div>
            <q-input
              v-model="outNotes"
              outlined
              dense
              label="Catatan Hasil Pekerjaan Hari Ini"
              placeholder="Contoh: Pekerjaan penarikan kabel selesai 100%, siap testing besok."
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
            <q-btn
              type="submit"
              color="amber-9"
              icon="logout"
              label="Konfirmasi Pulang"
              no-caps
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ================= DIALOG CETAK REKAP PRESENSI RESMI (POINT 2) ================= -->
    <q-dialog v-model="printRecapDialog" maximized>
      <q-card class="bg-grey-2">
        <q-toolbar class="bg-navy-950 text-white">
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Pratinjau Laporan Rekapitulasi Presensi Lapangan
          </q-toolbar-title>
          <q-btn
            class="btn-gold q-mr-sm"
            no-caps
            icon="print"
            label="Cetak Laporan / Simpan PDF"
            @click="printRecap"
          />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <div class="q-pa-md q-pa-sm-xl flex justify-center">
          <div
            id="print-recap-area"
            class="bg-white q-pa-xl shadow-4"
            style="width: 860px; min-height: 1100px; font-family: 'Arial', sans-serif; color: #1e293b;"
          >
            <!-- Kop Surat Resmi PT. TSC -->
            <div class="row items-center justify-between q-pb-md text-center" style="border-bottom: 2px solid #0f172a;">
              <img
                src="/logo_white-removebg-preview.png"
                alt="TSC"
                style="height: 48px; background: #090d16; padding: 4px 10px; border-radius: 6px;"
              />
              <div style="flex: 1; padding: 0 15px;">
                <div style="font-size: 18px; font-weight: bold; letter-spacing: 1px; color: #0f172a;">
                  PT. TRIMITRA SOLUSINDO CEMERLANG
                </div>
                <div style="font-size: 13px; font-style: italic; color: #475569;">
                  Integrated Security System, MEP & IT Infrastructure Specialist
                </div>
                <div style="font-size: 11px; color: #64748b;">
                  Head Office: Legenda Wisata Ruko Newton Square U18/30, Nagrak, Gn. Putri, Bogor &bull; Email: info@tsc.co.id
                </div>
              </div>
            </div>

            <!-- Judul Dokumen -->
            <div class="text-center q-my-lg">
              <div style="font-size: 18px; font-weight: bold; text-decoration: underline; color: #0f172a;">
                LAPORAN REKAPITULASI PRESENSI & KEHADIRAN PERSONEL
              </div>
              <div style="font-size: 13px; color: #475569; margin-top: 4px;">
                Periode: {{ currentFullDate }} &bull; Sifat: Dokumen Pengendalian Operasional Lapangan
              </div>
            </div>

            <!-- Ringkasan Statistik Kehadiran -->
            <div class="row q-col-gutter-sm q-mb-lg text-center" style="font-size: 13px;">
              <div class="col-4">
                <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #f8fafc;">
                  <div style="color: #64748b; font-size: 11px; font-weight: bold;">TOTAL LOG KEHADIRAN</div>
                  <div style="font-size: 18px; font-weight: bold; color: #0f172a;">{{ attendanceList.length }} Personel</div>
                </div>
              </div>
              <div class="col-4">
                <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #f0fdf4;">
                  <div style="color: #16a34a; font-size: 11px; font-weight: bold;">HADIR TEPAT WAKTU</div>
                  <div style="font-size: 18px; font-weight: bold; color: #16a34a;">
                    {{ attendanceList.filter(a => a.status === 'present').length }} Orang
                  </div>
                </div>
              </div>
              <div class="col-4">
                <div style="border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; background: #fefce8;">
                  <div style="color: #ca8a04; font-size: 11px; font-weight: bold;">TERLAMBAT / PERLU REVIEW</div>
                  <div style="font-size: 18px; font-weight: bold; color: #ca8a04;">
                    {{ attendanceList.filter(a => a.status === 'late' || a.status === 'leave').length }} Orang
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabel Data Rekap Presensi -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px;">
              <thead>
                <tr style="background: #0f172a; color: #ffffff;">
                  <th style="border: 1px solid #0f172a; padding: 8px 6px; text-align: center; width: 35px;">No</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Nama Personel</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Jabatan</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Lokasi Proyek</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 6px; text-align: center; width: 85px;">Masuk</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 6px; text-align: center; width: 85px;">Pulang</th>
                  <th style="border: 1px solid #0f172a; padding: 8px 10px; text-align: left;">Catatan Lapangan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in attendanceList" :key="row.id" :style="idx % 2 === 1 ? 'background: #f8fafc;' : ''">
                  <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">{{ idx + 1 }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-weight: bold;">{{ row.userName }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; color: #475569;">{{ row.position }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">{{ row.location }}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #16a34a;">
                    {{ row.clockIn }} WIB
                  </td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">
                    {{ row.clockOut ? `${row.clockOut} WIB` : 'Bertugas' }}
                  </td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 10px; font-size: 11px; color: #475569;">
                    {{ row.notes || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Kolom Tanda Tangan Resmi Pengesahan -->
            <div class="row justify-between text-center q-mt-xl" style="font-size: 13px; page-break-inside: avoid;">
              <div style="width: 250px;">
                <div>Dibuat Oleh:</div>
                <div style="font-weight: bold; margin-top: 4px;">Koordinator Lapangan / Supervisor</div>
                <div style="height: 70px;"></div>
                <div style="border-bottom: 1px solid #0f172a; font-weight: bold;">
                  {{ user?.name || 'Supervisor MEP' }}
                </div>
                <div style="font-size: 11px; color: #64748b;">{{ user?.position || 'Supervisor Lapangan' }}</div>
              </div>

              <div style="width: 250px;">
                <div>Mengetahui &amp; Menyetujui:</div>
                <div style="font-weight: bold; margin-top: 4px;">Manager Operasional / HRD</div>
                <div style="height: 70px;"></div>
                <div style="border-bottom: 1px solid #0f172a; font-weight: bold;">
                  Bambang Trihatmojo, S.T.
                </div>
                <div style="font-size: 11px; color: #64748b;">Manager Operasional PT. TSC</div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'
import {
  getAttendanceList,
  recordClockIn,
  recordClockOut
} from '/src/services/attendance.service.js'

const $q = useQuasar()
const { user } = useAuth()

const loading = ref(true)
const attendanceList = ref([])
const clockInDialog = ref(false)
const clockOutDialog = ref(false)
const printRecapDialog = ref(false)
const outNotes = ref('')

const currentTime = ref(new Date().toTimeString().slice(0, 5))

setInterval(() => {
  currentTime.value = new Date().toTimeString().slice(0, 5)
}, 1000)

const currentFullDate = computed(() => {
  return new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
})

const inForm = reactive({
  location: 'Proyek Puri Mansion Apartemen',
  notes: ''
})

const locationOptions = [
  'Proyek Puri Mansion Apartemen',
  'Kawasan Industri MM2100 Bekasi',
  'Apartemen Sunter Jakarta Utara',
  'Head Office - Ruko Newton Square',
  'Workshop - Jl. Gardu Kramat Jati'
]

const columns = [
  {
    name: 'userName',
    label: 'Nama Personel',
    field: 'userName',
    align: 'left'
  },
  { name: 'times', label: 'Jam Kehadiran', align: 'left' },
  { name: 'location', label: 'Lokasi Kerja', field: 'location', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'notes', label: 'Catatan Aktivitas', field: 'notes', align: 'left' }
]

const myAttendanceToday = computed(() => {
  const todayStr = new Date().toISOString().slice(0, 10)
  return attendanceList.value.find(
    a => a.userId === user.value?.id && a.date === todayStr
  )
})

async function submitClockIn() {
  try {
    const res = await recordClockIn(user.value, inForm.location, inForm.notes)
    attendanceList.value.unshift(res)
    clockInDialog.value = false
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `Clock In berhasil di ${inForm.location}!`
    })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal Clock In' })
  }
}

async function submitClockOut() {
  try {
    const updated = await recordClockOut(user.value, outNotes.value)
    const idx = attendanceList.value.findIndex(a => a.id === updated.id)
    if (idx !== -1) attendanceList.value[idx] = updated
    clockOutDialog.value = false
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Clock Out berhasil tercatat. Selamat beristirahat!'
    })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal Clock Out' })
  }
}

function openPrintRecap() {
  printRecapDialog.value = true
}

function printRecap() {
  window.print()
}

function exportToCsv() {
  if (!attendanceList.value.length) {
    $q.notify({ type: 'warning', message: 'Belum ada data presensi untuk diunduh' })
    return
  }

  const headers = ['No', 'Tanggal', 'Nama Personel', 'Jabatan', 'Lokasi Penugasan', 'Jam Masuk', 'Jam Pulang', 'Status', 'Catatan']
  const rows = attendanceList.value.map((a, i) => [
    i + 1,
    `"${a.date || ''}"`,
    `"${a.userName || ''}"`,
    `"${a.position || ''}"`,
    `"${a.location || ''}"`,
    `"${a.clockIn ? a.clockIn + ' WIB' : ''}"`,
    `"${a.clockOut ? a.clockOut + ' WIB' : 'Bertugas'}"`,
    `"${a.status || ''}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Rekap_Presensi_TSC_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    icon: 'file_download',
    message: 'Data Rekap Presensi berhasil diexport ke CSV / Excel!'
  })
}

onMounted(async () => {
  try {
    attendanceList.value = (await getAttendanceList()) || []
  } finally {
    loading.value = false
  }
})
</script>
