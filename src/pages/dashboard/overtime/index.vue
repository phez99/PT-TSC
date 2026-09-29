<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">
          Lembur Lapangan (Overtime &amp; SPKL)
        </div>
        <div class="text-grey-7 text-body2">
          Surat Perintah Kerja Lembur teknisi, pencatatan jam lembur proyek, dan
          persetujuan kompensasi.
        </div>
      </div>
      <q-btn
        class="btn-gold"
        no-caps
        icon="add"
        label="Ajukan Lembur (SPKL)"
        @click="openCreateDialog"
      />
    </div>

    <!-- ================= METRIK KPI LEMBUR ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >TOTAL JAM LEMBUR</div
          >
          <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
            {{ totalHours }} Jam
          </div>
          <div class="text-caption text-grey-6">Bulan Berjalan</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >MENUNGGU VERIFIKASI</div
          >
          <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">
            {{ overtimes.filter(o => o.status === 'pending').length }}
          </div>
          <div class="text-caption text-amber-9 text-weight-medium"
            >Perlu Persetujuan PM</div
          >
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >LEMBUR DISETUJUI</div
          >
          <div class="text-h4 text-weight-bold text-positive q-my-xs">
            {{ overtimes.filter(o => o.status === 'approved').length }}
          </div>
          <div class="text-caption text-positive text-weight-medium"
            >Kompensasi Valid</div
          >
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >JUMLAH SPKL AKTIF</div
          >
          <div class="text-h4 text-weight-bold text-primary q-my-xs">
            {{ overtimes.length }} Berkas
          </div>
          <div class="text-caption text-grey-6">Rekap Proyek</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABEL LEMBUR ================= -->
    <q-card class="company-dash-card">
      <q-table
        flat
        :rows="displayedOvertimes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada catatan lembur"
        class="company-dash-table"
      >
        <!-- Karyawan -->
        <template #body-cell-userName="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.userName }}</div>
            <div class="text-caption text-grey-6">{{ props.row.position }}</div>
          </q-td>
        </template>

        <!-- Proyek -->
        <template #body-cell-projectName="props">
          <q-td :props="props">
            <div
              class="text-weight-medium text-navy-950"
              style="max-width: 220px"
            >
              {{ props.row.projectName }}
            </div>
            <div class="text-caption text-grey-6"
              >Tgl: {{ formatDate(props.row.date) }}</div
            >
          </q-td>
        </template>

        <!-- Waktu & Jam -->
        <template #body-cell-hours="props">
          <q-td :props="props" class="text-center">
            <div class="text-weight-bold text-primary">
              {{ props.row.startTime }} &ndash; {{ props.row.endTime }} WIB
            </div>
            <q-badge
              color="blue-1"
              text-color="primary"
              class="text-weight-bold"
            >
              {{ props.row.hours }} Jam Lembur
            </q-badge>
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              size="sm"
              :color="statusBadge(props.row.status).color"
              :text-color="statusBadge(props.row.status).textColor"
              class="text-weight-bold"
            >
              {{ statusBadge(props.row.status).label }}
            </q-chip>
            <div
              v-if="props.row.approverName"
              class="text-caption text-grey-6"
              style="font-size: 10px"
            >
              oleh {{ props.row.approverName }}
            </div>
          </q-td>
        </template>

        <!-- Aktivitas -->
        <template #body-cell-activity="props">
          <q-td :props="props">
            <div class="text-body2" style="max-width: 260px">{{
              props.row.activity
            }}</div>
            <div v-if="props.row.notes" class="text-caption text-grey-7 italic">
              Catatan: "{{ props.row.notes }}"
            </div>
          </q-td>
        </template>

        <!-- Aksi Approval & Cetak SPKL -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="row q-gutter-xs justify-center no-wrap">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="print"
                @click="openPrintSpkl(props.row)"
              >
                <q-tooltip>Cetak Dokumen SPKL Resmi</q-tooltip>
              </q-btn>
              <template v-if="canApprove && props.row.status === 'pending'">
                <q-btn
                  flat
                  round
                  dense
                  color="positive"
                  icon="check_circle"
                  @click="openApprovalDialog(props.row, 'approved')"
                >
                  <q-tooltip>Setujui Lembur</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="cancel"
                  @click="openApprovalDialog(props.row, 'rejected')"
                >
                  <q-tooltip>Tolak Lembur</q-tooltip>
                </q-btn>
              </template>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Pengajuan Lembur Baru -->
    <q-dialog v-model="createDialog">
      <q-card style="width: 520px; max-width: 95vw; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold"
            >Form Pengajuan Lembur (SPKL)</div
          >
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="submitOvertime">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-select
              v-model="form.projectId"
              :options="projectOptions"
              emit-value
              map-options
              dense
              outlined
              label="Pilih Proyek Penugasan Lembur"
              :rules="[v => !!v || 'Wajib memilih proyek']"
              @update:model-value="onProjectSelect"
            />
            <q-input
              v-model="form.date"
              type="date"
              dense
              outlined
              label="Tanggal Lembur"
              :rules="[v => !!v || 'Wajib diisi']"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="form.startTime"
                  type="time"
                  dense
                  outlined
                  label="Jam Mulai"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.endTime"
                  type="time"
                  dense
                  outlined
                  label="Jam Selesai"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
            </div>
            <q-input
              v-model.number="form.hours"
              type="number"
              dense
              outlined
              label="Estimasi Jam Lembur (Jam)"
              :rules="[v => (!!v && v > 0) || 'Minimal 1 jam']"
            />
            <q-input
              v-model="form.activity"
              type="textarea"
              rows="3"
              dense
              outlined
              label="Uraian Aktivitas Pekerjaan Lembur"
              placeholder="Contoh: Pekerjaan penarikan kabel tray darurat dan testing kamera CCTV lantai 3 menjelang serah terima..."
              :rules="[v => !!v || 'Uraian pekerjaan wajib diisi']"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
            <q-btn
              type="submit"
              class="btn-gold"
              label="Kirim Pengajuan SPKL"
              no-caps
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog Approval Lembur -->
    <q-dialog v-model="approvalDialog">
      <q-card style="width: 440px; max-width: 90vw; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{
              actionStatus === 'approved'
                ? 'Setujui Lembur (SPKL)'
                : 'Tolak Lembur'
            }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body2 text-grey-8 q-mb-md">
            Konfirmasi tindakan untuk pengajuan lembur dari
            <strong>{{ activeOt?.userName }}</strong> ({{ activeOt?.hours }} Jam
            di {{ activeOt?.projectName }}).
          </div>
          <q-input
            v-model="approvalNotes"
            dense
            outlined
            label="Catatan Verifikasi Supervisor (Opsional)"
            placeholder="Contoh: Disetujui, sesuai kebutuhan percepatan serah terima proyek."
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
          <q-btn
            :color="actionStatus === 'approved' ? 'positive' : 'negative'"
            :label="actionStatus === 'approved' ? 'Setujui SPKL' : 'Tolak SPKL'"
            no-caps
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ================= DIALOG CETAK FORM SPKL RESMI (POINT 2) ================= -->
    <q-dialog v-model="printSpklDialog" maximized>
      <q-card class="bg-grey-2">
        <q-toolbar class="bg-navy-950 text-white">
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Pratinjau Surat Perintah Kerja Lembur (SPKL) &mdash;
            {{ spklData?.code || 'SPKL-TSC' }}
          </q-toolbar-title>
          <q-btn
            class="btn-gold q-mr-sm"
            no-caps
            icon="print"
            label="Cetak SPKL / Simpan PDF"
            @click="printSpkl"
          />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <div class="q-pa-md q-pa-sm-xl flex justify-center">
          <div
            id="print-spkl-area"
            class="bg-white q-pa-xl shadow-4"
            style="
              width: 820px;
              min-height: 1000px;
              font-family: 'Times New Roman', Times, serif;
              color: #1e293b;
              line-height: 1.8;
            "
          >
            <!-- Kop Surat Resmi PT. TSC -->
            <div
              class="row items-center justify-between q-pb-md text-center"
              style="border-bottom: 2px solid #000"
            >
              <img
                src="/logo_white-removebg-preview.png"
                alt="TSC"
                style="
                  height: 48px;
                  background: #090d16;
                  padding: 4px 10px;
                  border-radius: 6px;
                "
              />
              <div style="flex: 1; padding: 0 15px">
                <div
                  style="
                    font-size: 18px;
                    font-weight: bold;
                    letter-spacing: 1px;
                  "
                >
                  PT. TRIMITRA SOLUSINDO CEMERLANG
                </div>
                <div style="font-size: 13px; font-style: italic">
                  Mechanical, Electrical, Plumbing, CCTV Security System & IT
                  Infrastructure
                </div>
                <div style="font-size: 11px">
                  Ruko Newton Square U18/30, Legenda Wisata, Nagrak, Gn. Putri,
                  Bogor &bull; www.tsc.co.id
                </div>
              </div>
            </div>

            <!-- Judul Dokumen SPKL -->
            <div class="text-center q-my-lg">
              <div
                style="
                  font-size: 18px;
                  font-weight: bold;
                  text-decoration: underline;
                "
              >
                SURAT PERINTAH KERJA LEMBUR (SPKL)
              </div>
              <div
                style="
                  font-size: 13px;
                  font-family: monospace;
                  font-weight: bold;
                  margin-top: 4px;
                "
              >
                Nomor: SPKL/TSC/{{ new Date().getFullYear() }}/{{
                  String(spklData?.id || 1).padStart(3, '0')
                }}
              </div>
            </div>

            <p style="text-indent: 40px; font-size: 14px; text-align: justify">
              Sehubungan dengan kebutuhan percepatan penyelesaian pekerjaan
              teknis dan pemenuhan jadwal *milestone* proyek di lapangan,
              manajemen dan pimpinan proyek dengan ini memberikan tugas lembur
              kepada personel teknisi berikut:
            </p>

            <!-- Tabel Identitas Personel & Jadwal -->
            <table
              style="
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
                margin: 15px 0 25px 0;
              "
            >
              <tbody>
                <tr>
                  <td style="width: 220px; padding: 6px 0; font-weight: bold"
                    >Nama Personel / Teknisi</td
                  >
                  <td style="width: 20px">:</td>
                  <td style="font-weight: bold">{{ spklData?.userName }}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold"
                    >Jabatan / Posisi</td
                  >
                  <td>:</td>
                  <td>{{ spklData?.position || 'Teknisi Lapangan' }}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold"
                    >Nama Proyek Penugasan</td
                  >
                  <td>:</td>
                  <td
                    ><strong>{{ spklData?.projectName }}</strong></td
                  >
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold"
                    >Tanggal Pelaksanaan Lembur</td
                  >
                  <td>:</td>
                  <td>{{ formatDate(spklData?.date) }}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold"
                    >Jam Lembur (Mulai - Selesai)</td
                  >
                  <td>:</td>
                  <td
                    >{{ spklData?.startTime || '17:00' }} WIB &mdash;
                    {{ spklData?.endTime || '20:00' }} WIB</td
                  >
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold"
                    >Total Durasi Waktu Lembur</td
                  >
                  <td>:</td>
                  <td
                    ><strong style="color: #0f172a"
                      >{{ spklData?.hours }} (Jam)</strong
                    ></td
                  >
                </tr>
              </tbody>
            </table>

            <!-- Uraian Aktivitas Pekerjaan -->
            <div style="font-size: 14px; margin-bottom: 25px">
              <div style="font-weight: bold; margin-bottom: 6px"
                >Uraian Pekerjaan / Target Lembur:</div
              >
              <div
                style="
                  border: 1px solid #94a3b8;
                  padding: 12px;
                  border-radius: 4px;
                  background: #f8fafc;
                  text-align: justify;
                "
              >
                {{
                  spklData?.activity ||
                  'Pekerjaan penarikan kabel, instalasi perangkat keras MEP/CCTV, dan pengujian kelayakan sistem.'
                }}
              </div>
            </div>

            <!-- Status Persetujuan -->
            <div style="font-size: 14px; margin-bottom: 30px">
              <div style="font-weight: bold; margin-bottom: 4px"
                >Status Persetujuan Manajemen:</div
              >
              <div style="font-size: 13px">
                Status:
                <strong>{{
                  spklData?.status === 'approved'
                    ? 'DISETUJUI & DIVERIFIKASI'
                    : spklData?.status === 'rejected'
                      ? 'DITOLAK'
                      : 'MENUNGGU VERIFIKASI'
                }}</strong>
                <span v-if="spklData?.notes" class="q-ml-sm italic"
                  >({{ spklData.notes }})</span
                >
              </div>
            </div>

            <p style="font-size: 14px; text-align: justify">
              Demikian Surat Perintah Kerja Lembur ini diterbitkan untuk
              dilaksanakan dengan penuh rasa tanggung jawab serta tetap
              memprioritaskan keselamatan kerja (K3).
            </p>

            <!-- Tanda Tangan Resmi -->
            <div
              class="row justify-between text-center q-mt-xl"
              style="font-size: 14px; page-break-inside: avoid"
            >
              <div style="width: 260px">
                <div>Pelaksana Lembur,</div>
                <div style="font-weight: bold; margin-top: 4px"
                  >Teknisi Yang Bersangkutan</div
                >
                <div style="height: 75px"></div>
                <div style="border-bottom: 1px solid #000; font-weight: bold">
                  {{ spklData?.userName }}
                </div>
                <div style="font-size: 12px">{{
                  spklData?.position || 'Teknisi Lapangan'
                }}</div>
              </div>

              <div style="width: 260px">
                <div>Menyetujui &amp; Menugaskan,</div>
                <div style="font-weight: bold; margin-top: 4px"
                  >Project Manager / Supervisor</div
                >
                <div style="height: 75px"></div>
                <div style="border-bottom: 1px solid #000; font-weight: bold">
                  {{ spklData?.approvedBy || 'Project Manager TSC' }}
                </div>
                <div style="font-size: 12px">Manager / Pengawas Proyek</div>
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
  getOvertimes,
  createOvertime,
  updateOvertimeStatus
} from '/src/services/overtime.service.js'
import { getProjects } from '/src/services/projects.service.js'
import { formatDate } from '/src/config/projects.js'

const $q = useQuasar()
const { user } = useAuth()

const loading = ref(true)
const overtimes = ref([])
const projects = ref([])

const createDialog = ref(false)
const approvalDialog = ref(false)
const printSpklDialog = ref(false)
const spklData = ref(null)
const activeOt = ref(null)
const actionStatus = ref('approved')
const approvalNotes = ref('')

const canApprove = computed(() => {
  return ['admin', 'manager', 'pm'].includes(user.value?.role)
})

const totalHours = computed(() => {
  return overtimes.value
    .filter(o => o.status === 'approved')
    .reduce((s, o) => s + (Number(o.hours) || 0), 0)
})

const displayedOvertimes = computed(() => {
  // Jika role staff, hanya lihat lembur miliknya
  if (user.value?.role === 'staff') {
    return overtimes.value.filter(o => o.userId === user.value.id)
  }
  return overtimes.value
})

const projectOptions = computed(() => {
  return projects.value.map(p => ({
    label: `${p.code} - ${p.name}`,
    value: p.id
  }))
})

const columns = [
  {
    name: 'userName',
    label: 'Nama Karyawan',
    field: 'userName',
    align: 'left'
  },
  { name: 'projectName', label: 'Proyek & Tanggal', align: 'left' },
  { name: 'hours', label: 'Jam & Durasi Lembur', align: 'center' },
  {
    name: 'activity',
    label: 'Uraian Aktivitas Lembur',
    field: 'activity',
    align: 'left'
  },
  { name: 'status', label: 'Status SPKL', field: 'status', align: 'center' },
  { name: 'actions', label: 'Aksi', align: 'center' }
]

const form = reactive({
  projectId: null,
  projectName: '',
  date: new Date().toISOString().slice(0, 10),
  startTime: '17:00',
  endTime: '21:00',
  hours: 4,
  activity: ''
})

function statusBadge(status) {
  switch (status) {
    case 'approved':
      return { label: 'DISETUJUI', color: 'green-1', textColor: 'green-9' }
    case 'rejected':
      return { label: 'DITOLAK', color: 'red-1', textColor: 'red-9' }
    default:
      return {
        label: 'MENUNGGU VERIFIKASI',
        color: 'amber-1',
        textColor: 'amber-9'
      }
  }
}

function onProjectSelect(projectId) {
  const p = projects.value.find(pr => pr.id === projectId)
  if (p) form.projectName = p.name
}

function openCreateDialog() {
  form.projectId = projects.value[0]?.id || null
  if (form.projectId) onProjectSelect(form.projectId)
  form.date = new Date().toISOString().slice(0, 10)
  form.startTime = '17:00'
  form.endTime = '21:00'
  form.hours = 4
  form.activity = ''
  createDialog.value = true
}

async function submitOvertime() {
  try {
    const res = await createOvertime(user.value, form)
    overtimes.value.unshift(res)
    createDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Pengajuan lembur (SPKL) berhasil dikirim!'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal mengajukan lembur'
    })
  }
}

function openApprovalDialog(ot, status) {
  activeOt.value = ot
  actionStatus.value = status
  approvalNotes.value =
    status === 'approved'
      ? 'Disetujui untuk lembur proyek.'
      : 'Tidak disetujui.'
  approvalDialog.value = true
}

async function confirmAction() {
  try {
    const updated = await updateOvertimeStatus(
      activeOt.value.id,
      user.value,
      actionStatus.value,
      approvalNotes.value
    )
    const idx = overtimes.value.findIndex(o => o.id === updated.id)
    if (idx !== -1) overtimes.value[idx] = updated
    approvalDialog.value = false
    $q.notify({
      type: 'positive',
      message: `Pengajuan lembur ${actionStatus.value === 'approved' ? 'disetujui' : 'ditolak'}`
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal memproses persetujuan'
    })
  }
}

function openPrintSpkl(ot) {
  spklData.value = ot
  printSpklDialog.value = true
}

function printSpkl() {
  window.print()
}

onMounted(async () => {
  try {
    const [otList, pList] = await Promise.all([getOvertimes(), getProjects()])
    overtimes.value = otList || []
    projects.value = pList || []
  } finally {
    loading.value = false
  }
})
</script>
