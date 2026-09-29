<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">
          Manajemen Karyawan &amp; Hak Akses (RBAC)
        </div>
        <div class="text-grey-7 text-body2">
          Kelola data pengguna portal, jabatan karyawan, serta matriks perizinan role.
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="primary"
          no-caps
          icon="security"
          label="Matriks Izin Role"
          @click="showMatrixDialog = true"
        />
        <q-btn
          class="btn-gold"
          no-caps
          icon="person_add"
          label="Tambah Karyawan"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- ================= KPI KARYAWAN ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">TOTAL PENGGUNA</div>
          <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">{{ users.length }}</div>
          <div class="text-caption text-grey-6">Akun Internal Aktif</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">MANAJEMEN / PM</div>
          <div class="text-h4 text-weight-bold text-primary q-my-xs">
            {{ users.filter(u => u.role === 'admin' || u.role === 'manager' || u.role === 'pm').length }}
          </div>
          <div class="text-caption text-grey-6">Approval &amp; Supervisi</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">TIM TEKNISI &amp; STAF</div>
          <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">
            {{ users.filter(u => u.role === 'staff').length }}
          </div>
          <div class="text-caption text-grey-6">Operasional Lapangan</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">FINANCE &amp; BILLING</div>
          <div class="text-h4 text-weight-bold text-positive q-my-xs">
            {{ users.filter(u => u.role === 'finance').length }}
          </div>
          <div class="text-caption text-grey-6">Keuangan &amp; Faktur</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABEL PENGGUNA ================= -->
    <q-card class="company-dash-card">
      <q-table
        flat
        :rows="filteredUsers"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada data karyawan"
        class="company-dash-table"
      >
        <template #top>
          <q-input
            v-model="search"
            dense
            outlined
            debounce="200"
            placeholder="Cari nama, email, jabatan..."
            style="width: 280px"
          >
            <template #prepend><q-icon name="search" /></template>
            <template #append v-if="search">
              <q-icon name="clear" class="cursor-pointer" @click="search = ''" />
            </template>
          </q-input>

          <q-space />

          <q-select
            v-model="roleFilter"
            :options="roleOptions"
            emit-value
            map-options
            dense
            outlined
            label="Filter Role"
            style="min-width: 180px"
          />
        </template>

        <!-- Karyawan -->
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="row items-center q-gutter-sm">
              <q-avatar color="navy-900" text-color="amber-5" size="36px" class="text-weight-bold">
                {{ props.row.name.charAt(0).toUpperCase() }}
              </q-avatar>
              <div>
                <div class="text-weight-bold text-navy-950">{{ props.row.name }}</div>
                <div class="text-caption text-grey-7 font-mono">{{ props.row.email }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <!-- Jabatan -->
        <template #body-cell-position="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.position }}</div>
            <div class="text-caption text-grey-6">{{ props.row.phone || '-' }}</div>
          </q-td>
        </template>

        <!-- Role Badge -->
        <template #body-cell-role="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="roleBadge(props.row.role).color"
              :label="roleBadge(props.row.role).label"
              class="q-pa-xs q-px-sm text-weight-bold"
            />
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              size="sm"
              :color="props.row.status === 'active' ? 'green-1' : 'grey-2'"
              :text-color="props.row.status === 'active' ? 'green-9' : 'grey-7'"
              class="text-weight-bold"
            >
              {{ props.row.status === 'active' ? 'AKTIF' : 'NONAKTIF' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Aksi -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="row q-gutter-xs justify-center no-wrap">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Edit Data</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.id !== 1"
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Hapus Akun</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ================= DIALOG FORM KARYAWAN ================= -->
    <q-dialog v-model="userDialog" persistent>
      <q-card style="width: 520px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            {{ isEditing ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveUser">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-input
              v-model="userForm.name"
              dense
              outlined
              label="Nama Lengkap Karyawan"
              :rules="[v => !!v || 'Nama wajib diisi']"
            />
            <q-input
              v-model="userForm.email"
              type="email"
              dense
              outlined
              label="Alamat Email Perusahaan"
              placeholder="nama@tsc.local"
              :rules="[v => !!v || 'Email wajib diisi']"
            />
            <q-input
              v-model="userForm.password"
              :type="showPwd ? 'text' : 'password'"
              dense
              outlined
              label="Password Akun"
              placeholder="Minimal 6 karakter"
              :rules="[v => isEditing ? true : (!!v && v.length >= 6) || 'Minimal 6 karakter']"
            >
              <template #append>
                <q-icon
                  :name="showPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPwd = !showPwd"
                />
              </template>
            </q-input>

            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-select
                  v-model="userForm.role"
                  :options="[
                    { label: 'Administrator', value: 'admin' },
                    { label: 'Manager Operasional', value: 'manager' },
                    { label: 'Project Manager', value: 'pm' },
                    { label: 'Staff Finance', value: 'finance' },
                    { label: 'Staf Teknisi Lapangan', value: 'staff' }
                  ]"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Role Hak Akses"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="userForm.position"
                  dense
                  outlined
                  label="Jabatan Formal"
                  placeholder="Mis. Site Engineer"
                  :rules="[v => !!v || 'Jabatan wajib diisi']"
                />
              </div>
            </div>

            <q-input
              v-model="userForm.phone"
              dense
              outlined
              label="Nomor Telepon / WhatsApp"
              placeholder="+62 812-xxxx-xxxx"
            />

            <q-select
              v-model="userForm.status"
              :options="[
                { label: 'Aktif Bekerja', value: 'active' },
                { label: 'Nonaktif / Cuti', value: 'inactive' }
              ]"
              emit-value
              map-options
              dense
              outlined
              label="Status Karyawan"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
            <q-btn type="submit" class="btn-gold" label="Simpan Karyawan" no-caps />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ================= DIALOG MATRIKS RBAC ================= -->
    <q-dialog v-model="showMatrixDialog">
      <q-card style="width: 780px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Matriks Perizinan Role (Access Control Matrix)</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #0f172a; color: white;">
                <th style="padding: 10px; text-align: left;">Modul / Fitur</th>
                <th style="padding: 10px; text-align: center;">Admin</th>
                <th style="padding: 10px; text-align: center;">Manager</th>
                <th style="padding: 10px; text-align: center;">PM</th>
                <th style="padding: 10px; text-align: center;">Finance</th>
                <th style="padding: 10px; text-align: center;">Teknisi</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Ringkasan (Dashboard)</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 10px; font-weight: bold;">Proyek &amp; Penugasan Tim</td>
                <td style="text-align: center; color: #16a34a;">&check; Kelola</td>
                <td style="text-align: center; color: #16a34a;">&check; Kelola</td>
                <td style="text-align: center; color: #16a34a;">&check; Kelola</td>
                <td style="text-align: center; color: #64748b;">Lihat</td>
                <td style="text-align: center; color: #64748b;">Lihat</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Permohonan Material (MR)</td>
                <td style="text-align: center; color: #16a34a;">Approval</td>
                <td style="text-align: center; color: #16a34a;">Approval</td>
                <td style="text-align: center; color: #2563eb;">Ajukan</td>
                <td style="text-align: center; color: #d97706;">Proses PO</td>
                <td style="text-align: center; color: #2563eb;">Ajukan</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 10px; font-weight: bold;">Invoices &amp; Penagihan</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #64748b;">Lihat</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #ef4444;">&times;</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Dokumen &amp; BAST Proyek</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #64748b;">Lihat</td>
                <td style="text-align: center; color: #64748b;">Lihat</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                <td style="padding: 10px; font-weight: bold;">Presensi &amp; Absensi GPS</td>
                <td style="text-align: center; color: #16a34a;">Rekap</td>
                <td style="text-align: center; color: #16a34a;">Rekap</td>
                <td style="text-align: center; color: #16a34a;">Rekap</td>
                <td style="text-align: center; color: #16a34a;">Rekap</td>
                <td style="text-align: center; color: #2563eb;">Clock In/Out</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px; font-weight: bold;">Pengguna &amp; Hak Akses</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #16a34a;">&check; Penuh</td>
                <td style="text-align: center; color: #ef4444;">&times;</td>
                <td style="text-align: center; color: #ef4444;">&times;</td>
                <td style="text-align: center; color: #ef4444;">&times;</td>
              </tr>
            </tbody>
          </table>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Tutup" color="primary" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '/src/services/auth.service.js'

const $q = useQuasar()

const loading = ref(true)
const search = ref('')
const roleFilter = ref('all')
const users = ref([])

const userDialog = ref(false)
const showMatrixDialog = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showPwd = ref(false)

const roleOptions = [
  { label: 'Semua Role', value: 'all' },
  { label: 'Administrator', value: 'admin' },
  { label: 'Manager Operasional', value: 'manager' },
  { label: 'Project Manager', value: 'pm' },
  { label: 'Staff Finance', value: 'finance' },
  { label: 'Teknisi Lapangan', value: 'staff' }
]

const columns = [
  { name: 'name', label: 'Nama Karyawan', field: 'name', align: 'left' },
  { name: 'position', label: 'Jabatan & Kontak', field: 'position', align: 'left' },
  { name: 'role', label: 'Hak Akses', field: 'role', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Aksi', align: 'center' }
]

const userForm = reactive({
  name: '',
  email: '',
  password: '',
  role: 'staff',
  position: 'Teknisi Lapangan',
  phone: '+62 812-',
  status: 'active'
})

const filteredUsers = computed(() => {
  let list = users.value
  if (roleFilter.value !== 'all') {
    list = list.filter(u => u.role === roleFilter.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.position.toLowerCase().includes(q)
    )
  }
  return list
})

function roleBadge(role) {
  switch (role) {
    case 'admin': return { label: 'ADMINISTRATOR', color: 'purple-9' }
    case 'manager': return { label: 'MANAGER', color: 'navy-900' }
    case 'pm': return { label: 'PROJECT MANAGER', color: 'primary' }
    case 'finance': return { label: 'FINANCE', color: 'positive' }
    default: return { label: 'TEKNISI LAPANGAN', color: 'amber-8' }
  }
}

function openCreateDialog() {
  isEditing.value = false
  editingId.value = null
  userForm.name = ''
  userForm.email = ''
  userForm.password = 'tsc123'
  userForm.role = 'staff'
  userForm.position = 'Teknisi Lapangan'
  userForm.phone = '+62 812-'
  userForm.status = 'active'
  userDialog.value = true
}

function openEditDialog(u) {
  isEditing.value = true
  editingId.value = u.id
  userForm.name = u.name
  userForm.email = u.email
  userForm.password = ''
  userForm.role = u.role
  userForm.position = u.position
  userForm.phone = u.phone || ''
  userForm.status = u.status || 'active'
  userDialog.value = true
}

async function saveUser() {
  try {
    if (isEditing.value) {
      const patch = { ...userForm }
      if (!patch.password) delete patch.password
      const updated = await updateUser(editingId.value, patch)
      const idx = users.value.findIndex(u => u.id === editingId.value)
      if (idx !== -1) users.value[idx] = updated
      $q.notify({ type: 'positive', message: 'Data karyawan diperbarui' })
    } else {
      const created = await createUser({ ...userForm })
      users.value.push(created)
      $q.notify({ type: 'positive', message: 'Karyawan baru berhasil ditambahkan' })
    }
    userDialog.value = false
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal menyimpan data' })
  }
}

function confirmDelete(u) {
  $q.dialog({
    title: 'Hapus Karyawan',
    message: `Hapus akun ${u.name} (${u.email})?`,
    cancel: true
  }).onOk(async () => {
    await deleteUser(u.id)
    users.value = users.value.filter(usr => usr.id !== u.id)
    $q.notify({ type: 'positive', message: 'Karyawan berhasil dihapus' })
  })
}

onMounted(async () => {
  try {
    users.value = (await getUsers()) || []
  } finally {
    loading.value = false
  }
})
</script>
