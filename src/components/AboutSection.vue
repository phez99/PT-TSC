<template>
  <section class="company-section-dark q-py-xl">
    <div class="q-px-lg" style="max-width: 900px; margin: 0 auto">
      <span class="company-eyebrow">Tentang Perusahaan</span>
      <h2 class="text-h4 text-white text-weight-bold q-mt-md q-mb-lg">
        {{ title }}
      </h2>

      <p v-for="(p, i) in paragraphs" :key="i" class="text-grey-4 q-mb-md" style="line-height: 1.8">
        {{ p }}
      </p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'PT. Trimitra Solusindo Cemerlang' },
  paragraphs: {
    type: Array,
    default: () => [
      'PT. Trimitra Solusindo Cemerlang merupakan perusahaan yang bergerak di bidang Security System, Mechanical, Electrical & Plumbing (MEP), Advertising, serta Pengadaan Material.',
      'Perusahaan ini berdiri pada tahun 2024 sebagai respon terhadap kebutuhan pasar yang terus berkembang di sektor tersebut. Kami hadir untuk memberikan solusi terintegrasi dengan mengedepankan profesionalisme, kualitas pekerjaan, dan kepuasan mitra.',
      'Kami berkomitmen untuk memberikan layanan terbaik dengan mengutamakan kualitas pekerjaan, keselamatan kerja, dan kepuasan mitra, serta mendukung berbagai proyek mulai dari gedung, komersial, hingga fasilitas industri.',
    ],
  },
});
</script>
