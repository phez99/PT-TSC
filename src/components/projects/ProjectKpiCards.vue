<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-6 col-md-3">
      <q-card class="company-dash-card q-pa-md">
        <div class="text-caption text-grey-7">TOTAL PROYEK</div>
        <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">{{ kpi.total }}</div>
        <div class="text-caption text-grey-6">Seluruh Proyek Terdaftar</div>
      </q-card>
    </div>
    <div class="col-6 col-md-3">
      <q-card class="company-dash-card q-pa-md">
        <div class="text-caption text-grey-7">SEDANG BERJALAN</div>
        <div class="text-h4 text-weight-bold text-primary q-my-xs">{{ kpi.ongoing }}</div>
        <div class="text-caption text-grey-6">Aktif di Lapangan</div>
      </q-card>
    </div>
    <div class="col-6 col-md-3">
      <q-card class="company-dash-card q-pa-md">
        <div class="text-caption text-grey-7">TAHAP PERENCANAAN</div>
        <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">{{ kpi.planning }}</div>
        <div class="text-caption text-grey-6">Desain & Persiapan</div>
      </q-card>
    </div>
    <div class="col-6 col-md-3">
      <q-card class="company-dash-card q-pa-md">
        <div class="text-caption text-grey-7">SELESAI (BAST)</div>
        <div class="text-h4 text-weight-bold text-positive q-my-xs">{{ kpi.done }}</div>
        <div class="text-caption text-grey-6">Telah Serah Terima</div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  kpi: { type: Object, required: true },
});
</script>
