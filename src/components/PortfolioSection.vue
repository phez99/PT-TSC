<template>
  <section class="company-section-slate q-py-xl">
    <div class="q-px-lg" style="max-width: 1280px; margin: 0 auto">
      <!-- ================= JUDUL ================= -->
      <div class="text-center q-mb-lg" style="max-width: 700px; margin: 0 auto">
        <span class="company-eyebrow">Portofolio</span>
        <h2 class="text-h4 text-white text-weight-bold q-mt-md q-mb-sm"
          >Portofolio Proyek</h2
        >
        <p class="text-grey-5">{{ subtitle }}</p>
      </div>

      <!-- ================= FILTER KATEGORI ================= -->
      <div class="row justify-center q-gutter-sm q-mb-xl">
        <q-btn
          v-for="f in filters"
          :key="f.value"
          unelevated
          no-caps
          :label="f.label"
          class="company-filter-btn"
          :class="{ 'company-filter-btn--active': active === f.value }"
          @click="handleFilterClick(f.value)"
        />
      </div>

      <!-- ================= GRID PROYEK ================= -->
      <div class="row q-col-gutter-lg">
        <div
          class="col-12 col-sm-6 col-md-3"
          v-for="project in visibleProjects"
          :key="project.name"
        >
          <q-card
            class="company-card project-card full-height cursor-pointer"
            @click="openProjectModal(project)"
          >
            <div class="company-project-media">
              <img
                v-if="!failedImages.has(project.name)"
                :src="project.image"
                :alt="project.name"
                referrerpolicy="no-referrer"
                @error="failedImages.add(project.name)"
              />
              <div v-else class="company-project-placeholder">
                <q-icon name="apartment" size="48px" />
              </div>

              <div class="project-overlay">
                <span
                  v-for="c in project.categories"
                  :key="c"
                  class="company-project-tag"
                >
                  {{ categoryLabel(c) }}
                </span>
              </div>
            </div>

            <div class="q-pa-md">
              <div
                class="text-subtitle1 text-weight-bold"
                style="color: #0f172a; line-height: 1.3"
              >
                {{ project.name }}
              </div>
              <div class="text-body2 text-grey-7 q-mt-xs">{{
                project.work
              }}</div>
              <div class="row items-center q-mt-sm text-caption text-amber-700 text-weight-bold">
                <span>Lihat Dokumentasi</span>
                <q-icon name="arrow_forward" size="14px" class="q-ml-xs" />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Modal Pratinjau Proyek -->
      <q-dialog v-model="dialogOpen">
        <q-card v-if="selectedProject" class="bg-navy-900 text-white" style="width: 700px; max-width: 95vw; border-radius: 16px;">
          <div class="relative-position">
            <img
              :src="selectedProject.image"
              :alt="selectedProject.name"
              referrerpolicy="no-referrer"
              style="width: 100%; height: 340px; object-fit: cover;"
            />
            <q-btn
              round
              dense
              flat
              icon="close"
              color="white"
              class="absolute-top-right q-ma-sm bg-navy-950"
              @click="dialogOpen = false"
            />
          </div>

          <q-card-section class="q-pa-lg">
            <div class="row q-gutter-xs q-mb-sm">
              <span
                v-for="c in selectedProject.categories"
                :key="c"
                class="company-project-tag"
              >
                {{ categoryLabel(c) }}
              </span>
            </div>
            <div class="text-h5 text-weight-bold text-white q-mb-xs">
              {{ selectedProject.name }}
            </div>
            <div class="text-subtitle1 text-amber-500 q-mb-md">
              {{ selectedProject.work }}
            </div>
            <p class="text-grey-4 text-body2" style="line-height: 1.8;">
              Pengerjaan sistem terintegrasi oleh tim teknis PT. Trimitra Solusindo Cemerlang dengan mengedepankan standar kualitas material, regulasi K3/HSE, serta pengujian berkala hingga serah terima proyek selesai secara sempurna.
            </p>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  subtitle: {
    type: String,
    default: 'Beberapa proyek yang telah kami kerjakan bersama mitra dan klien.'
  },

  // Daftar kategori untuk tombol filter. value 'all' = tampilkan semua.
  filters: {
    type: Array,
    default: () => [
      { value: 'all', label: 'Semua' },
      { value: 'electronic', label: 'Electronic System' },
      { value: 'mep', label: 'Mechanical & Electrical' }
    ]
  },

  // Foto taruh di public/projects/ lalu sesuaikan nama file di bawah.
  // categories: isi salah satu/lebih dari value di filters (selain 'all')
  projects: {
    type: Array,
    default: () => [
      {
        name: 'Puri Mansion Apartemen',
        work: 'Electronic System Installation',
        categories: ['electronic'],
        image: '/projects/puri-mansion.jpg'
      },
      {
        name: 'Green Sedayu Bizpark Daan Mogot',
        work: 'Electronic System Installation',
        categories: ['electronic'],
        image: '/projects/green-sedayu-bizpark.jpg'
      },
      {
        name: 'Sedayu Square',
        work: 'Electronic System Installation',
        categories: ['electronic'],
        image: '/projects/sedayu-square.jpg'
      },
      {
        name: 'The Mansion Jasmine Kemayoran',
        work: 'Electronic System Installation',
        categories: ['electronic'],
        image: '/projects/mansion-jasmine.jpg'
      },
      {
        name: 'Agung Sedayu Group',
        work: 'Mechanical, Electrical & Plumbing Installation',
        categories: ['mep'],
        image: '/projects/agung-sedayu-group.jpg'
      },
      {
        name: 'The Mansion Bougenville Kemayoran',
        work: 'Electronic System Installation',
        categories: ['electronic'],
        image: '/projects/mansion-bougenville.jpg'
      },
      {
        name: 'Kawasan Golden Fatmawati',
        work: 'Mechanical & Electronic System Installation',
        categories: ['mep', 'electronic'],
        image: '/projects/golden-fatmawati.jpg'
      },
      {
        name: 'Medco E&P Aceh',
        work: 'Electronic System / Instrumentation & Telecommunication System',
        categories: ['electronic'],
        image: '/projects/medco-aceh.jpg'
      }
    ]
  }
})

const active = ref('all')
const dialogOpen = ref(false)
const selectedProject = ref(null)

// Nama proyek yang fotonya gagal load → tampil placeholder, bukan ikon rusak
const failedImages = reactive(new Set())

const visibleProjects = computed(() =>
  active.value === 'all'
    ? props.projects
    : props.projects.filter(p => p.categories.includes(active.value))
)

function categoryLabel(value) {
  return props.filters.find(f => f.value === value)?.label ?? value
}

function handleFilterClick(category) {
  active.value = category
}

function openProjectModal(project) {
  selectedProject.value = project
  dialogOpen.value = true
}
</script>
