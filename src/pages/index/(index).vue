<template>
  <q-page>
    <q-header elevated class="bg-navy-950 text-white" height-hint="98">
      <div class="q-pa-md">
        <q-toolbar class="text-white">
          <img
            alt="TSC"
            src="@/assets/logo_white-removebg-preview.png"
            width="80"
            class="cursor-pointer"
            @click="handleLogoClick"
          />

          <q-space />
          <q-btn-toggle
            v-model="model"
            class="gt-sm"
            flat
            stretch
            toggle-color="amber"
            :options="options"
            @update:model-value="scrollToId"
          />

          <!-- Tombol Login di Navbar Desktop -->
          <q-btn
            class="btn-gold gt-sm q-ml-md"
            no-caps
            :icon="isLoggedIn ? 'dashboard' : 'login'"
            :label="isLoggedIn ? 'Dashboard' : 'Login Portal'"
            @click="navigateToLogin"
          />

          <!-- Tombol Menu untuk Mobile -->
          <q-btn
            aria-label="Toggle drawer"
            flat
            round
            dense
            icon="menu"
            class="q-mr-sm lt-md q-ml-sm"
            @click="toggleDrawer"
          />
        </q-toolbar>
      </div>
    </q-header>

    <!-- Drawer Mobile -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered class="bg-navy-950">
      <div class="q-pa-md text-white">
        <div class="row items-center justify-between q-mb-md">
          <img
            alt="TSC"
            src="@/assets/logo_white-removebg-preview.png"
            width="75"
            class="cursor-pointer"
            @click="handleLogoClick"
          />
          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-4"
            aria-label="Tutup menu"
            @click="toggleDrawer"
          />
        </div>

        <!-- Tombol Login di Drawer Mobile -->
        <q-btn
          class="btn-gold full-width q-mb-lg"
          no-caps
          :icon="isLoggedIn ? 'dashboard' : 'login'"
          :label="isLoggedIn ? 'Buka Dashboard' : 'Login Portal'"
          @click="navigateToLogin"
        />

        <div class="text-caption text-grey-5 text-uppercase q-mb-xs q-px-sm">
          Menu Navigasi
        </div>

        <q-list dark separator style="max-width: 318px">
          <q-item
            v-for="option in options"
            :key="option.value"
            clickable
            v-ripple
            :active="model === option.value"
            active-class="text-amber-5 text-weight-bold"
            @click="scrollToId(option.value)"
          >
            <q-item-section>{{ option.label }}</q-item-section>
            <q-item-section side v-if="model === option.value">
              <q-icon name="chevron_right" color="amber" size="18px" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-drawer>

    <HeroSection
      id="home"
      background-image="/01.jpg"
      :logo-position="{ top: '10px', left: '10px', width: '60px' }"
      @primary-click="scrollToId('layanan')"
      @secondary-click="scrollToId('kontak')"
    />

    <AboutSection id="tentangkami" />
    <VisionMissionSection id="visi&misi" />
    <HowWeWorkSection id="proseskerja" />
    <ServicesSection id="layanan" />
    <PortfolioSection id="portofolio" />
    <AdvantagesSection id="keunggulan" image="/01.jpg" />
    <ContactSection id="kontak" />
    <!-- Section Referensi (klien) -->
    <LogoGridSection
      id="klien"
      eyebrow="Klien Kami"
      title="Referensi Proyek & Klien"
      :logos="[
        { name: 'PT Adhi Karya (Persero) Tbk', image: '/images/client/adhi-karya.png' },
        { name: 'Agung Sedayu Group', image: '/images/client/agung-sedayu.png' },
        { name: 'PT Telkom Indonesia Tbk', image: '/images/client/telkom_indonesia.png' },
        { name: 'PT Bio Farma (Persero)', image: '/images/client/bio-farma.png' },
        { name: 'Sahid Jaya Hotel & Resorts', image: '/images/client/sahid-jaya.png' },
        { name: 'PT Mayora Indah Tbk', image: '/images/client/logo-mayora.png' },
        { name: 'PT Medco Energi Internasional', image: '/images/client/medco.svg' },
        { name: 'PT Wijaya Karya (WIKA)', image: '/images/client/wika.svg' }
      ]"
    />

    <!-- Section Mitra Kami (brand/partner produk) -->
    <LogoGridSection
      eyebrow="Partner & Brand Terpercaya"
      title="Mitra Prinsipal Kami"
      :logos="[
        { name: 'Schneider Electric', image: '/images/partners/schneider.svg' },
        { name: 'Hikvision', image: '/images/partners/hikvision.svg' },
        { name: 'ABB', image: '/images/partners/abb.svg' },
        { name: 'Siemens', image: '/images/partners/siemens.svg' },
        { name: 'Johnson Controls', image: '/images/partners/johnson-controls.svg' },
        { name: 'Omron', image: '/images/partners/omron.svg' },
        { name: 'Dahua Technology', image: '/images/partners/dahua.svg' },
        { name: 'Samsung', image: '/images/partners/samsung.svg' },
        { name: 'Honeywell', image: '/images/partners/honeywell.svg' },
        { name: 'Bosch', image: '/images/partners/bosch.svg' },
        { name: 'Panasonic', image: '/images/partners/panasonic.svg' }
      ]"
    />

    <FooterSection logo-image="/logo_white-removebg-preview.png" />

    <!-- Tombol Scroll ke Atas -->
    <q-page-sticky position="bottom-right" :offset="[20, 20]">
      <q-btn
        round
        icon="arrow_upward"
        class="btn-gold shadow-4"
        size="md"
        aria-label="Kembali ke atas"
        @click="scrollToTop"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import VisionMissionSection from '@/components/VisionMissionSection.vue'
import HowWeWorkSection from '@/components/HowWeWorkSection.vue'
import ServicesSection from '@/components/ServicesSection.vue'
import PortfolioSection from '@/components/PortfolioSection.vue'
import AdvantagesSection from '@/components/AdvantagesSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import LogoGridSection from '@/components/LogoGridSection.vue'
import FooterSection from '@/components/FooterSection.vue'

const router = useRouter()
const { isLoggedIn } = useAuth()

const model = ref('home')
const leftDrawerOpen = ref(false)
const options = [
  { label: 'Home', value: 'home' },
  { label: 'Tentang Kami', value: 'tentangkami' },
  { label: 'Visi & Misi', value: 'visi&misi' },
  { label: 'Proses Kerja', value: 'proseskerja' },
  { label: 'Layanan', value: 'layanan' },
  { label: 'Keunggulan', value: 'keunggulan' },
  { label: 'Kontak', value: 'kontak' },
  { label: 'Klien Kami', value: 'klien' }
]

function scrollToId(targetId) {
  leftDrawerOpen.value = false
  if (!targetId) return

  model.value = targetId
  const element = document.getElementById(targetId)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}

function handleLogoClick() {
  scrollToId('home')
}

function scrollToTop() {
  scrollToId('home')
}

function toggleDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function navigateToLogin() {
  leftDrawerOpen.value = false
  if (isLoggedIn.value) {
    router.push('/dashboard')
  } else {
    router.push('/login')
  }
}
</script>
