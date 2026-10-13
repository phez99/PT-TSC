<template>
  <div class="row items-start justify-between q-mb-md">
    <div>
      <div class="text-caption text-grey-7">{{ code }}</div>
      <div class="text-h5 text-weight-bold" style="color: #0f172a">
        {{ projectName }}
      </div>
      <div class="text-grey-7 text-body2">
        Diajukan oleh {{ requesterName }}
        <span v-if="requesterPosition">— {{ requesterPosition }}</span>
      </div>
    </div>
    <q-badge :color="statusInfo.color" :label="statusInfo.label" class="q-pa-sm" />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  code: { type: String, required: true },
  projectName: { type: String, default: 'Proyek tidak ditemukan' },
  requesterName: { type: String, required: true },
  requesterPosition: { type: String, default: '' },
  status: { type: String, required: true },
  approvalStatusOf: { type: Function, required: true },
});

const statusInfo = computed(() => props.approvalStatusOf(props.status));
</script>
