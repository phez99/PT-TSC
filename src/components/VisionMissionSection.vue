<template>
  <section class="company-section-slate q-py-xl">
    <div class="q-px-lg" style="max-width: 1000px; margin: 0 auto">
      <div class="text-center q-mb-xl">
        <span class="company-eyebrow">Visi & Misi</span>
        <h2 class="text-h4 text-white text-weight-bold q-mt-md">Visi dan Misi Perusahaan</h2>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- VISI -->
        <div class="col-12 col-md-6">
          <q-card
            class="company-card q-pa-lg"
            style="background: rgba(30, 41, 59, 0.5); border-color: #1e293b"
          >
            <div class="row items-center q-gutter-sm q-mb-md">
              <div class="company-icon-box-sm">
                <q-icon name="flag" size="16px" />
              </div>
              <div class="text-h6 text-white">Visi</div>
            </div>
            <p class="text-grey-4" style="line-height: 1.8">{{ vision }}</p>
          </q-card>
        </div>

        <!-- MISI -->
        <div class="col-12 col-md-6">
          <q-card
            class="company-card q-pa-lg"
            style="background: rgba(30, 41, 59, 0.5); border-color: #1e293b"
          >
            <div class="row items-center q-gutter-sm q-mb-md">
              <div class="company-icon-box-sm">
                <q-icon name="favorite" size="16px" />
              </div>
              <div class="text-h6 text-white">Misi</div>
            </div>
            <ul class="q-pl-md" style="line-height: 1.9">
              <li v-for="(m, i) in missions" :key="i" class="text-grey-4">{{ m }}</li>
            </ul>
          </q-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  vision: {
    type: String,
    default:
      'Menjadi perusahaan yang andal dan terpercaya dalam penyediaan solusi MEP dan Security System, serta mampu berkontribusi dalam mendukung perkembangan teknologi dan pembangunan berkelanjutan di Indonesia.',
  },
  missions: {
    type: Array,
    default: () => [
      'Menyediakan produk dan layanan berkualitas sesuai standar teknis dan keselamatan kerja',
      'Memberikan pelayanan yang profesional, responsif, dan bertanggung jawab',
      'Menjadi mitra kerja yang dapat diandalkan dalam setiap proyek',
      'Terus berinovasi dan meningkatkan kompetensi sumber daya manusia',
      'Menjalankan setiap pekerjaan dengan menjunjung tinggi kepatuhan terhadap peraturan, standar mutu, dan etika bisnis',
    ],
  },
});
</script>
