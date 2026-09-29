<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= JUDUL + TOMBOL TAMBAH ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-xs">
          <div class="text-h5 text-weight-bold" style="color: #0f172a">
            {{ isStaff ? 'Permintaan Material Saya' : 'Manajemen Permintaan Material' }}
          </div>
          <q-badge
            v-if="isStaff"
            color="amber-8"
            text-color="dark"
            class="text-weight-bold q-ml-sm"
          >
            PORTAL KARYAWAN
          </q-badge>
        </div>
        <div class="text-grey-7 text-body2">
          {{
            isStaff
              ? 'Daftar pengajuan kebutuhan suku cadang dan material yang Anda ajukan untuk pekerjaan lapangan.'
              : 'Pusat kontrol dan persetujuan pengadaan material seluruh proyek dan teknisi lapangan.'
          }}
        </div>
      </div>
      <q-btn
        class="btn-gold"
        no-caps
        icon="add"
        label="Ajukan Material Baru"
        @click="openDialog"
      />
    </div>

    <!-- ================= METRIK KPI ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">
            {{ isStaff ? 'TOTAL PENGAJUAN SAYA' : 'TOTAL PERMINTAAN' }}
          </div>
          <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
            {{ baseRequests.length }}
          </div>
          <div class="text-caption text-grey-6">
            {{ isStaff ? 'Kebutuhan Anda' : 'Dari Semua Personel' }}
          </div>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card
          class="company-dash-card q-pa-md"
          :style="pendingCount > 0 ? 'border: 1px solid #f59e0b;' : ''"
        >
          <div class="text-caption text-grey-7 text-weight-bold">
            MENUNGGU PERSETUJUAN
          </div>
          <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">
            {{ pendingCount }}
          </div>
          <div class="text-caption text-amber-9 text-weight-medium">
            {{ isStaff ? 'Dalam Proses Review' : 'Memerlukan Approval' }}
          </div>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">DISETUJUI</div>
          <div class="text-h4 text-weight-bold text-positive q-my-xs">
            {{ approvedCount }}
          </div>
          <div class="text-caption text-positive text-weight-medium">
            Lolos Verifikasi
          </div>
        </q-card>
      </div>

      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">
            DIPROSES PENGADAAN
          </div>
          <div class="text-h4 text-weight-bold text-primary q-my-xs">
            {{ processedCount }}
          </div>
          <div class="text-caption text-grey-6">
            PO / Pembelian Suku Cadang
          </div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABS KHUSUS ADMIN & MANAGEMENT ================= -->
    <q-card v-if="!isStaff" class="company-dash-card q-mb-md">
      <q-tabs
        v-model="tab"
        dense
        align="left"
        active-color="amber-8"
        indicator-color="amber-8"
        class="text-grey-7"
      >
        <q-tab
          name="all"
          :label="`Semua Permintaan (${requests.length})`"
          no-caps
        />
        <q-tab
          name="pending"
          :label="`Menunggu Approval (${allPendingCount})`"
          no-caps
        />
        <q-tab
          name="mine"
          :label="`Pengajuan Saya Pribadi (${myRequestsCount})`"
          no-caps
        />
      </q-tabs>
    </q-card>

    <!-- ================= TABEL MATERIAL REQUESTS ================= -->
    <q-card class="company-dash-card">
      <q-table
        class="company-dash-table"
        flat
        row-key="id"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada pengajuan material"
        @row-click="openDetail"
      >
        <template #top>
          <q-input
            v-model="search"
            dense
            outlined
            debounce="200"
            placeholder="Cari kode MR, nama proyek, material..."
            style="width: 280px"
          >
            <template #prepend><q-icon name="search" /></template>
            <template #append v-if="search">
              <q-icon
                name="clear"
                class="cursor-pointer"
                @click="search = ''"
              />
            </template>
          </q-input>

          <q-space />

          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            emit-value
            map-options
            dense
            outlined
            label="Filter Status"
            style="min-width: 200px"
          />
        </template>

        <template #body-cell-code="props">
          <q-td :props="props" class="font-mono text-weight-bold text-primary">
            {{ props.row.code }}
          </q-td>
        </template>

        <template #body-cell-projectName="props">
          <q-td :props="props">
            <div class="text-weight-bold">
              {{ projectName(props.row.projectId) }}
            </div>
            <div class="text-caption text-grey-6">
              Dibutuhkan: {{ formatDate(props.row.neededDate) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-requesterName="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.requesterName }}</div>
            <div class="text-caption text-grey-6">
              {{ props.row.requesterPosition }}
            </div>
          </q-td>
        </template>

        <template #body-cell-priority="props">
          <q-td :props="props" class="text-center">
            <q-badge
              v-if="props.row.priority === 'urgent'"
              color="red-5"
              class="text-weight-bold"
              :label="priorityLabel(props.row.priority)"
            />
            <span v-else class="text-grey-7">{{
              priorityLabel(props.row.priority)
            }}</span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              size="sm"
              :color="approvalStatusOf(props.row.status).color"
              text-color="white"
              class="text-weight-bold"
            >
              {{ approvalStatusOf(props.row.status).label }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-itemCount="props">
          <q-td :props="props" class="text-center">
            <q-badge color="blue-1" text-color="primary" class="text-weight-bold">
              {{ props.row.items.length }} Item
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="primary"
              icon="visibility"
              label="Detail"
              @click.stop="openDetail(null, props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ================= DIALOG AJUKAN MATERIAL ================= -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 680px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            Formulir Permintaan Material (MR)
          </div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-card-section>

        <q-form @submit.prevent="save">
          <q-card-section class="q-gutter-y-md q-pt-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.projectId"
                  :options="projectOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Pilih Proyek"
                  :rules="[v => !!v || 'Proyek wajib dipilih']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.neededDate"
                  type="date"
                  dense
                  outlined
                  label="Tanggal Dibutuhkan di Lokasi"
                  :rules="[v => !!v || 'Tanggal wajib diisi']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.priority"
                  :options="MATERIAL_PRIORITIES"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Tingkat Prioritas"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  :model-value="user?.name"
                  dense
                  outlined
                  readonly
                  label="Nama Pemohon"
                  hint="Otomatis terhubung dengan akun Anda"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.notes"
                  dense
                  outlined
                  label="Keterangan / Lokasi Pemasangan"
                  placeholder="Contoh: Untuk instalasi kamera IP CCTV lantai 3 gedung timur"
                />
              </div>
            </div>

            <!-- Daftar Item -->
            <div>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">
                Rincian Barang / Material yang Dibutuhkan:
              </div>

              <div
                v-for="(item, i) in form.items"
                :key="i"
                class="row q-col-gutter-xs items-center q-mb-xs"
              >
                <div class="col-6">
                  <q-input
                    v-model="item.name"
                    dense
                    outlined
                    placeholder="Nama material (mis. Kabel UTP Cat6)"
                    :rules="[v => !!v || 'Wajib diisi']"
                  />
                </div>
                <div class="col-2">
                  <q-input
                    v-model.number="item.qty"
                    type="number"
                    min="1"
                    dense
                    outlined
                    placeholder="Jumlah"
                    :rules="[v => v > 0 || '> 0']"
                  />
                </div>
                <div class="col-3">
                  <q-select
                    v-model="item.unit"
                    :options="MATERIAL_UNITS"
                    dense
                    outlined
                    placeholder="Satuan"
                  />
                </div>
                <div class="col-1 text-center">
                  <q-btn
                    v-if="form.items.length > 1"
                    flat
                    round
                    dense
                    icon="remove_circle_outline"
                    color="negative"
                    @click="removeItemRow(i)"
                  />
                </div>
              </div>

              <q-btn
                flat
                dense
                no-caps
                icon="add"
                label="Tambah Baris Material"
                color="amber-9"
                @click="addItemRow"
              />
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat no-caps label="Batal" @click="closeDialog" />
            <q-btn
              type="submit"
              class="btn-gold"
              no-caps
              icon="send"
              label="Kirim Permintaan"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'
import { getProjects } from '/src/services/projects.service.js'
import {
  getMaterialRequests,
  createMaterialRequest
} from '/src/services/material-requests.service.js'
import { approvalStatusOf, APPROVAL_STATUSES } from '/src/config/approval.js'
import {
  MATERIAL_UNITS,
  MATERIAL_PRIORITIES,
  priorityLabel
} from '/src/config/material.js'
import { formatDate } from '/src/config/projects.js'

const $q = useQuasar()
const router = useRouter()
const { user } = useAuth()

const requests = ref([])
const projects = ref([])
const loading = ref(false)
const statusFilter = ref('all')
const search = ref('')
const tab = ref('all')

const isStaff = computed(() => user.value?.role === 'staff')

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  ...APPROVAL_STATUSES
]

const projectOptions = computed(() =>
  projects.value.map(p => ({ value: p.id, label: `${p.code} — ${p.name}` }))
)

// Sesuai permintaan: role karyawan HANYA menampilkan request dari id tersebut
const baseRequests = computed(() => {
  if (isStaff.value) {
    return requests.value.filter(r =>
      Number(r.requesterId) === Number(user.value?.id) ||
      (!r.requesterId && r.requesterName === user.value?.name)
    )
  }
  if (tab.value === 'mine') {
    return requests.value.filter(r =>
      Number(r.requesterId) === Number(user.value?.id) ||
      (!r.requesterId && r.requesterName === user.value?.name)
    )
  }
  if (tab.value === 'pending') {
    return requests.value.filter(r => r.status === 'submitted')
  }
  return requests.value
})

const pendingCount = computed(() => {
  return baseRequests.value.filter(r => r.status === 'submitted').length
})

const allPendingCount = computed(() => {
  return requests.value.filter(r => r.status === 'submitted').length
})

const approvedCount = computed(() => {
  return baseRequests.value.filter(r => r.status === 'approved').length
})

const processedCount = computed(() => {
  return baseRequests.value.filter(r => r.status === 'processed').length
})

const myRequestsCount = computed(() => {
  return requests.value.filter(r =>
    Number(r.requesterId) === Number(user.value?.id) ||
    (!r.requesterId && r.requesterName === user.value?.name)
  ).length
})

const rows = computed(() => {
  let list = baseRequests.value
  if (statusFilter.value !== 'all') {
    list = list.filter(r => r.status === statusFilter.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(r => {
      const pName = projectName(r.projectId).toLowerCase()
      const hasItem = r.items?.some(it => it.name.toLowerCase().includes(q))
      return (
        r.code.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        pName.includes(q) ||
        hasItem
      )
    })
  }
  return list
})

const columns = computed(() => {
  const cols = [
    { name: 'code', label: 'Kode MR', field: 'code', align: 'left', sortable: true },
    { name: 'projectName', label: 'Proyek Terkait', field: 'projectId', align: 'left' }
  ]

  // Jika bukan karyawan tunggal, tampilkan kolom nama pemohon
  if (!isStaff.value) {
    cols.push({
      name: 'requesterName',
      label: 'Pemohon',
      field: 'requesterName',
      align: 'left'
    })
  }

  cols.push(
    { name: 'itemCount', label: 'Rincian Item', field: r => r.items.length, align: 'center' },
    { name: 'priority', label: 'Prioritas', field: 'priority', align: 'center' },
    { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
    { name: 'actions', label: 'Aksi', align: 'center' }
  )

  return cols
})

function projectName(projectId) {
  const p = projects.value.find(p => p.id === projectId)
  return p ? p.name : '-'
}

async function load() {
  loading.value = true
  try {
    const [reqs, projs] = await Promise.all([
      getMaterialRequests(),
      getProjects()
    ])
    requests.value = reqs
    projects.value = projs
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openDetail(_evt, row) {
  router.push(`/dashboard/material-requests/${row.id}`)
}

// ---------- Dialog tambah ----------
const dialog = ref(false)
const saving = ref(false)

const emptyForm = () => ({
  projectId: null,
  neededDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  priority: 'normal',
  notes: '',
  items: [{ name: '', qty: 1, unit: 'pcs' }]
})
const form = reactive(emptyForm())

function openDialog() {
  Object.assign(form, emptyForm())
  form.projectId = projects.value[0]?.id || null
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
}

function addItemRow() {
  form.items.push({ name: '', qty: 1, unit: 'pcs' })
}

function removeItemRow(i) {
  form.items.splice(i, 1)
}

async function save() {
  const validItems = form.items.filter(it => it.name.trim() && it.qty > 0)
  if (!validItems.length) {
    $q.notify({
      type: 'negative',
      message: 'Isi minimal 1 material dengan jumlah lebih dari 0'
    })
    return
  }

  saving.value = true
  try {
    const created = await createMaterialRequest(
      { ...form, items: validItems },
      user.value
    )
    $q.notify({
      type: 'positive',
      message: `Permintaan ${created.code} berhasil diajukan`
    })
    closeDialog()
    await load()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal mengajukan material'
    })
  } finally {
    saving.value = false
  }
}
</script>
