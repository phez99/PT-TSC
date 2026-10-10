<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER HALAMAN ================= -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="row items-center q-gutter-x-xs q-mb-xs">
          <q-badge color="amber-8" text-color="dark" class="text-weight-bold">
            CONTENT MANAGEMENT SYSTEM (CMS)
          </q-badge>
        </div>
        <h1 class="text-h5 text-weight-bold q-my-none text-navy-950 row items-center">
          <q-icon name="web" color="primary" size="28px" class="q-mr-sm" />
          <span>Pengelolaan Konten Website Utama</span>
        </h1>
        <p class="text-grey-7 text-body2 q-mt-xs q-mb-none" style="max-width: 680px">
          Kelola teks hero banner, profil perusahaan, visi-misi, serta informasi kontak yang tampil langsung pada halaman depan website PT. TSC.
        </p>
      </div>

      <div class="row items-center q-gutter-sm q-mt-sm q-mt-md-none">
        <q-btn
          outline
          color="primary"
          no-caps
          icon="open_in_new"
          label="Lihat Website"
          to="/"
          target="_blank"
        />
        <q-btn
          outline
          color="negative"
          no-caps
          icon="restart_alt"
          label="Reset Default"
          @click="confirmReset"
        />
        <q-btn
          class="btn-gold"
          no-caps
          icon="save"
          label="Simpan Perubahan"
          :loading="saving"
          @click="saveContent"
        />
      </div>
    </div>

    <!-- Banner Info -->
    <q-banner rounded class="bg-blue-1 text-primary q-mb-md" style="border: 1px solid #bfdbfe; border-radius: 12px;">
      <template #avatar>
        <q-icon name="info" color="primary" />
      </template>
      <div class="text-caption text-weight-medium">
        Setiap perubahan teks atau kontak yang Anda simpan di sini akan langsung diperbarui secara real-time pada landing page utama.
      </div>
    </q-banner>

    <!-- ================= CARD KONTEN CMS ================= -->
    <q-card class="company-dash-card shadow-2">
      <!-- Tabs Kategori Konten -->
      <q-tabs
        v-model="activeTab"
        dense
        active-color="amber-8"
        indicator-color="amber-8"
        align="left"
        class="text-grey-7 q-px-md q-pt-sm bg-grey-1"
        style="border-bottom: 1px solid #e2e8f0;"
      >
        <q-tab name="hero" icon="view_headline" label="Hero Banner" no-caps />
        <q-tab name="about" icon="business" label="Tentang Perusahaan" no-caps />
        <q-tab name="vision" icon="visibility" label="Visi &amp; Misi" no-caps />
        <q-tab name="contact" icon="contact_phone" label="Kontak &amp; Alamat" no-caps />
      </q-tabs>

      <!-- Panel Konten -->
      <q-tab-panels v-model="activeTab" animated class="q-pa-md q-pa-sm-lg">
        <!-- ================= TAB 1: HERO BANNER ================= -->
        <q-tab-panel name="hero" class="q-pa-none">
          <div class="text-subtitle1 text-weight-bold text-navy-950 q-mb-sm">
            Pengaturan Hero Banner Depan
          </div>
          <p class="text-caption text-grey-6 q-mb-md">
            Bagian pertama yang dilihat pengunjung saat membuka website.
          </p>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="cmsForm.hero.badgeText"
                outlined
                dense
                label="Teks Badge Atas"
                placeholder="Contoh: Security System, MEP & Advertising Solutions"
                class="q-mb-md"
              />

              <q-input
                v-model="cmsForm.hero.titlePrefix"
                outlined
                dense
                label="Awalan Judul Utama"
                placeholder="Contoh: Solusi Terintegrasi"
                class="q-mb-md"
              />

              <q-input
                v-model="cmsForm.hero.titleHighlight"
                outlined
                dense
                label="Judul Sorotan (Warna Emas)"
                placeholder="Contoh: Security System & MEP Terpercaya"
                class="q-mb-md"
              />

              <q-input
                v-model="cmsForm.hero.description"
                type="textarea"
                rows="4"
                outlined
                dense
                label="Deskripsi Pengantar Singkat"
                class="q-mb-md"
              />

              <div class="row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model="cmsForm.hero.ctaPrimaryLabel"
                    outlined
                    dense
                    label="Label Tombol Utama"
                  />
                </div>
                <div class="col-6">
                  <q-input
                    v-model="cmsForm.hero.ctaSecondaryLabel"
                    outlined
                    dense
                    label="Label Tombol Kontak"
                  />
                </div>
              </div>
            </div>

            <!-- Kolom Kanan: 3 Statistik Hero -->
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-weight-bold text-navy-950 q-mb-xs">
                3 Statistik Sorotan Hero
              </div>
              <div class="text-caption text-grey-6 q-mb-sm">
                Kartu metrik di bawah tombol aksi hero:
              </div>

              <div
                v-for="(h, idx) in cmsForm.hero.highlights"
                :key="idx"
                class="q-pa-sm q-mb-sm bg-grey-1 rounded-borders"
                style="border: 1px solid #e2e8f0;"
              >
                <div class="row q-col-gutter-sm">
                  <div class="col-5">
                    <q-input v-model="h.label" outlined dense label="Label" />
                  </div>
                  <div class="col-4">
                    <q-input v-model="h.value" outlined dense label="Nilai" />
                  </div>
                  <div class="col-3">
                    <q-input v-model="h.icon" outlined dense label="Icon" />
                  </div>
                </div>
              </div>

              <q-input
                v-model="cmsForm.hero.backgroundImage"
                outlined
                dense
                label="Path / URL Gambar Latar Hero"
                class="q-mt-md"
                hint="Default: /01.jpg"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- ================= TAB 2: TENTANG KAMI ================= -->
        <q-tab-panel name="about" class="q-pa-none">
          <div class="text-subtitle1 text-weight-bold text-navy-950 q-mb-sm">
            Profil &amp; Tentang Perusahaan
          </div>
          <p class="text-caption text-grey-6 q-mb-md">
            Informasi sejarah singkat, bidang bisnis, dan komitmen mutu PT. TSC.
          </p>

          <q-input
            v-model="cmsForm.about.title"
            outlined
            dense
            label="Judul Bagian Tentang Kami"
            class="q-mb-md"
          />

          <div
            v-for="(p, idx) in cmsForm.about.paragraphs"
            :key="idx"
            class="q-mb-md"
          >
            <q-input
              v-model="cmsForm.about.paragraphs[idx]"
              type="textarea"
              rows="3"
              outlined
              dense
              :label="`Paragraf ${idx + 1}`"
            />
          </div>
        </q-tab-panel>

        <!-- ================= TAB 3: VISI & MISI ================= -->
        <q-tab-panel name="vision" class="q-pa-none">
          <div class="text-subtitle1 text-weight-bold text-navy-950 q-mb-sm">
            Visi dan Misi Perusahaan
          </div>
          <p class="text-caption text-grey-6 q-mb-md">
            Prinsip fundamental dan arah strategis perusahaan.
          </p>

          <q-input
            v-model="cmsForm.visionMission.vision"
            type="textarea"
            rows="3"
            outlined
            dense
            label="Pernyataan Visi"
            class="q-mb-lg"
          />

          <div class="text-subtitle2 text-weight-bold text-navy-950 q-mb-xs">
            Poin-Poin Misi Perusahaan:
          </div>
          <div
            v-for="(m, idx) in cmsForm.visionMission.missions"
            :key="idx"
            class="row items-center q-gutter-x-sm q-mb-sm"
          >
            <q-avatar size="28px" color="navy-900" text-color="white" class="text-weight-bold text-caption">
              {{ idx + 1 }}
            </q-avatar>
            <q-input
              v-model="cmsForm.visionMission.missions[idx]"
              outlined
              dense
              style="flex: 1;"
            />
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="removeMission(idx)"
            />
          </div>

          <q-btn
            outline
            dense
            no-caps
            size="sm"
            color="primary"
            icon="add"
            label="Tambah Poin Misi"
            class="q-mt-xs"
            @click="addMission"
          />
        </q-tab-panel>

        <!-- ================= TAB 4: KONTAK & ALAMAT ================= -->
        <q-tab-panel name="contact" class="q-pa-none">
          <div class="text-subtitle1 text-weight-bold text-navy-950 q-mb-sm">
            Informasi Kontak &amp; Alamat Resmi
          </div>
          <p class="text-caption text-grey-6 q-mb-md">
            Data kontak yang digunakan pengunjung untuk menghubungi perwakilan TSC via telepon, WhatsApp, dan email.
          </p>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="cmsForm.contact.title"
                outlined
                dense
                label="Judul Bagian Kontak"
                class="q-mb-md"
              />

              <q-input
                v-model="cmsForm.contact.phone"
                outlined
                dense
                label="Nomor Telepon &amp; WhatsApp Resmi"
                placeholder="+62 812 1050 1150"
                class="q-mb-md"
              />

              <q-input
                v-model="cmsForm.contact.email"
                outlined
                dense
                label="Alamat Email Perusahaan"
                placeholder="info@tsc.co.id"
                class="q-mb-md"
              />

              <q-input
                v-model="cmsForm.contact.officeHours"
                outlined
                dense
                label="Jam Kerja / Operasional Kantor"
                placeholder="Senin - Jumat: 08:30 - 17:00 WIB"
                class="q-mb-md"
              />
            </div>

            <div class="col-12 col-md-6">
              <q-input
                v-model="cmsForm.contact.address"
                type="textarea"
                rows="3"
                outlined
                dense
                label="Alamat Lengkap Kantor Pusat"
                class="q-mb-md"
              />

              <q-input
                v-model="cmsForm.contact.description"
                type="textarea"
                rows="4"
                outlined
                dense
                label="Teks Ajakan Kemitraan (Description)"
                class="q-mb-md"
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- Footer Action -->
      <q-separator />
      <div class="row items-center justify-between q-pa-md bg-grey-1">
        <div class="text-caption text-grey-6">
          Terakhir disinkronkan ke local storage portal.
        </div>
        <div class="row items-center q-gutter-sm">
          <q-btn flat label="Batal" color="grey-7" no-caps @click="reloadContent" />
          <q-btn
            class="btn-gold"
            no-caps
            icon="save"
            label="Simpan Semua Konten"
            :loading="saving"
            @click="saveContent"
          />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  getCmsContent,
  saveCmsContent,
  resetCmsContent
} from '/src/services/cms.service.js'

const $q = useQuasar()

const activeTab = ref('hero')
const saving = ref(false)

const cmsForm = reactive({
  hero: {
    badgeText: '',
    titlePrefix: '',
    titleHighlight: '',
    description: '',
    ctaPrimaryLabel: '',
    ctaSecondaryLabel: '',
    backgroundImage: '',
    highlights: []
  },
  about: {
    title: '',
    paragraphs: []
  },
  visionMission: {
    vision: '',
    missions: []
  },
  contact: {
    title: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    officeHours: ''
  }
})

function reloadContent() {
  const data = getCmsContent()
  Object.assign(cmsForm.hero, JSON.parse(JSON.stringify(data.hero)))
  Object.assign(cmsForm.about, JSON.parse(JSON.stringify(data.about)))
  Object.assign(cmsForm.visionMission, JSON.parse(JSON.stringify(data.visionMission)))
  Object.assign(cmsForm.contact, JSON.parse(JSON.stringify(data.contact)))
}

function addMission() {
  cmsForm.visionMission.missions.push('Misi baru operasional PT. TSC')
}

function removeMission(index) {
  cmsForm.visionMission.missions.splice(index, 1)
}

function saveContent() {
  saving.value = true
  try {
    saveCmsContent(JSON.parse(JSON.stringify(cmsForm)))
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: 'Konten Website Utama berhasil disimpan dan diterapkan!'
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal menyimpan konten CMS'
    })
  } finally {
    saving.value = false
  }
}

function confirmReset() {
  $q.dialog({
    title: 'Reset Konten ke Pengaturan Awal?',
    message: 'Seluruh teks kustom akan dikembalikan ke teks standar bawaan perusahaan.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    resetCmsContent()
    reloadContent()
    $q.notify({
      type: 'info',
      icon: 'restart_alt',
      message: 'Konten telah direset ke default.'
    })
  })
}

onMounted(() => {
  reloadContent()
})
</script>
