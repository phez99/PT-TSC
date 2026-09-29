<template>
  <footer class="company-footer">
    <div class="q-px-lg" style="max-width: 1280px; margin: 0 auto">
      <div class="row q-col-gutter-xl">
        <!-- Kolom 1: Logo & deskripsi singkat -->
        <div class="col-12 col-md-4">
          <div class="row items-center q-gutter-sm q-mb-md">
            <img :src="logoImage" :alt="companyName" style="height: 40px" />
            <div class="text-white text-weight-bold">{{ companyName }}</div>
          </div>
          <p class="company-footer-text">{{ shortDescription }}</p>
          <q-btn
            to="/login"
            class="btn-ghost-navy q-mt-sm"
            no-caps
            icon="login"
            label="Masuk ke Portal TSC"
          />
        </div>

        <!-- Kolom 2: Kontak -->
        <div class="col-12 col-sm-6 col-md-2">
          <div class="company-footer-heading">Kontak</div>
          <a :href="`tel:${cleanPhone}`" class="company-footer-link">
            <q-icon name="call" size="16px" class="q-mt-xs" />
            <span class="company-footer-link-text">{{ phone }}</span>
          </a>
          <a :href="`mailto:${email}`" class="company-footer-link">
            <q-icon name="mail" size="16px" class="q-mt-xs" />
            <span class="company-footer-link-text">{{ email }}</span>
          </a>
        </div>

        <!-- Kolom 3: Head Office -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="company-footer-heading">Head Office</div>
          <div class="company-footer-link">
            <q-icon name="location_on" size="16px" class="q-mt-xs" />
            <span class="company-footer-link-text">{{ headOffice }}</span>
          </div>
        </div>

        <!-- Kolom 4: Workshop -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="company-footer-heading">Workshop</div>
          <div class="company-footer-link">
            <q-icon name="factory" size="16px" class="q-mt-xs" />
            <span class="company-footer-link-text">{{ workshop }}</span>
          </div>
        </div>
      </div>

      <div class="company-footer-bottom">
        &copy; {{ year }} {{ companyName }}. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  logoImage: { type: String, required: true },
  companyName: { type: String, default: 'PT. Trimitra Solusindo Cemerlang' },
  shortDescription: {
    type: String,
    default:
      'Solusi terintegrasi Security System, Mechanical, Electrical & Plumbing (MEP), Advertising, serta Pengadaan Material.'
  },
  phone: { type: String, default: '+62 812 1050 1150' },
  email: { type: String, default: 'trimitrasolusindocemerlang@gmail.com' },
  headOffice: {
    type: String,
    default:
      'Legenda Wisata Ruko Newton Square U18/30, Kel. Nagrak, Kec. Gunung Putri, Kab. Bogor, Jawa Barat'
  },
  workshop: {
    type: String,
    default:
      'Jl. Gardu No. 08A, Bale Kambang, Kramat Jati, Jakarta Timur, DKI Jakarta – Indonesia'
  },
  year: { type: [String, Number], default: new Date().getFullYear() }
})

const cleanPhone = computed(() => props.phone.replace(/[^0-9+]/g, ''))
</script>
