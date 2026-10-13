<template>
  <q-card
    class="q-pa-lg q-mb-lg text-white"
    style="
      background: linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e293b 100%);
      border-radius: 16px;
      border: 1px solid #334155;
    "
  >
    <div class="row items-start justify-between q-col-gutter-md">
      <div class="col-12 col-md-8">
        <div class="row items-center q-gutter-xs q-mb-xs">
          <span class="company-badge q-px-sm q-py-xs" style="font-size: 0.72rem">
            {{ project.code }}
          </span>
          <q-badge
            :color="statusOf(project.status).color"
            :label="statusOf(project.status).label"
            class="q-px-sm text-weight-bold"
          />
          <q-badge
            v-if="project.isArchived"
            color="grey-8"
            label="Terarsip"
            class="q-px-sm text-weight-bold"
          >
            <q-tooltip v-if="project.archiveReason">{{ project.archiveReason }}</q-tooltip>
          </q-badge>
          <span class="text-caption text-grey-4 q-ml-sm">
            {{ categoryLabel(project.category) }}
          </span>
        </div>
        <h1 class="text-h4 text-weight-bold text-white q-my-xs" style="line-height: 1.25">
          {{ project.name }}
        </h1>
        <div class="row items-center q-gutter-md text-grey-3 text-body2 q-mt-xs">
          <div>
            <q-icon name="business" size="16px" class="q-mr-xs text-amber-5" />
            Klien: <strong>{{ project.client }}</strong>
          </div>
          <div>
            <q-icon name="place" size="16px" class="q-mr-xs text-amber-5" />
            Lokasi: <strong>{{ project.location || 'Indonesia' }}</strong>
          </div>
          <div>
            <q-icon name="date_range" size="16px" class="q-mr-xs text-amber-5" />
            Jadwal: {{ formatDate(project.startDate) }} &ndash; {{ formatDate(project.endDate) }}
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4 text-left text-md-right">
        <div class="text-caption text-grey-4">Progres Fisik Lapangan</div>
        <div class="text-h3 text-weight-bold text-amber-5 q-my-none">{{ progress }}%</div>
        <q-linear-progress
          :value="progress / 100"
          color="amber-5"
          track-color="blue-grey-8"
          style="height: 8px; border-radius: 4px"
          class="q-mt-xs"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  project: { type: Object, required: true },
  progress: { type: Number, required: true },
  statusOf: { type: Function, required: true },
  categoryLabel: { type: Function, required: true },
  formatDate: { type: Function, required: true },
});
</script>
