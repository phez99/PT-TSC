<template>
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
      @row-click="(evt, row) => $emit('row-click', row)"
    >
      <template #top>
        <q-input
          :model-value="search"
          @update:model-value="(val) => $emit('update:search', val)"
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
          :model-value="statusFilter"
          @update:model-value="(val) => $emit('update:statusFilter', val)"
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
              :value="(props.row.progress || 0) / 100"
              color="amber-8"
              track-color="grey-3"
              rounded
              size="8px"
              style="flex: 1"
            />
            <span class="text-caption text-grey-8">{{ props.row.progress || 0 }}%</span>
          </div>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  search: { type: String, default: '' },
  statusFilter: { type: String, default: 'all' },
  statusOptions: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  statusOf: { type: Function, required: true },
});

defineEmits(['update:search', 'update:statusFilter', 'row-click']);
</script>
