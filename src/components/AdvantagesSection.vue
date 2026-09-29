<template>
  <section class="company-section-dark q-py-xl">
    <div class="q-px-lg" style="max-width: 1280px; margin: 0 auto">
      <div class="row q-col-gutter-xl items-center">
        <div class="col-12 col-md-5">
          <img
            :src="image"
            :alt="imageAlt"
            style="width: 100%; height: 420px; object-fit: cover; border-radius: 16px"
          />
        </div>

        <div class="col-12 col-md-7">
          <span class="company-eyebrow">Keunggulan</span>
          <h2 class="text-h4 text-white text-weight-bold q-mt-md q-mb-lg">Keunggulan Kami</h2>

          <div class="q-gutter-md">
            <div class="row no-wrap q-gutter-sm" v-for="point in points" :key="point">
              <div class="company-icon-box-sm">
                <q-icon name="check" size="16px" />
              </div>
              <p class="text-grey-4 q-mb-none" style="line-height: 1.7">{{ point }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  image: { type: String, required: true },
  imageAlt: { type: String, default: 'Company building' },
  points: {
    type: Array,
    default: () => [
      'Tim berpengalaman di proyek gedung dan industri',
      'Pekerjaan sesuai standar teknis dan keselamatan kerja',
      'Fleksibel sebagai partner, subkontraktor, maupun joint operation',
      'Komitmen terhadap kualitas, waktu, dan tanggung jawab pekerjaan',
      'Didukung oleh sistem kerja yang terstruktur, komunikasi yang jelas, dan pengendalian mutu yang konsisten',
    ],
  },
});
</script>
