<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <div class="row items-center justify-between q-mb-md">
      <q-btn
        flat
        no-caps
        dense
        icon="arrow_back"
        label="Kembali ke Daftar Proyek"
        class="text-grey-8"
        @click="router.push('/dashboard/projects')"
      />
      <div v-if="project" class="row q-gutter-xs">
        <q-btn
          outline
          no-caps
          color="primary"
          icon="inventory_2"
          label="Ajukan Material"
          to="/dashboard/material-requests"
        />
        <q-btn
          outline
          no-caps
          color="amber-9"
          icon="receipt_long"
          label="Buat Invoice"
          to="/dashboard/invoices"
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="amber-8" size="44px" />
      <div class="text-caption text-grey-6 q-mt-sm">Memuat data proyek...</div>
    </div>

    <!-- Tidak ditemukan -->
    <q-card v-else-if="!project" class="company-dash-card q-pa-xl text-center">
      <q-icon name="search_off" size="56px" color="grey-5" />
      <div class="text-h6 q-mt-md">Proyek tidak ditemukan</div>
      <div class="text-grey-7"
        >Proyek ini mungkin sudah dihapus atau tautan tidak valid.</div
      >
      <q-btn
        class="btn-gold q-mt-md"
        no-caps
        label="Kembali ke Daftar Proyek"
        @click="router.push('/dashboard/projects')"
      />
    </q-card>

    <!-- Detail Proyek -->
    <template v-else>
      <!-- Header Banner Proyek -->
      <q-card
        class="q-pa-lg q-mb-lg text-white"
        style="
          background: linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e293b 100%);
          border-radius: 16px;
          border: 1px solid #334155;
        "
      >
        <div class="row items-start justify-between q-col-gutter-md">
          <div class="col-12 col-md-8">
            <div class="row items-center q-gutter-xs q-mb-xs">
              <span class="company-badge q-px-sm q-py-xs" style="font-size: 0.72rem">
                {{ project.code }}
              </span>
              <q-badge
                :color="statusOf(project.status).color"
                :label="statusOf(project.status).label"
                class="q-px-sm text-weight-bold"
              />
              <span class="text-caption text-grey-4 q-ml-sm">
                {{ categoryLabel(project.category) }}
              </span>
            </div>
            <h1 class="text-h4 text-weight-bold text-white q-my-xs" style="line-height: 1.25">
              {{ project.name }}
            </h1>
            <div class="row items-center q-gutter-md text-grey-3 text-body2 q-mt-xs">
              <div>
                <q-icon name="business" size="16px" class="q-mr-xs text-amber-5" />
                Klien: <strong>{{ project.client }}</strong>
              </div>
              <div>
                <q-icon name="place" size="16px" class="q-mr-xs text-amber-5" />
                Lokasi: <strong>{{ project.location || 'Indonesia' }}</strong>
              </div>
              <div>
                <q-icon name="date_range" size="16px" class="q-mr-xs text-amber-5" />
                Jadwal: {{ formatDate(project.startDate) }} &ndash; {{ formatDate(project.endDate) }}
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4 text-left text-md-right">
            <div class="text-caption text-grey-4">Progres Fisik Lapangan</div>
            <div class="text-h3 text-weight-bold text-amber-5 q-my-none">
              {{ progressModel }}%
            </div>
            <q-linear-progress
              :value="progressModel / 100"
              color="amber-5"
              track-color="blue-grey-8"
              style="height: 8px; border-radius: 4px"
              class="q-mt-xs"
            />
          </div>
        </div>
      </q-card>

      <!-- Tabs Navigasi Proyek -->
      <q-card class="company-dash-card q-mb-md">
        <q-tabs
          v-model="tab"
          dense
          align="left"
          active-color="amber-8"
          indicator-color="amber-8"
          class="text-grey-7"
        >
          <q-tab name="overview" icon="dashboard" label="Ikhtisar & Progres" no-caps />
          <q-tab name="team" icon="group" :label="`Tim Proyek (${project.members?.length || 0})`" no-caps />
          <q-tab name="materials" icon="inventory_2" :label="`Material Request (${projectMRs.length})`" no-caps />
          <q-tab name="docs" icon="verified" :label="`Dokumen & BAST (${projectDocs.length})`" no-caps />
          <q-tab name="invoices" icon="receipt_long" :label="`Invoice & Termin (${projectInvoices.length})`" no-caps />
        </q-tabs>
      </q-card>

      <!-- Tab Panels -->
      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <!-- ================= TAB 1: IKHTISAR & PROGRES ================= -->
        <q-tab-panel name="overview" class="q-pa-none">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-7">
              <q-card class="company-dash-card q-pa-lg q-mb-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
                  Spesifikasi & Informasi Proyek
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-sm-6">
                    <div class="company-info-label">Kode Proyek</div>
                    <div class="company-info-value font-mono text-weight-bold text-primary">{{ project.code }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="company-info-label">Nama Klien / Pemilik</div>
                    <div class="company-info-value">{{ project.client }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="company-info-label">Kategori Pekerjaan</div>
                    <div class="company-info-value">{{ categoryLabel(project.category) }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="company-info-label">Lokasi Lapangan</div>
                    <div class="company-info-value">{{ project.location || '-' }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="company-info-label">Tanggal Mulai (Kickoff)</div>
                    <div class="company-info-value">{{ formatDate(project.startDate) }}</div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="company-info-label">Target Selesai (BAST)</div>
                    <div class="company-info-value">{{ formatDate(project.endDate) }}</div>
                  </div>
                </div>
              </q-card>

              <!-- Update Progres & Status -->
              <q-card class="company-dash-card q-pa-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
                  Kontrol Status & Progres Pekerjaan
                </div>
                <div class="row q-col-gutter-md q-mb-md">
                  <div class="col-12 col-sm-6">
                    <q-select
                      v-model="statusModel"
                      :options="PROJECT_STATUSES"
                      emit-value
                      map-options
                      outlined
                      dense
                      label="Status Proyek"
                      @update:model-value="saveStatus"
                    />
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-caption text-grey-7">Status Saat Ini:</div>
                    <q-badge
                      :color="statusOf(statusModel).color"
                      :label="statusOf(statusModel).label"
                      class="q-pa-xs q-px-sm text-weight-bold"
                    />
                  </div>
                </div>

                <div class="row items-center justify-between q-mt-md">
                  <div class="company-info-label">Progres Fisik Lapangan</div>
                  <div class="text-h6 text-weight-bold text-amber-8">{{ progressModel }}%</div>
                </div>
                <q-slider
                  v-model="progressModel"
                  :min="0"
                  :max="100"
                  :step="5"
                  color="amber-8"
                  label
                  @change="saveProgress"
                />
                <div class="text-caption text-grey-6">
                  Geser slider untuk memperbarui persentase penyelesaian fisik pekerjaan secara berkala.
                </div>
              </q-card>
            </div>

            <!-- Kolom Kanan: Ringkasan Cepat Proyek -->
            <div class="col-12 col-md-5">
              <q-card class="company-dash-card q-pa-lg q-mb-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
                  Ringkasan Kebutuhan & Dokumen
                </div>
                <div class="q-gutter-y-sm">
                  <div class="row items-center justify-between q-pa-sm bg-grey-1 rounded-borders">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="inventory_2" color="amber-9" size="18px" />
                      <span class="text-body2">Permintaan Material (MR)</span>
                    </div>
                    <span class="text-weight-bold">{{ projectMRs.length }} pengajuan</span>
                  </div>
                  <div class="row items-center justify-between q-pa-sm bg-grey-1 rounded-borders">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="verified" color="primary" size="18px" />
                      <span class="text-body2">Dokumen & BAST</span>
                    </div>
                    <span class="text-weight-bold">{{ projectDocs.length }} berkas</span>
                  </div>
                  <div class="row items-center justify-between q-pa-sm bg-grey-1 rounded-borders">
                    <div class="row items-center q-gutter-xs">
                      <q-icon name="receipt_long" color="positive" size="18px" />
                      <span class="text-body2">Faktur / Invoice</span>
                    </div>
                    <span class="text-weight-bold">{{ projectInvoices.length }} faktur</span>
                  </div>
                </div>
              </q-card>

              <!-- Panduan K3 / HSE Proyek -->
              <q-card class="company-dash-card q-pa-lg">
                <div class="row items-center q-gutter-xs q-mb-xs">
                  <q-icon name="health_and_safety" color="positive" size="20px" />
                  <span class="text-subtitle2 text-weight-bold">Standar Keselamatan (K3/HSE)</span>
                </div>
                <p class="text-caption text-grey-7 q-mb-none" style="line-height: 1.6">
                  Seluruh tim teknisi wajib mengenakan Alat Pelindung Diri (APD) standar: Helm keselamatan, rompi reflektor, sepatu safety, dan harness saat bekerja di ketinggian.
                </p>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- ================= TAB 2: TIM PROYEK ================= -->
        <q-tab-panel name="team" class="q-pa-none">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-7">
              <q-card class="company-dash-card q-pa-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
                  Daftar Personel Proyek
                  <span class="text-grey-6 text-body2">({{ project.members?.length || 0 }} Orang)</span>
                </div>

                <q-list v-if="project.members && project.members.length" separator>
                  <q-item
                    v-for="m in project.members"
                    :key="m.id"
                    class="q-px-none"
                  >
                    <q-item-section avatar>
                      <q-avatar color="navy-900" text-color="amber-5" size="40px" class="text-weight-bold">
                        {{ m.name.charAt(0).toUpperCase() }}
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ m.name }}</q-item-label>
                      <q-item-label caption class="text-primary text-weight-medium">{{ m.role }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete_outline"
                        color="negative"
                        @click="removeMemberById(m.id)"
                      >
                        <q-tooltip>Hapus dari Tim</q-tooltip>
                      </q-btn>
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-grey-6 text-body2 q-py-lg text-center">
                  <q-icon name="person_off" size="40px" color="grey-4" class="q-mb-xs" />
                  <div>Belum ada anggota tim terdaftar untuk proyek ini.</div>
                </div>
              </q-card>
            </div>

            <div class="col-12 col-md-5">
              <q-card class="company-dash-card q-pa-lg">
                <div class="text-subtitle1 text-weight-bold q-mb-md" style="color: #0f172a">
                  Tambah Personel ke Tim
                </div>
                <q-form @submit.prevent="addNewMember" class="q-gutter-md">
                  <q-input
                    v-model="newMember.name"
                    dense
                    outlined
                    label="Nama Personel"
                    placeholder="Contoh: Hendra Setiawan"
                    lazy-rules
                    :rules="[v => !!v || 'Nama wajib diisi']"
                  />
                  <q-select
                    v-model="newMember.role"
                    dense
                    outlined
                    label="Peran / Tanggung Jawab"
                    :options="[
                      'Project Manager',
                      'Site Engineer',
                      'Supervisor Lapangan',
                      'Safety Officer (HSE)',
                      'Lead Drafter',
                      'Teknisi Mekanikal',
                      'Teknisi Elektrikal',
                      'Teknisi Security System'
                    ]"
                    lazy-rules
                    :rules="[v => !!v || 'Peran wajib dipilih']"
                  />
                  <q-btn
                    type="submit"
                    class="btn-gold full-width"
                    no-caps
                    icon="person_add"
                    label="Tambahkan ke Proyek"
                  />
                </q-form>
              </q-card>
            </div>
          </div>
        </q-tab-panel>

        <!-- ================= TAB 3: MATERIAL REQUESTS ================= -->
        <q-tab-panel name="materials" class="q-pa-none">
          <q-card class="company-dash-card q-pa-lg">
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-subtitle1 text-weight-bold" style="color: #0f172a">
                  Permintaan Material Proyek Ini
                </div>
                <div class="text-caption text-grey-6">
                  Daftar pengajuan kebutuhan barang dan material untuk proyek ini
                </div>
              </div>
              <q-btn
                class="btn-gold"
                no-caps
                icon="add"
                label="Buat Pengajuan MR"
                to="/dashboard/material-requests"
              />
            </div>

            <q-table
              flat
              dense
              :rows="projectMRs"
              :columns="mrColumns"
              row-key="id"
              no-data-label="Belum ada permohonan material untuk proyek ini"
              class="company-dash-table"
            >
              <template #body-cell-code="props">
                <q-td :props="props" class="text-weight-bold text-primary">
                  {{ props.row.code }}
                </q-td>
              </template>
              <template #body-cell-priority="props">
                <q-td :props="props">
                  <q-chip
                    dense
                    size="sm"
                    :color="props.row.priority === 'urgent' ? 'red-1' : 'grey-2'"
                    :text-color="props.row.priority === 'urgent' ? 'red-9' : 'grey-8'"
                  >
                    {{ props.row.priority === 'urgent' ? 'URGENT' : 'Normal' }}
                  </q-chip>
                </q-td>
              </template>
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-chip
                    dense
                    size="sm"
                    :color="approvalStatusOf(props.row.status).color"
                    text-color="white"
                  >
                    {{ approvalStatusOf(props.row.status).label }}
                  </q-chip>
                </q-td>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>

        <!-- ================= TAB 4: DOKUMEN & BAST ================= -->
        <q-tab-panel name="docs" class="q-pa-none">
          <q-card class="company-dash-card q-pa-lg">
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-subtitle1 text-weight-bold" style="color: #0f172a">
                  Dokumen Teknis & BAST Proyek
                </div>
                <div class="text-caption text-grey-6">
                  Berita Acara Serah Terima, Gambar As-Built, dan dokumen legal
                </div>
              </div>
              <q-btn
                class="btn-gold"
                no-caps
                icon="verified"
                label="Buka Manajemen Dokumen & BAST"
                to="/dashboard/documents"
              />
            </div>

            <q-list v-if="projectDocs.length" separator>
              <q-item v-for="doc in projectDocs" :key="doc.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar
                    :color="doc.category === 'bast' ? 'green-1' : 'blue-1'"
                    :text-color="doc.category === 'bast' ? 'green-8' : 'primary'"
                    icon="description"
                  />
                </q-item-section>
                <q-item-section>
                  <div class="row items-center q-gutter-xs">
                    <span class="text-caption text-weight-bold text-primary">{{ doc.docNumber }}</span>
                    <q-badge
                      dense
                      :color="doc.status === 'signed' ? 'positive' : 'grey-7'"
                      :label="doc.status === 'signed' ? 'Ditandatangani' : 'Draft'"
                    />
                  </div>
                  <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ doc.title }}</div>
                  <div class="text-caption text-grey-6">{{ doc.description }}</div>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    flat
                    dense
                    no-caps
                    color="primary"
                    icon="visibility"
                    label="Lihat"
                    to="/dashboard/documents"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-py-xl text-grey-6">
              <q-icon name="folder_open" size="48px" color="grey-4" class="q-mb-xs" />
              <div>Belum ada dokumen BAST atau gambar teknis untuk proyek ini.</div>
              <q-btn
                flat
                color="primary"
                no-caps
                label="Buat Dokumen Sekarang →"
                to="/dashboard/documents"
                class="q-mt-sm"
              />
            </div>
          </q-card>
        </q-tab-panel>

        <!-- ================= TAB 5: INVOICES & TERMIN ================= -->
        <q-tab-panel name="invoices" class="q-pa-none">
          <q-card class="company-dash-card q-pa-lg">
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-subtitle1 text-weight-bold" style="color: #0f172a">
                  Penagihan & Termin Pembayaran
                </div>
                <div class="text-caption text-grey-6">
                  Daftar faktur / invoice tagihan kepada klien
                </div>
              </div>
              <q-btn
                class="btn-gold"
                no-caps
                icon="add"
                label="Buat Invoice Baru"
                to="/dashboard/invoices"
              />
            </div>

            <q-list v-if="projectInvoices.length" separator>
              <q-item v-for="inv in projectInvoices" :key="inv.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar
                    :color="inv.status === 'paid' ? 'green-1' : 'amber-1'"
                    :text-color="inv.status === 'paid' ? 'green-8' : 'amber-9'"
                    icon="receipt"
                  />
                </q-item-section>
                <q-item-section>
                  <div class="row items-center q-gutter-xs">
                    <span class="text-caption text-weight-bold text-primary">{{ inv.invoiceNumber }}</span>
                    <q-badge
                      dense
                      :color="inv.status === 'paid' ? 'positive' : 'amber-8'"
                      :label="inv.status === 'paid' ? 'LUNAS' : 'MENUNGGU PEMBAYARAN'"
                    />
                  </div>
                  <div class="text-subtitle2 text-weight-bold q-mt-xs">{{ inv.notes }}</div>
                  <div class="text-caption text-grey-6">
                    Jatuh Tempo: {{ formatDate(inv.dueDate) }}
                  </div>
                </q-item-section>
                <q-item-section side class="text-right">
                  <div class="text-h6 text-weight-bold text-navy-950">
                    Rp {{ Number(inv.total).toLocaleString('id-ID') }}
                  </div>
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    color="primary"
                    label="Lihat Invoice →"
                    to="/dashboard/invoices"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-center q-py-xl text-grey-6">
              <q-icon name="receipt_long" size="48px" color="grey-4" class="q-mb-xs" />
              <div>Belum ada invoice penagihan untuk proyek ini.</div>
              <q-btn
                flat
                color="primary"
                no-caps
                label="Buat Faktur / Invoice Baru →"
                to="/dashboard/invoices"
                class="q-mt-sm"
              />
            </div>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </template>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {
  getProject,
  updateProject,
  addMember,
  removeMember
} from '/src/services/projects.service.js'
import { getMaterialRequests } from '/src/services/material-requests.service.js'
import { getDocuments } from '/src/services/documents.service.js'
import { getInvoices } from '/src/services/invoices.service.js'
import { approvalStatusOf } from '/src/config/approval.js'
import {
  PROJECT_STATUSES,
  statusOf,
  categoryLabel,
  formatDate
} from '/src/config/projects.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const tab = ref('overview')
const project = ref(null)
const loading = ref(true)
const statusModel = ref('')
const progressModel = ref(0)

const allMRs = ref([])
const allDocs = ref([])
const allInvoices = ref([])

const projectMRs = computed(() => {
  if (!project.value) return []
  return allMRs.value.filter(mr => mr.projectId === project.value.id)
})

const projectDocs = computed(() => {
  if (!project.value) return []
  return allDocs.value.filter(d => d.projectId === project.value.id)
})

const projectInvoices = computed(() => {
  if (!project.value) return []
  return allInvoices.value.filter(inv => inv.projectId === project.value.id)
})

const mrColumns = [
  { name: 'code', label: 'Kode MR', field: 'code', align: 'left' },
  { name: 'requester', label: 'Pengaju', field: 'requesterName', align: 'left' },
  { name: 'neededDate', label: 'Tgl Dibutuhkan', field: 'neededDate', align: 'left' },
  { name: 'priority', label: 'Prioritas', field: 'priority', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' }
]

function applyProject(p) {
  project.value = p
  statusModel.value = p?.status ?? ''
  progressModel.value = p?.progress ?? 0
}

onMounted(async () => {
  try {
    const [pData, mrData, docData, invData] = await Promise.all([
      getProject(route.params.id),
      getMaterialRequests(),
      getDocuments(),
      getInvoices()
    ])
    applyProject(pData)
    allMRs.value = mrData || []
    allDocs.value = docData || []
    allInvoices.value = invData || []
  } finally {
    loading.value = false
  }
})

async function patch(data, successMessage) {
  try {
    applyProject(await updateProject(project.value.id, data))
    $q.notify({ type: 'positive', message: successMessage })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal menyimpan' })
  }
}

const saveStatus = value => patch({ status: value }, 'Status diperbarui')
const saveProgress = value => patch({ progress: value }, 'Progres diperbarui')

// ---------- Anggota tim ----------
const newMember = reactive({ name: '', role: '' })

async function addNewMember() {
  try {
    applyProject(
      await addMember(project.value.id, {
        name: newMember.name,
        role: newMember.role
      })
    )
    newMember.name = ''
    newMember.role = ''
    $q.notify({ type: 'positive', message: 'Anggota berhasil ditambahkan ke tim proyek' })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal menambah anggota'
    })
  }
}

async function removeMemberById(memberId) {
  try {
    applyProject(await removeMember(project.value.id, memberId))
    $q.notify({ type: 'positive', message: 'Anggota dihapus dari tim' })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Gagal menghapus anggota'
    })
  }
}
</script>
