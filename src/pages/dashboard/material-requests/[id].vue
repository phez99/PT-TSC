<template>
  <q-page class="q-pa-lg">
    <!-- Tombol Kembali -->
    <q-btn
      flat
      no-caps
      dense
      icon="arrow_back"
      label="Kembali ke daftar"
      class="q-mb-md"
      @click="router.push('/dashboard/material-requests')"
    />

    <!-- Indicator Loading -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="amber-8" size="40px" />
    </div>

    <!-- State Data Tidak Ditemukan -->
    <q-card v-else-if="!request" class="company-dash-card q-pa-xl text-center">
      <q-icon name="search_off" size="48px" color="grey-5" />
      <div class="text-h6 q-mt-md">Pengajuan tidak ditemukan</div>
    </q-card>

    <!-- State Akses Dibatasi (Akses Ditolak) -->
    <q-card v-else-if="unauthorized" class="company-dash-card q-pa-xl text-center">
      <q-icon name="lock" size="48px" color="negative" />
      <div class="text-h6 q-mt-md text-negative">Akses Dibatasi</div>
      <div class="text-grey-7 q-mt-xs">
        Sebagai staf teknisi, Anda hanya berwenang melihat detail permohonan material yang Anda
        ajukan sendiri.
      </div>
      <q-btn
        class="btn-gold q-mt-md"
        no-caps
        label="Kembali ke Permintaan Saya"
        @click="router.push('/dashboard/material-requests')"
      />
    </q-card>

    <!-- Konten Utama Detail -->
    <template v-else>
      <!-- Header Banner -->
      <MaterialHeader
        :code="request.code"
        :project-name="project?.name"
        :requester-name="request.requesterName"
        :requester-position="request.requesterPosition"
        :status="request.status"
        :approval-status-of="approvalStatusOf"
      />

      <div class="row q-col-gutter-lg">
        <!-- Kolom Kiri: Detail & Items -->
        <div class="col-12 col-md-7">
          <MaterialDetailInfo
            :request="request"
            :format-date="formatDate"
            :priority-label="priorityLabel"
          />
        </div>

        <!-- Kolom Kanan: Aksi & Riwayat Timeline -->
        <div class="col-12 col-md-5">
          <MaterialApprovalTimeline
            :actions="actions"
            :needs-note="needsNote"
            v-model:note="note"
            :submitting="submitting"
            :can-delete="canDelete"
            :history="request.history || []"
            :approval-actions-config="APPROVAL_ACTIONS"
            :approval-status-of="approvalStatusOf"
            :format-date-time="formatDateTime"
            @run-action="runAction"
            @delete-request="confirmDelete(request)"
          />
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '/src/composables/useAuth.js';
import { getProject } from '/src/services/projects.service.js';
import {
  getMaterialRequest,
  applyAction,
  deleteMaterialRequest,
} from '/src/services/material-requests.service.js';
import {
  approvalStatusOf,
  availableActions,
  APPROVAL_ACTIONS,
  formatDateTime,
} from '/src/config/approval.js';
import { priorityLabel } from '/src/config/material.js';
import { formatDate } from '/src/config/projects.js';

// Import Komponen Terpisah
import MaterialHeader from '@/components/materials/MaterialHeader.vue';
import MaterialDetailInfo from '@/components/materials/MaterialDetailInfo.vue';
import MaterialApprovalTimeline from '@/components/materials/MaterialApprovalTimeline.vue';

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const { user } = useAuth();

console.log('USER:', user.value);

const request = ref(null);
const project = ref(null);
const loading = ref(true);
const note = ref('');
const submitting = ref(null);

const isStaff = computed(() => user.value?.role === 'staff');
const unauthorized = computed(() => {
  if (!request.value || !user.value) return false;
  if (isStaff.value) {
    const isOwner =
      String(request.value.requesterId) === String(user.value.id || user.value._id) ||
      (!request.value.requesterId && request.value.requesterName === user.value.name);
    return !isOwner;
  }
  return false;
});
const actions = computed(() =>
  request.value && !unauthorized.value
    ? availableActions(request.value.status, user.value?.role)
    : []
);
const needsNote = computed(() => actions.value.some((a) => APPROVAL_ACTIONS[a].needsNote));

async function load() {
  loading.value = true;
  try {
    request.value = await getMaterialRequest(route.params.id);
    if (request.value) {
      project.value = await getProject(request.value.projectId);
    }
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function runAction(action) {
  if (APPROVAL_ACTIONS[action].needsNote && !note.value.trim()) {
    $q.notify({ type: 'negative', message: 'Catatan wajib diisi' });
    return;
  }

  submitting.value = action;
  try {
    request.value = await applyAction(request.value.id, action, user.value, note.value);
    note.value = '';
    $q.notify({
      type: 'positive',
      message: `Status diubah menjadi "${approvalStatusOf(request.value.status).label}"`,
    });
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memproses' });
  } finally {
    submitting.value = null;
  }
}
const canDelete = computed(
  () =>
    ['admin', 'manager', 'pm'].includes(user.value?.role) &&
    ['draft', 'submitted', 'rejected'].includes(request.value?.status)
);
async function confirmDelete(item) {
  // Pastikan data pengajuan tersedia
  if (!item || (!item.id && !item._id)) {
    $q.notify({
      type: 'negative',
      message: 'Data pengajuan tidak ditemukan atau ID tidak tersedia.',
    });
    return;
  }

  const requestId = item.id || item._id;
  const requestCode = item.code || requestId;

  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus permohonan material ${requestCode}?`,
    cancel: {
      flat: true,
      label: 'Batal',
    },
    ok: {
      color: 'negative',
      label: 'Hapus',
      unelevated: true,
    },
    persistent: true,
  }).onOk(async () => {
    try {
      $q.loading.show({
        message: 'Menghapus data...',
      });

      await deleteMaterialRequest(requestId);

      $q.notify({
        type: 'positive',
        message: `Permohonan ${requestCode} berhasil dihapus.`,
      });

      await router.push('/dashboard/material-requests');
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error?.message || 'Gagal menghapus permohonan material.',
      });
    } finally {
      $q.loading.hide();
    }
  });
}
</script>
