<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">
          Dokumen &amp; BAST (Document Control)
        </div>
        <div class="text-grey-7 text-body2">
          Pusat pengendalian Berita Acara Serah Terima (BAST), Gambar As-Built,
          Kontrak, dan Dokumen K3/QA.
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="primary"
          no-caps
          icon="download"
          label="Export CSV"
          @click="exportDocsToCsv"
        />
        <q-btn
          class="btn-gold"
          no-caps
          icon="verified"
          label="Buat BAST Resmi"
          @click="openCreateBastDialog"
        />
        <q-btn
          outline
          color="primary"
          no-caps
          icon="upload_file"
          label="Catat Dokumen Teknis"
          @click="openCreateDocDialog"
        />
      </div>
    </div>

    <!-- ================= KPI DOKUMEN ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >TOTAL DOKUMEN</div
          >
          <div class="text-h5 text-weight-bold text-navy-950 q-my-xs">{{
            docs.length
          }}</div>
          <div class="text-caption text-grey-6">Arsip Terdata Resmi</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >BERITA ACARA (BAST)</div
          >
          <div class="text-h5 text-weight-bold text-positive q-my-xs">
            {{ docs.filter(d => d.category === 'bast').length }}
          </div>
          <div class="text-caption text-positive text-weight-medium"
            >Serah Terima Fisik</div
          >
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >GAMBAR AS-BUILT</div
          >
          <div class="text-h5 text-weight-bold text-primary q-my-xs">
            {{ docs.filter(d => d.category === 'drawing').length }}
          </div>
          <div class="text-caption text-grey-6">Drawing &amp; Layout</div>
        </q-card>
      </div>
      <div class="col-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold"
            >K3 &amp; TESTING</div
          >
          <div class="text-h5 text-weight-bold text-amber-8 q-my-xs">
            {{
              docs.filter(d => d.category === 'hse' || d.category === 'testing')
                .length
            }}
          </div>
          <div class="text-caption text-grey-6">Commissioning / SIKA</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABEL DOKUMEN ================= -->
    <q-card class="company-dash-card">
      <q-table
        flat
        :rows="filteredDocs"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada arsip dokumen"
        class="company-dash-table"
      >
        <template #top>
          <q-input
            v-model="search"
            dense
            outlined
            debounce="200"
            placeholder="Cari no. dokumen, judul, proyek..."
            style="width: 280px"
          >
            <template #prepend><q-icon name="search" /></template>
            <template #append v-if="search">
              <q-icon
                name="clear"
                class="cursor-pointer"
                @click="search = ''"
              />
            </template>
          </q-input>

          <q-space />

          <q-select
            v-model="categoryFilter"
            :options="categoryOptions"
            emit-value
            map-options
            dense
            outlined
            label="Kategori Dokumen"
            style="min-width: 200px"
          />
        </template>

        <!-- No Dokumen -->
        <template #body-cell-docNumber="props">
          <q-td :props="props">
            <div
              class="font-mono text-weight-bold text-primary cursor-pointer"
              @click="openPreview(props.row)"
            >
              {{ props.row.docNumber }}
            </div>
            <div class="text-caption text-grey-6">{{
              formatDate(props.row.createdAt)
            }}</div>
          </q-td>
        </template>

        <!-- Judul & Kategori -->
        <template #body-cell-title="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.title }}</div>
            <div class="text-caption text-grey-7"
              >Proyek: {{ props.row.projectName }}</div
            >
          </q-td>
        </template>

        <!-- Kategori Badge -->
        <template #body-cell-category="props">
          <q-td :props="props" class="text-center">
            <q-badge
              :color="categoryBadge(props.row.category).color"
              :label="categoryBadge(props.row.category).label"
              class="q-pa-xs q-px-sm text-weight-bold"
            />
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              size="sm"
              :color="props.row.status === 'signed' ? 'green-1' : 'amber-1'"
              :text-color="
                props.row.status === 'signed' ? 'green-9' : 'amber-9'
              "
              class="text-weight-bold"
            >
              {{ props.row.status === 'signed' ? 'TERVERIFIKASI' : 'DRAFT' }}
            </q-chip>
          </q-td>
        </template>

        <!-- Aksi -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="row q-gutter-xs justify-center no-wrap">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="description"
                @click="openPreview(props.row)"
              >
                <q-tooltip>Lihat &amp; Cetak BAST</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete_outline"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Hapus</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- ================= DIALOG PEMBUAT BAST RESMI ================= -->
    <q-dialog v-model="bastDialog" persistent>
      <q-card style="width: 720px; max-width: 95vw; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold"
            >Buat Berita Acara Serah Terima (BAST)</div
          >
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveBast">
          <q-card-section class="q-gutter-y-md q-pt-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="bastForm.projectId"
                  :options="projectOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Pilih Proyek Terkait"
                  :rules="[v => !!v || 'Wajib memilih proyek']"
                  @update:model-value="onBastProjectSelect"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="bastForm.type"
                  :options="[
                    {
                      label: 'BAST-1 (Serah Terima Pertama Fisik 100%)',
                      value: 'bast-1'
                    },
                    {
                      label: 'BAST-2 (Serah Terima Akhir / Pasca Pemeliharaan)',
                      value: 'bast-2'
                    }
                  ]"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Jenis BAST"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="bastForm.title"
                  dense
                  outlined
                  label="Judul Dokumen BAST"
                  :rules="[v => !!v || 'Judul wajib diisi']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="bastForm.firstParty"
                  dense
                  outlined
                  label="PIHAK PERTAMA (Klien / Pemberi Kerja)"
                  placeholder="Nama & Jabatan Direktur Klien"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="bastForm.secondParty"
                  dense
                  outlined
                  label="PIHAK KEDUA (PT Trimitra Solusindo Cemerlang)"
                  placeholder="Nama & Jabatan Direktur TSC"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="bastForm.signDate"
                  type="date"
                  dense
                  outlined
                  label="Tanggal Penandatanganan BAST"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="bastForm.warrantyPeriod"
                  dense
                  outlined
                  label="Masa Garansi & Pemeliharaan"
                  placeholder="Contoh: 12 (Dua Belas) Bulan"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="bastForm.description"
                  type="textarea"
                  rows="3"
                  dense
                  outlined
                  label="Uraian Hasil Pemeriksaan Fisik & Uji Fungsi"
                  placeholder="Kedua belah pihak telah melakukan pemeriksaan bersama dan menyatakan seluruh pekerjaan telah selesai dengan baik dan berfungsi sempurna."
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
            <q-btn
              type="submit"
              class="btn-gold"
              label="Simpan &amp; Terbitkan BAST"
              no-caps
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ================= MODAL PRATINJAU CETAK BAST RESMI ================= -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card class="bg-grey-2">
        <q-toolbar class="bg-navy-950 text-white">
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Pratinjau Dokumen BAST &mdash; {{ activeDoc?.docNumber }}
          </q-toolbar-title>
          <q-btn
            class="btn-gold q-mr-sm"
            no-caps
            icon="print"
            label="Cetak Berita Acara"
            @click="printBast"
          />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <!-- Kertas Dokumen BAST -->
        <div class="q-pa-md q-pa-sm-xl flex justify-center">
          <div
            id="print-bast-area"
            class="bg-white q-pa-xl shadow-4"
            style="
              width: 820px;
              min-height: 1100px;
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.8;
            "
          >
            <!-- Kop Surat Resmi -->
            <div
              class="row items-center justify-between q-pb-md text-center"
              style="border-bottom: 2px solid #000"
            >
              <img
                src="/logo_white-removebg-preview.png"
                alt="TSC"
                style="
                  height: 48px;
                  background: #090d16;
                  padding: 4px 10px;
                  border-radius: 6px;
                "
              />
              <div style="flex: 1; padding: 0 15px">
                <div
                  style="
                    font-size: 18px;
                    font-weight: bold;
                    letter-spacing: 1px;
                  "
                >
                  PT. TRIMITRA SOLUSINDO CEMERLANG
                </div>
                <div style="font-size: 13px; font-style: italic">
                  Integrated Security System, Mechanical, Electrical, Plumbing
                  &amp; General Supplier
                </div>
                <div style="font-size: 11px">
                  Head Office: Legenda Wisata Ruko Newton Square U18/30, Kel.
                  Nagrak, Kec. Gunung Putri, Bogor
                </div>
              </div>
            </div>

            <!-- Judul BAST -->
            <div class="text-center q-my-lg">
              <div
                style="
                  font-size: 18px;
                  font-weight: bold;
                  text-decoration: underline;
                "
              >
                BERITA ACARA SERAH TERIMA PEKERJAAN
              </div>
              <div
                style="
                  font-size: 13px;
                  font-weight: bold;
                  font-family: monospace;
                "
              >
                Nomor: {{ activeDoc?.docNumber }}
              </div>
            </div>

            <p style="text-indent: 40px; font-size: 14px; text-align: justify">
              Pada hari ini, tanggal
              {{ formatDate(activeDoc?.signDate || activeDoc?.createdAt) }},
              bertempat di lokasi proyek
              <strong>{{ activeDoc?.projectName }}</strong
              >, kami yang bertanda tangan di bawah ini:
            </p>

            <!-- Pihak 1 dan 2 -->
            <div
              style="font-size: 14px; padding-left: 20px"
              class="q-gutter-y-sm"
            >
              <div class="row">
                <span style="width: 30px">1.</span>
                <div style="flex: 1">
                  <strong>{{ activeDoc?.firstParty }}</strong
                  >, bertindak untuk dan atas nama
                  <strong>{{ activeDoc?.clientName }}</strong
                  >, yang selanjutnya disebut sebagai
                  <strong>PIHAK PERTAMA (Pemberi Kerja)</strong>.
                </div>
              </div>
              <div class="row">
                <span style="width: 30px">2.</span>
                <div style="flex: 1">
                  <strong>{{ activeDoc?.secondParty }}</strong
                  >, bertindak untuk dan atas nama
                  <strong>PT. Trimitra Solusindo Cemerlang</strong>, yang
                  selanjutnya disebut sebagai
                  <strong>PIHAK KEDUA (Pelaksana Pekerjaan)</strong>.
                </div>
              </div>
            </div>

            <p
              style="
                text-indent: 40px;
                font-size: 14px;
                text-align: justify;
                margin-top: 20px;
              "
            >
              Menyatakan dengan sesungguhnya bahwa:
            </p>

            <ol
              style="font-size: 14px; padding-left: 45px; text-align: justify"
              class="q-gutter-y-xs"
            >
              <li>
                <strong>PIHAK KEDUA</strong> telah menyelesaikan seluruh
                pekerjaan pengadaan dan instalasi fisik sesuai spesifikasi
                teknis pada proyek
                <strong>{{ activeDoc?.projectName }}</strong> dengan bobot
                penyelesaian fisik 100%.
              </li>
              <li>
                Kedua belah pihak telah melakukan uji fungsi bersama (Testing
                &amp; Commissioning) dan menyatakan seluruh sistem berfungsi
                dengan baik dan normal tanpa catatan kecacatan material.
              </li>
              <li>
                <strong>PIHAK PERTAMA</strong> menerima hasil pekerjaan tersebut
                dengan baik dan sempurna.
              </li>
              <li>
                Masa Garansi dan Pemeliharaan pekerjaan berlaku selama
                <strong>{{
                  activeDoc?.warrantyPeriod || '12 (Dua Belas) Bulan'
                }}</strong>
                terhitung sejak penandatanganan Berita Acara ini.
              </li>
            </ol>

            <p
              style="
                text-indent: 40px;
                font-size: 14px;
                text-align: justify;
                margin-top: 20px;
              "
            >
              Demikian Berita Acara Serah Terima Pekerjaan ini dibuat dan
              ditandatangani dalam rangkap 2 (dua) bermeterai cukup dan memiliki
              kekuatan hukum yang sama bagi kedua belah pihak.
            </p>

            <!-- Tanda Tangan -->
            <div
              class="row justify-between text-center q-mt-xl"
              style="font-size: 14px"
            >
              <div style="width: 280px">
                <div>PIHAK PERTAMA,</div>
                <div style="font-weight: bold">{{ activeDoc?.clientName }}</div>
                <div style="height: 80px"></div>
                <div style="border-bottom: 1px solid #000; font-weight: bold">
                  {{ activeDoc?.firstParty }}
                </div>
                <div style="font-size: 12px">Pemberi Kerja / Direktur</div>
              </div>

              <div style="width: 280px">
                <div>PIHAK KEDUA,</div>
                <div style="font-weight: bold"
                  >PT. Trimitra Solusindo Cemerlang</div
                >
                <div style="height: 80px"></div>
                <div style="border-bottom: 1px solid #000; font-weight: bold">
                  {{ activeDoc?.secondParty }}
                </div>
                <div style="font-size: 12px">Direktur Pelaksana</div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  getDocuments,
  createDocument,
  deleteDocument
} from '/src/services/documents.service.js'
import { getProjects } from '/src/services/projects.service.js'
import { formatDate } from '/src/config/projects.js'

const $q = useQuasar()

const loading = ref(true)
const search = ref('')
const categoryFilter = ref('all')
const docs = ref([])
const projects = ref([])

const bastDialog = ref(false)
const previewDialog = ref(false)
const activeDoc = ref(null)

const categoryOptions = [
  { label: 'Semua Kategori', value: 'all' },
  { label: 'Berita Acara (BAST)', value: 'bast' },
  { label: 'Gambar As-Built / Drawing', value: 'drawing' },
  { label: 'Testing & Commissioning', value: 'testing' },
  { label: 'K3 & SIKA Lapangan', value: 'hse' }
]

const columns = [
  {
    name: 'docNumber',
    label: 'No. Dokumen',
    field: 'docNumber',
    align: 'left'
  },
  {
    name: 'title',
    label: 'Judul Dokumen & Proyek',
    field: 'title',
    align: 'left'
  },
  { name: 'category', label: 'Kategori', field: 'category', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Aksi', align: 'center' }
]

const bastForm = reactive({
  projectId: null,
  type: 'bast-1',
  title: 'Berita Acara Serah Terima I (BAST-1) Hasil Pekerjaan Selesai 100%',
  firstParty: '',
  secondParty: 'Ahmad Fauzi (Direktur Operasional PT TSC)',
  signDate: new Date().toISOString().slice(0, 10),
  warrantyPeriod: '12 (Dua Belas) Bulan sejak penandatanganan',
  description:
    'Pemeriksaan bersama pekerjaan instalasi sistem terpasang dengan hasil uji commissioning baik dan sempurna.'
})

const projectOptions = computed(() => {
  return projects.value.map(p => ({
    label: `${p.code} - ${p.name} (${p.client})`,
    value: p.id
  }))
})

const filteredDocs = computed(() => {
  let list = docs.value
  if (categoryFilter.value !== 'all') {
    list = list.filter(d => d.category === categoryFilter.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(
      d =>
        d.docNumber.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.projectName.toLowerCase().includes(q)
    )
  }
  return list
})

function categoryBadge(cat) {
  switch (cat) {
    case 'bast':
      return { label: 'BAST RESMI', color: 'positive' }
    case 'drawing':
      return { label: 'DRAWING', color: 'primary' }
    case 'testing':
      return { label: 'QA / TESTING', color: 'amber-8' }
    case 'hse':
      return { label: 'K3 / SIKA', color: 'teal-8' }
    default:
      return { label: cat.toUpperCase(), color: 'grey-7' }
  }
}

function onBastProjectSelect(projectId) {
  const p = projects.value.find(pr => pr.id === projectId)
  if (p) {
    bastForm.title = `Berita Acara Serah Terima I (BAST-1) ${p.name}`
    bastForm.firstParty = `Ir. Bambang Trihatmojo (Project Director ${p.client})`
  }
}

function openCreateBastDialog() {
  bastForm.projectId = projects.value[0]?.id || null
  if (bastForm.projectId) onBastProjectSelect(bastForm.projectId)
  bastDialog.value = true
}

function openCreateDocDialog() {
  openCreateBastDialog()
}

async function saveBast() {
  try {
    const selectedP = projects.value.find(pr => pr.id === bastForm.projectId)
    const now = new Date()
    const docNumber = `BAST/TSC/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(docs.value.length + 1).padStart(3, '0')}`

    const newDoc = await createDocument({
      docNumber,
      title: bastForm.title,
      category: 'bast',
      projectId: bastForm.projectId,
      projectName: selectedP?.name || 'Proyek Lapangan',
      clientName: selectedP?.client || 'Klien',
      firstParty: bastForm.firstParty,
      secondParty: bastForm.secondParty,
      signDate: bastForm.signDate,
      warrantyPeriod: bastForm.warrantyPeriod,
      description: bastForm.description,
      status: 'signed'
    })

    docs.value.unshift(newDoc)
    bastDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Dokumen BAST resmi berhasil diterbitkan!'
    })
    openPreview(newDoc)
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal menerbitkan BAST'
    })
  }
}

function openPreview(doc) {
  activeDoc.value = doc
  previewDialog.value = true
}

function confirmDelete(doc) {
  $q.dialog({
    title: 'Hapus Dokumen',
    message: `Hapus arsip dokumen ${doc.docNumber}?`,
    cancel: true
  }).onOk(async () => {
    await deleteDocument(doc.id)
    docs.value = docs.value.filter(d => d.id !== doc.id)
    $q.notify({ type: 'positive', message: 'Dokumen dihapus' })
  })
}

function printBast() {
  window.print()
}

function exportDocsToCsv() {
  if (!docs.value.length) {
    $q.notify({ type: 'warning', message: 'Belum ada data dokumen untuk diexport' })
    return
  }

  const headers = ['No', 'Nomor Dokumen', 'Nama Dokumen', 'Kategori', 'Proyek Terkait', 'Tanggal Terbit', 'Pembuat', 'Status']
  const rows = docs.value.map((d, i) => [
    i + 1,
    `"${d.docNumber || ''}"`,
    `"${(d.title || '').replace(/"/g, '""')}"`,
    `"${d.category || ''}"`,
    `"${(d.projectName || '').replace(/"/g, '""')}"`,
    `"${d.signDate || d.createdAt || ''}"`,
    `"${d.createdBy || ''}"`,
    `"${d.status || ''}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `Daftar_Dokumen_BAST_TSC_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    type: 'positive',
    icon: 'file_download',
    message: 'Daftar dokumen berhasil diexport ke CSV / Excel!'
  })
}

onMounted(async () => {
  try {
    const [docList, pList] = await Promise.all([getDocuments(), getProjects()])
    docs.value = docList || []
    projects.value = pList || []
  } finally {
    loading.value = false
  }
})
</script>
