<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- Judul & Tombol Tambah -->
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
      <q-btn class="btn-gold" no-caps icon="add" label="Ajukan Material Baru" @click="openDialog" />
    </div>

    <!-- Metrik KPI -->
    <MaterialKpiCards
      :is-staff="isStaff"
      :total-count="baseRequests.length"
      :pending-count="pendingCount"
      :approved-count="approvedCount"
      :processed-count="processedCount"
    />

    <!-- Tabel & Tab Material Requests -->
    <MaterialTable
      :is-staff="isStaff"
      v-model:tab="tab"
      :all-count="requests.length"
      :pending-approval-count="allPendingCount"
      :my-count="myRequestsCount"
      :rows="rows"
      :columns="columns"
      v-model:search="search"
      v-model:status-filter="statusFilter"
      :status-options="statusOptions"
      :loading="loading"
      :project-name="projectName"
      :format-date="formatDate"
      :priority-label="priorityLabel"
      :approval-status-of="approvalStatusOf"
      @row-click="openDetail"
    />

    <!-- Dialog Ajukan Material -->
    <MaterialDialogForm
      v-model="dialog"
      :form="form"
      :project-options="projectOptions"
      :material-priorities="MATERIAL_PRIORITIES"
      :material-units="MATERIAL_UNITS"
      :user-name="user?.name"
      :saving="saving"
      @close="closeDialog"
      @save="save"
      @add-item="addItemRow"
      @remove-item="removeItemRow"
    />
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '/src/composables/useAuth.js';
import { getProjects } from '/src/services/projects.service.js';
import {
  getMaterialRequests,
  createMaterialRequest,
} from '/src/services/material-requests.service.js';
import { approvalStatusOf, APPROVAL_STATUSES } from '/src/config/approval.js';
import { MATERIAL_UNITS, MATERIAL_PRIORITIES, priorityLabel } from '/src/config/material.js';
import { formatDate } from '/src/config/projects.js';

// Import Komponen Terpisah
import MaterialKpiCards from '@/components/materials/MaterialKpiCards.vue';
import MaterialTable from '@/components/materials/MaterialTable.vue';
import MaterialDialogForm from '@/components/materials/MaterialDialogForm.vue';

const $q = useQuasar();
const router = useRouter();
const { user } = useAuth();

const requests = ref([]);
const projects = ref([]);
const loading = ref(false);
const statusFilter = ref('all');
const search = ref('');
const tab = ref('all');

const isStaff = computed(() => user.value?.role === 'staff');

const statusOptions = [{ value: 'all', label: 'Semua Status' }, ...APPROVAL_STATUSES];

const projectOptions = computed(() =>
  projects.value.map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` }))
);

const myId = computed(() => String(user.value?.id || user.value?._id || ''));

const isMine = (r) =>
  (r.requesterId && String(r.requesterId) === myId.value) ||
  (!r.requesterId && r.requesterName === user.value?.name);

const baseRequests = computed(() => {
  if (isStaff.value) {
    return requests.value.filter(isMine);
  }
  if (tab.value === 'mine') {
    return requests.value.filter(isMine);
  }
  if (tab.value === 'pending') {
    return requests.value.filter((r) => r.status === 'submitted');
  }
  return requests.value;
});

const pendingCount = computed(
  () => baseRequests.value.filter((r) => r.status === 'submitted').length
);
const allPendingCount = computed(
  () => requests.value.filter((r) => r.status === 'submitted').length
);
const approvedCount = computed(
  () => baseRequests.value.filter((r) => ['approved', 'processed'].includes(r.status)).length
);
const processedCount = computed(
  () => baseRequests.value.filter((r) => r.status === 'processed').length
);

const myRequestsCount = computed(() => requests.value.filter(isMine).length);

const rows = computed(() => {
  let list = baseRequests.value;
  if (statusFilter.value !== 'all') {
    list = list.filter((r) => r.status === statusFilter.value);
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter((r) => {
      const pName = projectName(r.projectId).toLowerCase();
      const hasItem = r.items?.some((it) => it.name.toLowerCase().includes(q));
      return (
        r.code.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        pName.includes(q) ||
        hasItem
      );
    });
  }
  return list;
});

const columns = computed(() => {
  const cols = [
    { name: 'code', label: 'Kode MR', field: 'code', align: 'left', sortable: true },
    { name: 'projectName', label: 'Proyek Terkait', field: 'projectId', align: 'left' },
  ];

  if (!isStaff.value) {
    cols.push({
      name: 'requesterName',
      label: 'Pemohon',
      field: 'requesterName',
      align: 'left',
    });
  }

  cols.push(
    { name: 'itemCount', label: 'Rincian Item', field: (r) => r.items.length, align: 'center' },
    { name: 'priority', label: 'Prioritas', field: 'priority', align: 'center' },
    { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
    { name: 'actions', label: 'Aksi', align: 'center' }
  );

  return cols;
});

function projectName(projectId) {
  const p = projects.value.find((p) => p.id === projectId);
  return p ? p.name : '-';
}

async function load() {
  loading.value = true;
  try {
    const [reqs, projs] = await Promise.all([getMaterialRequests(), getProjects()]);
    requests.value = reqs;
    projects.value = projs;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function openDetail(row) {
  router.push(`/dashboard/material-requests/${row.id}`);
}

const dialog = ref(false);
const saving = ref(false);

const emptyForm = () => ({
  projectId: null,
  neededDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  priority: 'normal',
  notes: '',
  items: [{ name: '', qty: 1, unit: 'pcs' }],
});
const form = reactive(emptyForm());

function openDialog() {
  Object.assign(form, emptyForm());
  form.projectId = projects.value[0]?.id || null;
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
}

function addItemRow() {
  form.items.push({ name: '', qty: 1, unit: 'pcs' });
}

function removeItemRow(i) {
  form.items.splice(i, 1);
}

async function save() {
  const validItems = form.items.filter((it) => it.name.trim() && it.qty > 0);
  if (!validItems.length) {
    $q.notify({
      type: 'negative',
      message: 'Isi minimal 1 material dengan jumlah lebih dari 0',
    });
    return;
  }

  saving.value = true;
  try {
    const created = await createMaterialRequest({ ...form, items: validItems }, user.value);
    $q.notify({
      type: 'positive',
      message: `Permintaan ${created.code} berhasil diajukan`,
    });
    closeDialog();
    await load();
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal mengajukan material',
    });
  } finally {
    saving.value = false;
  }
}
</script>
