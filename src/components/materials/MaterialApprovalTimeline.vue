<template>
  <div>
    <!-- Panel Aksi Persetujuan -->
    <q-card v-if="actions.length || canDelete" class="company-dash-card q-pa-lg q-mb-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md">Aksi</div>

      <q-input
        v-if="needsNote"
        :model-value="note"
        @update:model-value="(val) => $emit('update:note', val)"
        type="textarea"
        autogrow
        outlined
        dense
        label="Catatan (wajib untuk penolakan)"
        class="q-mb-md"
      />

      <div class="q-gutter-sm">
        <q-btn
          v-for="a in actions"
          :key="a"
          :color="approvalActionsConfig[a].color"
          :icon="approvalActionsConfig[a].icon"
          no-caps
          unelevated
          class="full-width"
          :label="approvalActionsConfig[a].label"
          :loading="submitting === a"
          @click="$emit('run-action', a)"
        />

        <!-- Tombol Hapus Pengajuan untuk Admin / Manajer -->
        <q-btn
          v-if="canDelete"
          color="negative"
          icon="delete"
          label="Hapus Pengajuan"
          no-caps
          unelevated
          class="full-width q-mt-sm"
          @click="$emit('delete-request')"
        />
      </div>
    </q-card>

    <!-- Timeline Riwayat Status -->
    <q-card class="company-dash-card q-pa-lg">
      <div class="text-subtitle1 text-weight-bold q-mb-md">Riwayat</div>
      <q-timeline color="amber-8">
        <q-timeline-entry
          v-for="(h, i) in reversedHistory"
          :key="i"
          :title="approvalStatusOf(h.status).label"
          :subtitle="`${h.by} • ${formatDateTime(h.at)}`"
        >
          <div v-if="h.note" class="text-body2 text-grey-8">
            {{ h.note }}
          </div>
        </q-timeline-entry>
      </q-timeline>
    </q-card>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  actions: { type: Array, default: () => [] },
  needsNote: { type: Boolean, default: false },
  note: { type: String, default: '' },
  submitting: { type: String, default: null },
  history: { type: Array, default: () => [] },
  approvalActionsConfig: { type: Object, required: true },
  approvalStatusOf: { type: Function, required: true },
  formatDateTime: { type: Function, required: true },
  canDelete: { type: Boolean, default: true }, // Mengatur visibilitas tombol hapus jika diperlukan
});

defineEmits(['update:note', 'run-action', 'delete-request']);

const reversedHistory = computed(() => [...props.history].reverse());
</script>
