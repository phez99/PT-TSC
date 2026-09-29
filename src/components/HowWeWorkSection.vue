<template>
  <section class="company-section-dark q-py-xl">
    <div class="q-px-lg" style="max-width: 800px; margin: 0 auto">
      <div class="text-center q-mb-xl">
        <span class="company-eyebrow">Proses Kerja</span>
        <h2 class="text-h4 text-white text-weight-bold q-mt-md">Cara Kami Bekerja</h2>
      </div>

      <template v-for="(step, i) in steps" :key="step.title">
        <div class="company-process-step">
          <div class="company-process-step-number">{{ i + 1 }}</div>
          <div class="text-white text-weight-bold q-mb-xs">{{ step.title }}</div>
          <div class="text-grey-5 text-body2" style="line-height: 1.7">{{ step.description }}</div>
        </div>

        <div class="company-process-arrow" v-if="i < steps.length - 1">
          <q-icon name="arrow_downward" />
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
defineProps({
  steps: {
    type: Array,
    default: () => [
      {
        title: 'Diskusi Awal & Penentuan Lingkup Pekerjaan',
        description:
          'Kami memulai dengan diskusi awal untuk memahami kebutuhan proyek, ruang lingkup pekerjaan, jadwal, serta ekspektasi klien.',
      },
      {
        title: 'Survey Lokasi & Kajian Teknis',
        description:
          'Tim kami melakukan survey lokasi dan evaluasi teknis untuk memastikan perencanaan yang akurat, identifikasi risiko, serta kesesuaian dengan standar yang berlaku.',
      },
      {
        title: 'Perencanaan, Desain & Penawaran',
        description:
          'Kami menyusun perencanaan teknis, desain, metode kerja, jadwal pelaksanaan, serta estimasi biaya sesuai spesifikasi proyek dan ketentuan keselamatan kerja.',
      },
      {
        title: 'Persetujuan & Kontrak Kerja',
        description:
          'Setelah tercapai kesepakatan, proyek dilaksanakan berdasarkan kontrak kerja yang mencakup ruang lingkup pekerjaan, waktu pelaksanaan, dan persyaratan K3/HSE.',
      },
      {
        title: 'Pelaksanaan & Pengendalian Mutu',
        description:
          'Pekerjaan dilaksanakan oleh tenaga profesional dengan pengawasan ketat, pengendalian mutu, serta penerapan standar keselamatan dan prosedur kerja.',
      },
      {
        title: 'Pengujian, Commissioning & Serah Terima',
        description:
          'Seluruh sistem diuji dan dikomisioning untuk memastikan fungsi berjalan optimal sebelum dilakukan serah terima kepada klien.',
      },
      {
        title: 'Layanan Purna Jual & Pemeliharaan',
        description:
          'Kami menyediakan dukungan purna jual, layanan pemeliharaan, dan bantuan teknis untuk menjamin keandalan sistem jangka panjang.',
      },
    ],
  },
});
</script>
