<template>
  <q-card class="company-dash-card q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-subtitle1 text-weight-bold" style="color: #0f172a">
          Permintaan Material Proyek Ini
        </div>
        <div class="text-caption text-grey-6">
          Daftar pengajuan kebutuhan barang dan material untuk proyek ini
        </div>
      </div>
      <q-btn
        class="btn-gold"
        no-caps
        icon="add"
        label="Buat Pengajuan MR"
        to="/dashboard/material-requests"
      />
    </div>

    <q-table
      flat
      dense
      :rows="projectMRs"
      :columns="mrColumns"
      row-key="id"
      no-data-label="Belum ada permohonan material untuk proyek ini"
      class="company-dash-table"
    >
      <template #body-cell-code="props">
        <q-td :props="props" class="text-weight-bold text-primary">
          {{ props.row.code }}
        </q-td>
      </template>
      <template #body-cell-priority="props">
        <q-td :props="props">
          <q-chip
            dense
            size="sm"
            :color="props.row.priority === 'urgent' ? 'red-1' : 'grey-2'"
            :text-color="props.row.priority === 'urgent' ? 'red-9' : 'grey-8'"
          >
            {{ props.row.priority === 'urgent' ? 'URGENT' : 'Normal' }}
          </q-chip>
        </q-td>
      </template>
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-chip
            dense
            size="sm"
            :color="approvalStatusOf(props.row.status).color"
            text-color="white"
          >
            {{ approvalStatusOf(props.row.status).label }}
          </q-chip>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
defineProps({
  projectMRs: { type: Array, default: () => [] },
  mrColumns: { type: Array, required: true },
  approvalStatusOf: { type: Function, required: true },
});
</script>
