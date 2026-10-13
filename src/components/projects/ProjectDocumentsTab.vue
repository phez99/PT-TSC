<template>
  <q-card class="company-dash-card q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-subtitle1 text-weight-bold" style="color: #0f172a">
          Dokumen Teknis & BAST Proyek
        </div>
        <div class="text-caption text-grey-6">
          Berita Acara Serah Terima, Gambar As-Built, dan dokumen legal
        </div>
      </div>
      <q-btn
        class="btn-gold"
        no-caps
        icon="verified"
        label="Buka Manajemen Dokumen & BAST"
        to="/dashboard/documents"
      />
    </div>

    <q-list v-if="projectDocs.length" separator>
      <q-item v-for="doc in projectDocs" :key="doc.id" class="q-py-md">
        <q-item-section avatar>
          <q-avatar
            :color="doc.category === 'bast' ? 'green-1' : 'blue-1'"
            :text-color="doc.category === 'bast' ? 'green-8' : 'primary'"
            icon="description"
          />
        </q-item-section>
        <q-item-section>
          <div class="row items-center q-gutter-xs">
            <span class="text-caption text-weight-bold text-primary">{{ doc.docNumber }}</span>
            <q-badge
              dense
              :color="doc.status === 'signed' ? 'positive' : 'grey-7'"
              :label="doc.status === 'signed' ? 'Ditandatangani' : 'Draft'"
            />
          </div>
          <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ doc.title }}</div>
          <div class="text-caption text-grey-6">{{ doc.description }}</div>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            icon="visibility"
            label="Lihat"
            to="/dashboard/documents"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <div v-else class="text-center q-py-xl text-grey-6">
      <q-icon name="folder_open" size="48px" color="grey-4" class="q-mb-xs" />
      <div>Belum ada dokumen BAST atau gambar teknis untuk proyek ini.</div>
      <q-btn
        flat
        color="primary"
        no-caps
        label="Buat Dokumen Sekarang →"
        to="/dashboard/documents"
        class="q-mt-sm"
      />
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  projectDocs: { type: Array, default: () => [] },
});
</script>
