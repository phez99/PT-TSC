<template>
  <section class="company-section-light q-py-xl">
    <div class="q-px-lg" style="max-width: 1280px; margin: 0 auto">
      <div class="text-center q-mb-xl" style="max-width: 700px; margin: 0 auto">
        <span class="company-eyebrow" style="color: #d97706; background: rgba(245, 158, 11, 0.1)"
          >Layanan & Produk</span
        >
        <h2 class="text-h4 text-weight-bold q-mt-md" style="color: #0f172a">
          Solusi Terintegrasi untuk Kebutuhan Proyek Anda
        </h2>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6" v-for="cat in categories" :key="cat.title">
          <q-card class="company-card q-pa-lg full-height">
            <div class="company-card-icon">
              <q-icon :name="cat.icon" />
            </div>
            <div class="text-h6 text-weight-bold q-mb-sm" style="color: #0f172a">
              {{ cat.title }}
            </div>
            <p class="text-grey-8 text-body2 q-mb-md">{{ cat.description }}</p>
            <ul class="q-pl-md text-body2 text-grey-8" style="line-height: 1.9">
              <li v-for="item in cat.items" :key="item">{{ item }}</li>
            </ul>
          </q-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  categories: {
    type: Array,
    default: () => [
      {
        icon: 'settings_input_antenna',
        title: 'Electronic / Instrumentation & Telecommunication System',
        description: 'Layanan instalasi dan sistem elektronik bangunan.',
        items: [
          'Fire Alarm System',
          'CCTV System',
          'Access Control System',
          'Sound & Public Address System',
          'Telephone & Data Network',
          'Fiber Optic & GPON System',
          'Instrumentation & Control System',
          'Building Automation System (BAS)',
          'Parking & Security System',
        ],
      },
      {
        icon: 'bolt',
        title: 'Electrical System',
        description: 'Pekerjaan sistem kelistrikan untuk gedung dan fasilitas industri.',
        items: ['Medium Voltage System', 'Low Voltage System', 'Trafo', 'Generator Set (Genset)'],
      },
      {
        icon: 'ac_unit',
        title: 'Mechanical System (HVAC & Plumbing)',
        description: 'Solusi sistem mekanikal dan plumbing yang terintegrasi.',
        items: [
          'HVAC / Air Conditioning System',
          'Ventilation & Exhaust System',
          'Plumbing System',
          'Hydrant & Fire Fighting System',
          'Industrial Tank',
          'Lift / Vertical Transportation',
        ],
      },
      {
        icon: 'campaign',
        title: 'Advertising & Signage',
        description: 'Layanan pembuatan dan instalasi media promosi.',
        items: [
          'Billboard',
          'Video Wall / LED Display',
          'Neon Box',
          'Pylon Sign',
          'Wayfinding & Directional Signage',
          'Letter Sign / Huruf Timbul',
          'Project Identification Sign',
        ],
      },
    ],
  },
});
</script>
