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
      :status-options="statusOptions"
      :loading="loading"
      :status-of="statusOf"
      @row-click="openDetail"
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '/src/composables/useAuth.js';
import { getProjects, createProject } from '/src/services/projects.service.js';
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

const projects = ref([]);
const loading = ref(false);
const search = ref('');
const statusFilter = ref('all');

const statusOptions = [{ value: 'all', label: 'Semua status' }, ...PROJECT_STATUSES];

const filteredRows = computed(() =>
  statusFilter.value === 'all'
    ? projects.value
    : projects.value.filter((p) => p.status === statusFilter.value)
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

const columns = [
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

async function load() {
  loading.value = true;
  try {
    projects.value = await getProjects();
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memuat daftar proyek' });
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openDetail(row) {
  router.push(`/dashboard/projects/${row.id}`);
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
