<template>
  <section class="company-hero">
    <!-- Background gelap dasar hero (bukan bg image kolom kanan) -->
    <div
      class="row items-center company-hero-content q-col-gutter-sm full-width q-px-sm"
    >
      <!-- ================= KOLOM KIRI: CTA + Info ================= -->
      <div class="col-12 col-md-6">
        <q-chip class="company-badge q-mb-md">
          <span class="company-badge-dot q-mr-sm"></span>
          {{ badgeText }}
        </q-chip>

        <h1
          class="text-h3 text-h2-md text-white q-mb-md"
          style="line-height: 1.2"
        >
          {{ titlePrefix }}
          <span class="company-gradient-text">{{ titleHighlight }}</span>
        </h1>

        <p class="text-body1 text-grey-4 q-mb-lg" style="max-width: 520px">
          {{ description }}
        </p>

        <div class="row q-gutter-md q-mb-lg">
          <q-btn
            class="btn-gold"
            no-caps
            :label="ctaPrimaryLabel"
            icon-right="arrow_forward"
            @click="handlePrimaryClick"
          />
          <q-btn
            class="btn-ghost-navy"
            no-caps
            :label="ctaSecondaryLabel"
            icon="support_agent"
            @click="handleSecondaryClick"
          />
        </div>

        <!-- Highlight kecil (badge info tambahan) -->
        <div
          class="row q-col-gutter-md q-pt-md"
          style="border-top: 1px solid rgba(148, 163, 184, 0.2)"
        >
          <div class="col-4" v-for="item in highlights" :key="item.label">
            <div
              class="text-caption text-grey-5"
              style="text-transform: uppercase"
            >
              {{ item.label }}
            </div>
            <div class="text-white text-weight-medium">
              <q-icon :name="item.icon" class="text-amber-600 q-mr-xs" />
              {{ item.value }}
            </div>
          </div>
        </div>
      </div>

      <!-- ================= KOLOM KANAN: BG Image + Logo ================= -->
      <div class="col-12 col-md-6">
        <div class="company-hero-image-wrap">
          <img
            :src="backgroundImage"
            :alt="backgroundAlt"
            class="company-hero-image"
          />

          <!-- Logo overlay, posisi diatur lewat props logoPosition -->
          <!--  <img
            :src="logoImage"
            :alt="logoAlt"
            class="company-hero-logo"
            :style="logoStyle"
          /> -->
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  badgeText: {
    type: String,
    default: 'Security System, MEP & Advertising Solutions'
  },
  titlePrefix: { type: String, default: 'Solusi Terintegrasi' },
  titleHighlight: { type: String, default: 'Security System & MEP Terpercaya' },
  description: {
    type: String,
    default:
      'PT. Trimitra Solusindo Cemerlang menghadirkan solusi terintegrasi di bidang Security System, Mechanical, Electrical & Plumbing (MEP), Advertising, serta Pengadaan Material — dengan mengedepankan profesionalisme, kualitas, dan kepuasan mitra.'
  },
  ctaPrimaryLabel: { type: String, default: 'Lihat Layanan Kami' },
  ctaSecondaryLabel: { type: String, default: 'Hubungi Kami' },
  highlights: {
    type: Array,
    default: () => [
      { label: 'Berdiri Sejak', value: '2024', icon: 'event' },
      { label: 'Standar Kerja', value: 'K3 & Mutu', icon: 'shield' },
      { label: 'Cakupan', value: 'Gedung & Industri', icon: 'apartment' }
    ]
  },

  backgroundImage: { type: String, required: true },
  backgroundAlt: { type: String, default: 'Company background' },

  // logoImage: { type: String, required: true },
  logoAlt: { type: String, default: 'Company logo' },

  // ---- Ini bagian pengaturan posisi logo ----
  // Isi salah satu/lebih dari: top, left, right, bottom (string CSS, misal '16px', '5%')
  // width: ukuran logo (default 96px)
  logoPosition: {
    type: Object,
    default: () => ({ top: '16px', left: '16px', width: '80px' })
  }
})

const logoStyle = computed(() => ({
  '--logo-top': props.logoPosition.top ?? 'auto',
  '--logo-left': props.logoPosition.left ?? 'auto',
  '--logo-right': props.logoPosition.right ?? 'auto',
  '--logo-bottom': props.logoPosition.bottom ?? 'auto',
  '--logo-width': props.logoPosition.width ?? '96px'
}))

const emit = defineEmits(['primary-click', 'secondary-click'])

function handlePrimaryClick() {
  emit('primary-click')
  const el = document.getElementById('layanan')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleSecondaryClick() {
  emit('secondary-click')
  const el = document.getElementById('kontak')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>
