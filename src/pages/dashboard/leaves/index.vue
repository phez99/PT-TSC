<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">
          Pengajuan &amp; Persetujuan Izin / Cuti
        </div>
        <div class="text-grey-7 text-body2">
          Layanan mandiri karyawan untuk cuti tahunan, sakit, serta verifikasi persetujuan pimpinan.
        </div>
      </div>
      <q-btn
        class="btn-gold"
        no-caps
        icon="add"
        label="Ajukan Izin / Cuti Baru"
        @click="openCreateDialog"
      />
    </div>

    <!-- ================= KPI RINGKASAN CUTI ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">HAK CUTI TAHUNAN</div>
          <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">12 Hari</div>
          <div class="text-caption text-grey-6">Tahun Berjalan 2026</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">MENUNGGU APPROVAL</div>
          <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">
            {{ leaves.filter(l => l.status === 'pending').length }}
          </div>
          <div class="text-caption text-amber-9 text-weight-medium">Perlu Persetujuan</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">DISETUJUI (APPROVED)</div>
          <div class="text-h4 text-weight-bold text-positive q-my-xs">
            {{ leaves.filter(l => l.status === 'approved').length }}
          </div>
          <div class="text-caption text-positive text-weight-medium">Izin Resmi Terbit</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">DITOLAK (REJECTED)</div>
          <div class="text-h4 text-weight-bold text-negative q-my-xs">
            {{ leaves.filter(l => l.status === 'rejected').length }}
          </div>
          <div class="text-caption text-grey-6">Tidak Disetujui</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABS: SEMUA PENGAJUAN / PERLU APPROVAL ================= -->
    <q-card class="company-dash-card q-mb-md" v-if="canApprove">
      <q-tabs
        v-model="tab"
        dense
        align="left"
        active-color="amber-8"
        indicator-color="amber-8"
        class="text-grey-7"
      >
        <q-tab name="all" label="Semua Pengajuan Karyawan" no-caps />
        <q-tab name="pending" :label="`Menunggu Persetujuan (${pendingCount})`" no-caps />
      </q-tabs>
    </q-card>

    <!-- ================= TABEL CUTI ================= -->
    <q-card class="company-dash-card">
      <q-table
        flat
        :rows="displayedLeaves"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada catatan pengajuan cuti"
        class="company-dash-table"
      >
        <!-- Karyawan -->
        <template #body-cell-userName="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.userName }}</div>
            <div class="text-caption text-grey-6">{{ props.row.position }}</div>
          </q-td>
        </template>

        <!-- Jenis Cuti -->
        <template #body-cell-leaveType="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="leaveTypeBadge(props.row.leaveType).color"
              :label="leaveTypeBadge(props.row.leaveType).label"
              class="q-pa-xs q-px-sm text-weight-bold"
            />
          </q-td>
        </template>

        <!-- Durasi -->
        <template #body-cell-dates="props">
          <q-td :props="props">
            <div class="text-weight-medium">
              {{ formatDate(props.row.startDate) }} &ndash; {{ formatDate(props.row.endDate) }}
            </div>
            <div class="text-caption text-grey-7">
              Durasi: <strong>{{ props.row.daysCount }} Hari Kerja</strong>
            </div>
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
            <div v-if="props.row.approverName" class="text-caption text-grey-6" style="font-size: 10px;">
              oleh {{ props.row.approverName }}
            </div>
          </q-td>
        </template>

        <!-- Alasan -->
        <template #body-cell-reason="props">
          <q-td :props="props">
            <div class="text-body2" style="max-width: 260px;">{{ props.row.reason }}</div>
            <div v-if="props.row.notes" class="text-caption text-grey-7 italic">
              Catatan: "{{ props.row.notes }}"
            </div>
          </q-td>
        </template>

        <!-- Aksi Approval (Admin / Manager) -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div v-if="canApprove && props.row.status === 'pending'" class="row q-gutter-xs justify-center no-wrap">
              <q-btn
                flat
                round
                dense
                color="positive"
                icon="check_circle"
                @click="openApprovalDialog(props.row, 'approved')"
              >
                <q-tooltip>Setujui Izin / Cuti</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="cancel"
                @click="openApprovalDialog(props.row, 'rejected')"
              >
                <q-tooltip>Tolak Izin / Cuti</q-tooltip>
              </q-btn>
            </div>
            <div v-else class="text-caption text-grey-5">-</div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog Pengajuan Baru -->
    <q-dialog v-model="createDialog">
      <q-card style="width: 500px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Form Pengajuan Izin / Cuti</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="submitLeave">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-select
              v-model="form.leaveType"
              :options="[
                { label: 'Cuti Tahunan', value: 'annual' },
                { label: 'Izin Sakit (Surat Dokter)', value: 'sick' },
                { label: 'Keperluan Mendesak / Darurat', value: 'urgent' }
              ]"
              emit-value
              map-options
              dense
              outlined
              label="Jenis Pengajuan"
            />
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model="form.startDate"
                  type="date"
                  dense
                  outlined
                  label="Mulai Tanggal"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="form.endDate"
                  type="date"
                  dense
                  outlined
                  label="Sampai Tanggal"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
            </div>
            <q-input
              v-model.number="form.daysCount"
              type="number"
              dense
              outlined
              label="Jumlah Hari Kerja"
              :rules="[v => !!v && v > 0 || 'Minimal 1 hari']"
            />
            <q-input
              v-model="form.reason"
              type="textarea"
              rows="3"
              dense
              outlined
              label="Alasan Lengkap Pengajuan"
              placeholder="Jelaskan keperluan izin atau cuti yang diajukan..."
              :rules="[v => !!v || 'Alasan wajib diisi']"
            />
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
            <q-btn type="submit" class="btn-gold" label="Kirim Pengajuan" no-caps />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- Dialog Approval / Penolakan -->
    <q-dialog v-model="approvalDialog">
      <q-card style="width: 440px; max-width: 90vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ actionStatus === 'approved' ? 'Setujui Pengajuan Cuti' : 'Tolak Pengajuan Cuti' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body2 text-grey-8 q-mb-md">
            Konfirmasi tindakan untuk pengajuan dari <strong>{{ activeLeave?.userName }}</strong> ({{ activeLeave?.daysCount }} hari).
          </div>
          <q-input
            v-model="approvalNotes"
            dense
            outlined
            label="Catatan Pimpinan (Opsional)"
            placeholder="Contoh: Disetujui, harap koordinasikan serah terima pekerjaan sebelum cuti."
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
          <q-btn
            :color="actionStatus === 'approved' ? 'positive' : 'negative'"
            :label="actionStatus === 'approved' ? 'Setujui Cuti' : 'Tolak Cuti'"
            no-caps
            @click="confirmAction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'
import {
  getLeaves,
  createLeave,
  updateLeaveStatus
} from '/src/services/leaves.service.js'
import { formatDate } from '/src/config/projects.js'

const $q = useQuasar()
const { user } = useAuth()

const loading = ref(true)
const leaves = ref([])
const tab = ref('all')

const createDialog = ref(false)
const approvalDialog = ref(false)
const activeLeave = ref(null)
const actionStatus = ref('approved')
const approvalNotes = ref('')

const canApprove = computed(() => {
  return ['admin', 'manager'].includes(user.value?.role)
})

const pendingCount = computed(() => {
  return leaves.value.filter(l => l.status === 'pending').length
})

const displayedLeaves = computed(() => {
  let list = leaves.value
  // Jika role adalah staff, hanya tampilkan pengajuan miliknya sendiri
  if (user.value?.role === 'staff') {
    list = list.filter(l => l.userId === user.value.id)
  } else if (tab.value === 'pending') {
    list = list.filter(l => l.status === 'pending')
  }
  return list
})

const columns = [
  { name: 'userName', label: 'Nama Karyawan', field: 'userName', align: 'left' },
  { name: 'leaveType', label: 'Jenis Izin', field: 'leaveType', align: 'center' },
  { name: 'dates', label: 'Tanggal & Durasi', align: 'left' },
  { name: 'reason', label: 'Alasan / Uraian', field: 'reason', align: 'left' },
  { name: 'status', label: 'Status Persetujuan', field: 'status', align: 'center' },
  { name: 'actions', label: 'Aksi', align: 'center' }
]

const form = reactive({
  leaveType: 'annual',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  daysCount: 2,
  reason: ''
})

function leaveTypeBadge(type) {
  switch (type) {
    case 'annual': return { label: 'CUTI TAHUNAN', color: 'primary' }
    case 'sick': return { label: 'SAKIT', color: 'amber-8' }
    default: return { label: 'MENDESAK', color: 'purple-8' }
  }
}

function statusBadge(status) {
  switch (status) {
    case 'approved': return { label: 'DISETUJUI', color: 'green-1', textColor: 'green-9' }
    case 'rejected': return { label: 'DITOLAK', color: 'red-1', textColor: 'red-9' }
    default: return { label: 'MENUNGGU APPROVAL', color: 'amber-1', textColor: 'amber-9' }
  }
}

function openCreateDialog() {
  form.leaveType = 'annual'
  form.startDate = new Date().toISOString().slice(0, 10)
  form.endDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  form.daysCount = 2
  form.reason = ''
  createDialog.value = true
}

async function submitLeave() {
  try {
    const res = await createLeave(user.value, form)
    leaves.value.unshift(res)
    createDialog.value = false
    $q.notify({ type: 'positive', message: 'Pengajuan izin berhasil diajukan!' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal mengajukan izin' })
  }
}

function openApprovalDialog(leave, status) {
  activeLeave.value = leave
  actionStatus.value = status
  approvalNotes.value = status === 'approved' ? 'Disetujui.' : 'Mohon dijadwalkan ulang karena jadwal proyek padat.'
  approvalDialog.value = true
}

async function confirmAction() {
  try {
    const updated = await updateLeaveStatus(
      activeLeave.value.id,
      user.value,
      actionStatus.value,
      approvalNotes.value
    )
    const idx = leaves.value.findIndex(l => l.id === updated.id)
    if (idx !== -1) leaves.value[idx] = updated
    approvalDialog.value = false
    $q.notify({
      type: 'positive',
      message: `Pengajuan cuti ${actionStatus.value === 'approved' ? 'disetujui' : 'ditolak'}`
    })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memproses approval' })
  }
}

onMounted(async () => {
  try {
    leaves.value = (await getLeaves()) || []
  } finally {
    loading.value = false
  }
})
</script>
