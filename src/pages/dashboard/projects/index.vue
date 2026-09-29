<template>
  <q-page class="q-pa-lg">
    <!-- ================= JUDUL + TOMBOL TAMBAH ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a"
          >Manajemen Proyek</div
        >
        <div class="text-grey-7 text-body2"
          >Kelola seluruh proyek konstruksi, MEP, dan security system perusahaan.</div
        >
      </div>
      <q-btn
        class="btn-gold"
        no-caps
        icon="add"
        label="Tambah Proyek Baru"
        @click="dialog = true"
      />
    </div>

    <!-- ================= KPI PROYEK ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7">TOTAL PROYEK</div>
          <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">{{ rows.length }}</div>
          <div class="text-caption text-grey-6">Seluruh Proyek Terdaftar</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7">SEDANG BERJALAN</div>
          <div class="text-h4 text-weight-bold text-primary q-my-xs">
            {{ rows.filter(r => r.status === 'ongoing').length }}
          </div>
          <div class="text-caption text-grey-6">Aktif di Lapangan</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7">TAHAP PERENCANAAN</div>
          <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">
            {{ rows.filter(r => r.status === 'planning').length }}
          </div>
          <div class="text-caption text-grey-6">Desain & Persiapan</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7">SELESAI (BAST)</div>
          <div class="text-h4 text-weight-bold text-positive q-my-xs">
            {{ rows.filter(r => r.status === 'done').length }}
          </div>
          <div class="text-caption text-grey-6">Telah Serah Terima</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABEL PROYEK ================= -->
    <q-card class="company-dash-card">
      <q-table
        class="company-dash-table"
        flat
        row-key="id"
        :rows="rows"
        :columns="columns"
        :filter="search"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada proyek"
        @row-click="openDetail"
      >
        <template #top>
          <q-input
            v-model="search"
            dense
            outlined
            debounce="200"
            placeholder="Cari proyek..."
            style="width: 260px"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <q-space />
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            emit-value
            map-options
            dense
            outlined
            label="Status"
            style="min-width: 180px"
          />
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="statusOf(props.row.status).color"
              :label="statusOf(props.row.status).label"
            />
          </q-td>
        </template>

        <template #body-cell-progress="props">
          <q-td :props="props" style="min-width: 140px">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-linear-progress
                :value="props.row.progress / 100"
                color="amber-8"
                track-color="grey-3"
                rounded
                size="8px"
                style="flex: 1"
              />
              <span class="text-caption text-grey-8"
                >{{ props.row.progress }}%</span
              >
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ================= DIALOG TAMBAH PROYEK ================= -->
    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 520px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Tambah Proyek</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="closeDialog" />
        </q-card-section>

        <q-form @submit.prevent="save">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Nama proyek"
              outlined
              lazy-rules
              :rules="[v => !!v || 'Nama proyek wajib diisi']"
            />
            <q-input
              v-model="form.client"
              label="Klien"
              outlined
              lazy-rules
              :rules="[v => !!v || 'Klien wajib diisi']"
            />
            <q-input v-model="form.location" label="Lokasi" outlined />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.category"
                  :options="PROJECT_CATEGORIES"
                  emit-value
                  map-options
                  label="Kategori"
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.status"
                  :options="PROJECT_STATUSES"
                  emit-value
                  map-options
                  label="Status"
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.startDate"
                  type="date"
                  label="Tanggal mulai"
                  stack-label
                  outlined
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.endDate"
                  type="date"
                  label="Target selesai"
                  stack-label
                  outlined
                  lazy-rules
                  :rules="[
                    v =>
                      !v ||
                      !form.startDate ||
                      v >= form.startDate ||
                      'Tidak boleh sebelum tanggal mulai'
                  ]"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat no-caps label="Batal" @click="closeDialog" />
            <q-btn
              type="submit"
              class="btn-gold"
              no-caps
              label="Simpan"
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
import { getProjects, createProject } from '/src/services/projects.service.js'
import {
  PROJECT_STATUSES,
  PROJECT_CATEGORIES,
  statusOf,
  categoryLabel
} from '/src/config/projects.js'

const $q = useQuasar()
const router = useRouter()

const projects = ref([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: 'Semua status' },
  ...PROJECT_STATUSES
]

const rows = computed(() =>
  statusFilter.value === 'all'
    ? projects.value
    : projects.value.filter(p => p.status === statusFilter.value)
)

const columns = [
  { name: 'code', label: 'Kode', field: 'code', align: 'left', sortable: true },
  {
    name: 'name',
    label: 'Nama Proyek',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'client',
    label: 'Klien',
    field: 'client',
    align: 'left',
    sortable: true
  },
  {
    name: 'category',
    label: 'Kategori',
    field: 'category',
    align: 'left',
    format: v => categoryLabel(v)
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left',
    sortable: true
  },
  {
    name: 'progress',
    label: 'Progres',
    field: 'progress',
    align: 'left',
    sortable: true
  }
]

async function load() {
  loading.value = true
  try {
    projects.value = await getProjects()
  } finally {
    loading.value = false
  }
}

onMounted(load)

function openDetail(_evt, row) {
  router.push(`/dashboard/projects/${row.id}`)
}

// ---------- Dialog tambah proyek ----------
const dialog = ref(false)
const saving = ref(false)

const emptyForm = () => ({
  name: '',
  client: '',
  location: '',
  category: 'electronic',
  status: 'planning',
  startDate: '',
  endDate: ''
})
const form = reactive(emptyForm())

function closeDialog() {
  dialog.value = false
  Object.assign(form, emptyForm())
}

async function save() {
  saving.value = true
  try {
    const created = await createProject({ ...form })
    $q.notify({
      type: 'positive',
      message: `Proyek ${created.code} ditambahkan`
    })
    closeDialog()
    await load()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal menyimpan proyek'
    })
  } finally {
    saving.value = false
  }
}
</script>
