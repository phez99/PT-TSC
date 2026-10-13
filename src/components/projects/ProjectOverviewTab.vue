<template>
  <div class="row q-col-gutter-lg">
    <!-- Kolom Kiri: Spesifikasi & Kontrol Status/Progres -->
    <div class="col-12 col-md-7">
      <!-- Spesifikasi & Informasi Proyek -->
      <q-card class="company-dash-card q-pa-lg q-mb-lg">
        <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
          Spesifikasi & Informasi Proyek
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="company-info-label">Kode Proyek</div>
            <div class="company-info-value font-mono text-weight-bold text-primary">
              {{ project.code }}
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="company-info-label">Nama Klien / Pemilik</div>
            <div class="company-info-value">{{ project.client }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="company-info-label">Kategori Pekerjaan</div>
            <div class="company-info-value">{{ categoryLabel(project.category) }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="company-info-label">Lokasi Lapangan</div>
            <div class="company-info-value">{{ project.location || '-' }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="company-info-label">Tanggal Mulai (Kickoff)</div>
            <div class="company-info-value">{{ formatDate(project.startDate) }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="company-info-label">Target Selesai (BAST)</div>
            <div class="company-info-value">{{ formatDate(project.endDate) }}</div>
          </div>
        </div>
      </q-card>

      <!-- Kontrol Status & Progres -->
      <q-card class="company-dash-card q-pa-lg">
        <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
          Kontrol Status & Progres Pekerjaan
        </div>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-6">
            <q-select
              :model-value="statusModel"
              @update:model-value="(val) => $emit('update:statusModel', val)"
              :options="projectStatuses"
              emit-value
              map-options
              outlined
              dense
              label="Status Proyek"
            />
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-caption text-grey-7">Status Saat Ini:</div>
            <q-badge
              :color="statusOf(statusModel).color"
              :label="statusOf(statusModel).label"
              class="q-pa-xs q-px-sm text-weight-bold"
            />
          </div>
        </div>

        <div class="row items-center justify-between q-mt-md">
          <div class="company-info-label">Progres Fisik Lapangan</div>
          <div class="text-h6 text-weight-bold text-amber-8">{{ progressModel }}%</div>
        </div>
        <q-slider
          :model-value="progressModel"
          @update:model-value="(val) => $emit('update:progressModel', val)"
          @change="(val) => $emit('save-progress', val)"
          :min="0"
          :max="100"
          :step="5"
          color="amber-8"
          label
        />
        <div class="text-caption text-grey-6">
          Geser slider untuk memperbarui persentase penyelesaian fisik pekerjaan secara berkala.
        </div>
      </q-card>
    </div>

    <!-- Kolom Kanan: Ringkasan & K3 -->
    <div class="col-12 col-md-5">
      <q-card class="company-dash-card q-pa-lg q-mb-lg">
        <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
          Ringkasan Kebutuhan & Dokumen
        </div>
        <div class="q-gutter-y-sm">
          <div class="row items-center justify-between q-pa-sm bg-grey-1 rounded-borders">
            <div class="row items-center q-gutter-xs">
              <q-icon name="inventory_2" color="amber-9" size="18px" />
              <span class="text-body2">Permintaan Material (MR)</span>
            </div>
            <span class="text-weight-bold">{{ projectMRs.length }} pengajuan</span>
          </div>
          <div class="row items-center justify-between q-pa-sm bg-grey-1 rounded-borders">
            <div class="row items-center q-gutter-xs">
              <q-icon name="verified" color="primary" size="18px" />
              <span class="text-body2">Dokumen & BAST</span>
            </div>
            <span class="text-weight-bold">{{ projectDocs.length }} berkas</span>
          </div>
          <div class="row items-center justify-between q-pa-sm bg-grey-1 rounded-borders">
            <div class="row items-center q-gutter-xs">
              <q-icon name="receipt_long" color="positive" size="18px" />
              <span class="text-body2">Faktur / Invoice</span>
            </div>
            <span class="text-weight-bold">{{ projectInvoices.length }} faktur</span>
          </div>
        </div>
      </q-card>

      <!-- Panduan K3 / HSE Proyek -->
      <q-card class="company-dash-card q-pa-lg">
        <div class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="health_and_safety" color="positive" size="20px" />
          <span class="text-subtitle2 text-weight-bold">Standar Keselamatan (K3/HSE)</span>
        </div>
        <p class="text-caption text-grey-7 q-mb-none" style="line-height: 1.6">
          Seluruh tim teknisi wajib mengenakan Alat Pelindung Diri (APD) standar: Helm keselamatan,
          rompi reflektor, sepatu safety, dan harness saat bekerja di ketinggian.
        </p>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  project: { type: Object, required: true },
  progressModel: { type: Number, required: true },
  statusModel: { type: String, required: true },
  projectStatuses: { type: Array, required: true },
  projectMRs: { type: Array, default: () => [] },
  projectDocs: { type: Array, default: () => [] },
  projectInvoices: { type: Array, default: () => [] },
  statusOf: { type: Function, required: true },
  categoryLabel: { type: Function, required: true },
  formatDate: { type: Function, required: true },
});

defineEmits(['update:statusModel', 'update:progressModel', 'save-progress']);
</script>
