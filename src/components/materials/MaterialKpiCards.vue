<template>
  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-6 col-md-3">
      <q-card class="company-dash-card q-pa-md">
        <div class="text-caption text-grey-7 text-weight-bold">
          {{ isStaff ? 'TOTAL PENGAJUAN SAYA' : 'TOTAL PERMINTAAN' }}
        </div>
        <div class="text-h4 text-weight-bold text-navy-950 q-my-xs">
          {{ totalCount }}
        </div>
        <div class="text-caption text-grey-6">
          {{ isStaff ? 'Kebutuhan Anda' : 'Dari Semua Personel' }}
        </div>
      </q-card>
    </div>

    <div class="col-6 col-md-3">
      <q-card
        class="company-dash-card q-pa-md"
        :style="pendingCount > 0 ? 'border: 1px solid #f59e0b;' : ''"
      >
        <div class="text-caption text-grey-7 text-weight-bold">MENUNGGU PERSETUJUAN</div>
        <div class="text-h4 text-weight-bold text-amber-8 q-my-xs">
          {{ pendingCount }}
        </div>
        <div class="text-caption text-amber-9 text-weight-medium">
          {{ isStaff ? 'Dalam Proses Review' : 'Memerlukan Approval' }}
        </div>
      </q-card>
    </div>

    <div class="col-6 col-md-3">
      <q-card class="company-dash-card q-pa-md">
        <div class="text-caption text-grey-7 text-weight-bold">DISETUJUI</div>
        <div class="text-h4 text-weight-bold text-positive q-my-xs">
          {{ approvedCount }}
        </div>
        <div class="text-caption text-positive text-weight-medium">Lolos Verifikasi</div>
      </q-card>
    </div>

    <div class="col-6 col-md-3">
      <q-card class="company-dash-card q-pa-md">
        <div class="text-caption text-grey-7 text-weight-bold">DIPROSES PENGADAAN</div>
        <div class="text-h4 text-weight-bold text-primary q-my-xs">
          {{ processedCount }}
        </div>
        <div class="text-caption text-grey-6">PO / Pembelian Suku Cadang</div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isStaff: { type: Boolean, default: false },
  totalCount: { type: Number, required: true },
  pendingCount: { type: Number, required: true },
  approvedCount: { type: Number, required: true },
  processedCount: { type: Number, required: true },
});
</script>
