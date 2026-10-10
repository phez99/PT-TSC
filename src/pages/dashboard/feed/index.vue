<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER HALAMAN ================= -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="row items-center q-gutter-x-xs q-mb-xs">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            color="navy-900"
            to="/dashboard"
            class="q-mr-xs lt-md"
          >
            <q-tooltip>Kembali ke Dashboard</q-tooltip>
          </q-btn>
          <q-badge color="amber-8" text-color="dark" class="text-weight-bold">
            INTERNAL COMMUNITY &amp; BULLETIN
          </q-badge>
        </div>
        <h1 class="text-h5 text-weight-bold q-my-none text-navy-950 row items-center">
          <q-icon name="campaign" color="amber-9" size="28px" class="q-mr-sm" />
          <span>Papan Informasi &amp; Diskusi Lapangan</span>
        </h1>
        <p class="text-grey-7 text-body2 q-mt-xs q-mb-none" style="max-width: 680px">
          Media komunikasi internal resmi PT. Trimitra Solusindo Cemerlang untuk pengumuman manajemen, briefing K3 keselamatan kerja, milestone serah terima, dan ruang diskusi teknis tim.
        </p>
      </div>

      <div class="row items-center q-gutter-sm q-mt-sm q-mt-md-none">
        <q-btn
          outline
          color="primary"
          no-caps
          icon="dashboard"
          label="Ke Ringkasan"
          to="/dashboard"
        />
      </div>
    </div>

    <!-- ================= KOMPONEN UTAMA FEED WALL ================= -->
    <div style="max-width: 860px; margin: 0 auto;">
      <CompanyFeedWall />
    </div>
  </q-page>
</template>

<script setup>
import CompanyFeedWall from '/src/components/feed/CompanyFeedWall.vue'
</script>
