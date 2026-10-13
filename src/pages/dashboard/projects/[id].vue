<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= TOMBOL KEMBALI & AKSI CEPAT ================= -->
    <div class="row items-center justify-between q-mb-md">
      <q-btn
        flat
        no-caps
        dense
        icon="arrow_back"
        label="Kembali ke Daftar Proyek"
        class="text-grey-8"
        @click="router.push('/dashboard/projects')"
      />
      <div v-if="project" class="row q-gutter-xs">
        <q-btn
          outline
          no-caps
          color="primary"
          icon="inventory_2"
          label="Ajukan Material"
          to="/dashboard/material-requests"
        />
        <q-btn
          outline
          no-caps
          color="amber-9"
          icon="receipt_long"
          label="Buat Invoice"
          to="/dashboard/invoices"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="amber-8" size="44px" />
      <div class="text-caption text-grey-6 q-mt-sm">Memuat data proyek...</div>
    </div>

    <!-- Tidak Ditemukan -->
    <q-card v-else-if="!project" class="company-dash-card q-pa-xl text-center">
      <q-icon name="search_off" size="56px" color="grey-5" />
      <div class="text-h6 q-mt-md">Proyek tidak ditemukan</div>
      <div class="text-grey-7">Proyek ini mungkin sudah dihapus atau tautan tidak valid.</div>
      <q-btn
        class="btn-gold q-mt-md"
        no-caps
        label="Kembali ke Daftar Proyek"
        @click="router.push('/dashboard/projects')"
      />
    </q-card>

    <!-- Konten Detail Proyek -->
    <template v-else>
      <!-- 1. Header Banner Menggunakan Komponen Terpisah -->
      <ProjectHeader
        :project="project"
        :progress="progressModel"
        :status-of="statusOf"
        :category-label="categoryLabel"
        :format-date="formatDate"
      />

      <!-- Tabs Navigasi -->
      <q-card class="company-dash-card q-mb-md">
        <q-tabs
          v-model="tab"
          dense
          align="left"
          active-color="amber-8"
          indicator-color="amber-8"
          class="text-grey-7"
        >
          <q-tab name="overview" icon="dashboard" label="Ikhtisar & Progres" no-caps />
          <q-tab
            name="team"
            icon="group"
            :label="`Tim Proyek (${project.members?.length || 0})`"
            no-caps
          />
          <q-tab
            name="materials"
            icon="inventory_2"
            :label="`Material Request (${projectMRs.length})`"
            no-caps
          />
          <q-tab
            name="docs"
            icon="verified"
            :label="`Dokumen & BAST (${projectDocs.length})`"
            no-caps
          />
          <q-tab
            name="invoices"
            icon="receipt_long"
            :label="`Invoice & Termin (${projectInvoices.length})`"
            no-caps
          />
        </q-tabs>
      </q-card>

      <!-- Tab Panels -->
      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <!-- ================= TAB 1: IKHTISAR & PROGRES ================= -->
        <q-tab-panel name="overview" class="q-pa-none">
          <ProjectOverviewTab
            :project="project"
            v-model:progress-model="progressModel"
            v-model:status-model="statusModel"
            :project-statuses="PROJECT_STATUSES"
            :project-m-rs="projectMRs"
            :project-docs="projectDocs"
            :project-invoices="projectInvoices"
            :status-of="statusOf"
            :category-label="categoryLabel"
            :format-date="formatDate"
            @update:status-model="saveStatus"
            @save-progress="saveProgress"
          />
        </q-tab-panel>

        <!-- ================= TAB 2: TIM PROYEK (Menggunakan Komponen Terpisah) ================= -->
        <q-tab-panel name="team" class="q-pa-none">
          <ProjectTeamTab
            :members="project.members"
            :technician-options="technicianOptions"
            v-model:selected-employee="selectedEmployee"
            v-model:new-member-role="newMember.role"
            @remove="removeMemberById"
            @add="addNewMember"
          />
        </q-tab-panel>

        <!-- ================= TAB 3: MATERIAL REQUESTS ================= -->
        <q-tab-panel name="materials" class="q-pa-none">
          <ProjectMaterialsTab
            :project-m-rs="projectMRs"
            :mr-columns="mrColumns"
            :approval-status-of="approvalStatusOf"
          />
        </q-tab-panel>

        <!-- ================= TAB 4: DOKUMEN & BAST ================= -->
        <q-tab-panel name="docs" class="q-pa-none">
          <ProjectDocumentsTab :project-docs="projectDocs" />
        </q-tab-panel>

        <!-- ================= TAB 5: INVOICES & TERMIN ================= -->
        <q-tab-panel name="invoices" class="q-pa-none">
          <ProjectInvoicesTab :project-invoices="projectInvoices" :format-date="formatDate" />
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

// Import Komponen Terpisah
import ProjectHeader from '@/components/projects/ProjectHeader.vue';
import ProjectTeamTab from '@/components/projects/ProjectTeamTab.vue';
import ProjectOverviewTab from '@/components/projects/ProjectOverviewTab.vue';
import ProjectMaterialsTab from '@/components/projects/ProjectMaterialsTab.vue';
import ProjectDocumentsTab from '@/components/projects/ProjectDocumentsTab.vue';
import ProjectInvoicesTab from '@/components/projects/ProjectInvoicesTab.vue';

// Import Services & Config
import {
  getProject,
  updateProject,
  addMember,
  removeMember,
} from '/src/services/projects.service.js';
import { getMaterialRequests } from '/src/services/material-requests.service.js';
import { getDocuments } from '/src/services/documents.service.js';
import { getInvoices } from '/src/services/invoices.service.js';
import { approvalStatusOf } from '/src/config/approval.js';
import { getUsers } from '/src/services/auth.service.js';
import { PROJECT_STATUSES, statusOf, categoryLabel, formatDate } from '/src/config/projects.js';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const tab = ref('overview');
const project = ref(null);
const loading = ref(true);
const statusModel = ref('');
const progressModel = ref(0);

const allMRs = ref([]);
const allDocs = ref([]);
const allInvoices = ref([]);
const allUsers = ref([]);
const selectedEmployee = ref(null);

const projectMRs = computed(() => {
  if (!project.value) return [];
  return allMRs.value.filter((mr) => mr.projectId === project.value.id);
});

const projectDocs = computed(() => {
  if (!project.value) return [];
  return allDocs.value.filter((d) => d.projectId === project.value.id);
});

const projectInvoices = computed(() => {
  if (!project.value) return [];
  return allInvoices.value.filter((inv) => inv.projectId === project.value.id);
});

const mrColumns = [
  { name: 'code', label: 'Kode MR', field: 'code', align: 'left' },
  { name: 'requester', label: 'Pengaju', field: 'requesterName', align: 'left' },
  { name: 'neededDate', label: 'Tgl Dibutuhkan', field: 'neededDate', align: 'left' },
  { name: 'priority', label: 'Prioritas', field: 'priority', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
];

function applyProject(p) {
  project.value = p;
  statusModel.value = p?.status ?? '';
  progressModel.value = p?.progress ?? 0;
}

onMounted(async () => {
  try {
    const [pData, mrData, docData, invData, userData] = await Promise.all([
      getProject(route.params.id),
      getMaterialRequests(),
      getDocuments(),
      getInvoices(),
      getUsers().catch(() => []),
    ]);
    applyProject(pData);
    allMRs.value = mrData || [];
    allDocs.value = docData || [];
    allInvoices.value = invData || [];
    allUsers.value = userData || [];
  } finally {
    loading.value = false;
  }
});

// Opsi daftar karyawan untuk dropdown tim
const technicianOptions = computed(() => {
  return allUsers.value.map((u) => ({
    label: u.name || u.nama,
    value: u.name || u.nama,
    role: u.role === 'staff' ? 'Teknisi Lapangan' : u.position || 'Teknisi Lapangan',
  }));
});

function onEmployeeSelected(selectedUser) {
  if (selectedUser) {
    newMember.name = selectedUser.label || selectedUser;
    if (selectedUser.role) {
      newMember.role = selectedUser.role;
    }
  }
}

async function patch(data, successMessage) {
  try {
    applyProject(await updateProject(project.value.id, data));
    $q.notify({ type: 'positive', message: successMessage });
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal menyimpan' });
  }
}

const saveStatus = (value) => patch({ status: value }, 'Status diperbarui');
const saveProgress = (value) => patch({ progress: value }, 'Progres diperbarui');

// ---------- Anggota tim ----------
const newMember = reactive({ name: '', role: '' });

async function addNewMember() {
  try {
    applyProject(
      await addMember(project.value.id, {
        name: newMember.name,
        role: newMember.role,
      })
    );
    newMember.name = '';
    newMember.role = '';
    selectedEmployee.value = null;
    $q.notify({ type: 'positive', message: 'Anggota berhasil ditambahkan ke tim proyek' });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal menambah anggota',
    });
  }
}

async function removeMemberById(memberId) {
  try {
    applyProject(await removeMember(project.value.id, memberId));
    $q.notify({ type: 'positive', message: 'Anggota dihapus dari tim' });
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal menghapus anggota',
    });
  }
}
</script>
