<template>
  <q-page class="q-pa-lg">
    <!-- Judul & Tombol Tambah -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">Manajemen Proyek</div>
        <div class="text-grey-7 text-body2">
          Kelola seluruh proyek konstruksi, MEP, dan security system perusahaan.
        </div>
      </div>
      <q-btn
        v-if="canManageProjects"
        class="btn-gold"
        no-caps
        icon="add"
        label="Tambah Proyek Baru"
        @click="dialog = true"
      />
    </div>

    <!-- Kartu KPI Proyek -->
    <ProjectKpiCards :kpi="kpi" />

    <!-- Tabel Proyek -->
    <ProjectTable
      :rows="filteredRows"
      :columns="columns"
      v-model:search="search"
      v-model:status-filter="statusFilter"
      v-model:archived-view="showArchived"
      :status-options="statusOptions"
      :loading="loading"
      :status-of="statusOf"
      :can-view-archive="canViewArchive"
      @row-click="openDetail"
      @archive="confirmArchive"
      @restore="confirmRestore"
    />

    <!-- Dialog Tambah Proyek -->
    <ProjectDialogForm
      v-model="dialog"
      :form="form"
      :project-categories="PROJECT_CATEGORIES"
      :project-statuses="PROJECT_STATUSES"
      :saving="saving"
      @close="closeDialog"
      @save="save"
    />
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '/src/composables/useAuth.js';
import {
  getProjects,
  createProject,
  archiveProject,
  restoreProject,
} from '/src/services/projects.service.js';
import {
  PROJECT_STATUSES,
  PROJECT_CATEGORIES,
  statusOf,
  categoryLabel,
} from '/src/config/projects.js';

// Import Komponen Terpisah
import ProjectKpiCards from '@/components/projects/ProjectKpiCards.vue';
import ProjectTable from '@/components/projects/ProjectTable.vue';
import ProjectDialogForm from '@/components/projects/ProjectDialogForm.vue';

const $q = useQuasar();
const router = useRouter();
const { hasRole } = useAuth();

const canManageProjects = computed(() => hasRole('admin', 'manager', 'pm'));
// Sama dengan hak akses backend: arsip & pulihkan hanya admin, melihat arsip admin dan manager
const canArchive = computed(() => hasRole('admin'));
const canViewArchive = computed(() => hasRole('admin', 'manager'));

// Proyek aktif. KPI selalu dihitung dari daftar ini, tidak ikut proyek terarsip.
const projects = ref([]);
const archivedProjects = ref([]);
const showArchived = ref(false);
const loading = ref(false);
const search = ref('');
const statusFilter = ref('all');

const statusOptions = [{ value: 'all', label: 'Semua status' }, ...PROJECT_STATUSES];

const tableRows = computed(() => (showArchived.value ? archivedProjects.value : projects.value));

const filteredRows = computed(() =>
  statusFilter.value === 'all'
    ? tableRows.value
    : tableRows.value.filter((p) => p.status === statusFilter.value)
);

const kpi = computed(() => {
  const count = (status) => projects.value.filter((p) => p.status === status).length;
  return {
    total: projects.value.length,
    ongoing: count('ongoing'),
    planning: count('planning'),
    done: count('done'),
  };
});

const baseColumns = [
  { name: 'code', label: 'Kode', field: 'code', align: 'left', sortable: true },
  { name: 'name', label: 'Nama Proyek', field: 'name', align: 'left', sortable: true },
  { name: 'client', label: 'Klien', field: 'client', align: 'left', sortable: true },
  {
    name: 'category',
    label: 'Kategori',
    field: 'category',
    align: 'left',
    format: (v) => categoryLabel(v),
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'left',
    sortable: true,
    format: (v) => statusOf(v).label,
  },
  { name: 'progress', label: 'Progres', field: 'progress', align: 'left', sortable: true },
];

// Kolom aksi (arsipkan / pulihkan) hanya untuk admin
const columns = computed(() =>
  canArchive.value
    ? [...baseColumns, { name: 'actions', label: '', field: 'actions', align: 'right' }]
    : baseColumns
);

async function load() {
  loading.value = true;
  try {
    projects.value = await getProjects();
    if (showArchived.value && canViewArchive.value) {
      archivedProjects.value = await getProjects({ archived: 'true' });
    }
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memuat daftar proyek' });
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// Daftar arsip dimuat saat tab Arsip dibuka
watch(showArchived, async (on) => {
  statusFilter.value = 'all';
  if (!on) return;
  loading.value = true;
  try {
    archivedProjects.value = await getProjects({ archived: 'true' });
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memuat proyek terarsip' });
  } finally {
    loading.value = false;
  }
});

function openDetail(row) {
  router.push(`/dashboard/projects/${row.id}`);
}

// ---------- Arsip & pulihkan ----------
function confirmArchive(row) {
  $q.dialog({
    title: 'Arsipkan Proyek',
    message: `Arsipkan ${row.code} - ${row.name}? Proyek disembunyikan dari daftar utama, sedangkan data material, lembur, invoice, dan dokumennya tetap tersimpan.`,
    prompt: { model: '', type: 'text', label: 'Alasan (opsional)', outlined: true, dense: true },
    cancel: { label: 'Batal', flat: true, noCaps: true },
    ok: { label: 'Arsipkan', color: 'negative', noCaps: true },
    persistent: true,
  }).onOk(async (reason) => {
    try {
      await archiveProject(row.id, String(reason || '').trim());
      $q.notify({ type: 'positive', message: `Proyek ${row.code} diarsipkan` });
      await load();
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message || 'Gagal mengarsipkan proyek' });
    }
  });
}

function confirmRestore(row) {
  $q.dialog({
    title: 'Pulihkan Proyek',
    message: `Pulihkan ${row.code} - ${row.name} ke daftar proyek aktif?`,
    cancel: { label: 'Batal', flat: true, noCaps: true },
    ok: { label: 'Pulihkan', color: 'primary', noCaps: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await restoreProject(row.id);
      $q.notify({ type: 'positive', message: `Proyek ${row.code} dipulihkan` });
      await load();
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message || 'Gagal memulihkan proyek' });
    }
  });
}

const dialog = ref(false);
const saving = ref(false);

const emptyForm = () => ({
  name: '',
  client: '',
  location: '',
  category: 'electronic',
  status: 'planning',
  startDate: '',
  endDate: '',
});
const form = reactive(emptyForm());

function closeDialog() {
  dialog.value = false;
  Object.assign(form, emptyForm());
}

async function save() {
  saving.value = true;
  try {
    const created = await createProject({ ...form });
    $q.notify({ type: 'positive', message: `Proyek ${created.code} ditambahkan` });
    closeDialog();
    await load();
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal menyimpan proyek' });
  } finally {
    saving.value = false;
  }
}
</script>
