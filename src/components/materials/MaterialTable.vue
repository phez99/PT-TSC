<template>
  <div>
    <!-- Tabs Khusus Admin & Management -->
    <q-card v-if="!isStaff" class="company-dash-card q-mb-md">
      <q-tabs
        :model-value="tab"
        @update:model-value="(val) => $emit('update:tab', val)"
        dense
        align="left"
        active-color="amber-8"
        indicator-color="amber-8"
        class="text-grey-7"
      >
        <q-tab name="all" :label="`Semua Permintaan (${allCount})`" no-caps />
        <q-tab name="pending" :label="`Menunggu Approval (${pendingApprovalCount})`" no-caps />
        <q-tab name="mine" :label="`Pengajuan Saya Pribadi (${myCount})`" no-caps />
      </q-tabs>
    </q-card>

    <!-- Tabel Material Requests -->
    <q-card class="company-dash-card">
      <q-table
        class="company-dash-table"
        flat
        row-key="id"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada pengajuan material"
        @row-click="(evt, row) => $emit('row-click', row)"
      >
        <template #top>
          <q-input
            :model-value="search"
            @update:model-value="(val) => $emit('update:search', val)"
            dense
            outlined
            debounce="200"
            placeholder="Cari kode MR, nama proyek, material..."
            style="width: 280px"
          >
            <template #prepend><q-icon name="search" /></template>
            <template #append v-if="search">
              <q-icon name="clear" class="cursor-pointer" @click="$emit('update:search', '')" />
            </template>
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
            label="Filter Status"
            style="min-width: 200px"
          />
        </template>

        <template #body-cell-code="props">
          <q-td :props="props" class="font-mono text-weight-bold text-primary">
            {{ props.row.code }}
          </q-td>
        </template>

        <template #body-cell-projectName="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ projectName(props.row.projectId) }}</div>
            <div class="text-caption text-grey-6">
              Dibutuhkan: {{ formatDate(props.row.neededDate) }}
            </div>
          </q-td>
        </template>

        <template #body-cell-requesterName="props">
          <q-td :props="props">
            <div class="text-weight-medium">{{ props.row.requesterName }}</div>
            <div class="text-caption text-grey-6">{{ props.row.requesterPosition }}</div>
          </q-td>
        </template>

        <template #body-cell-priority="props">
          <q-td :props="props" class="text-center">
            <q-badge
              v-if="props.row.priority === 'urgent'"
              color="red-5"
              class="text-weight-bold"
              :label="priorityLabel(props.row.priority)"
            />
            <span v-else class="text-grey-7">{{ priorityLabel(props.row.priority) }}</span>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              size="sm"
              :color="approvalStatusOf(props.row.status).color"
              text-color="white"
              class="text-weight-bold"
            >
              {{ approvalStatusOf(props.row.status).label }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-itemCount="props">
          <q-td :props="props" class="text-center">
            <q-badge color="blue-1" text-color="primary" class="text-weight-bold">
              {{ props.row.items.length }} Item
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="primary"
              icon="visibility"
              label="Detail"
              @click.stop="$emit('row-click', props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup>
defineProps({
  isStaff: { type: Boolean, default: false },
  tab: { type: String, default: 'all' },
  allCount: { type: Number, required: true },
  pendingApprovalCount: { type: Number, required: true },
  myCount: { type: Number, required: true },
  rows: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  search: { type: String, default: '' },
  statusFilter: { type: String, default: 'all' },
  statusOptions: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  projectName: { type: Function, required: true },
  formatDate: { type: Function, required: true },
  priorityLabel: { type: Function, required: true },
  approvalStatusOf: { type: Function, required: true },
});

defineEmits(['update:tab', 'update:search', 'update:statusFilter', 'row-click']);
</script>
