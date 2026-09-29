<template>
  <q-page class="q-pa-lg">
    <q-btn
      flat
      no-caps
      dense
      icon="arrow_back"
      label="Kembali ke daftar"
      class="q-mb-md"
      @click="router.push('/dashboard/material-requests')"
    />

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="amber-8" size="40px" />
    </div>

    <q-card v-else-if="!request" class="company-dash-card q-pa-xl text-center">
      <q-icon name="search_off" size="48px" color="grey-5" />
      <div class="text-h6 q-mt-md">Pengajuan tidak ditemukan</div>
    </q-card>

    <q-card v-else-if="unauthorized" class="company-dash-card q-pa-xl text-center">
      <q-icon name="lock" size="48px" color="negative" />
      <div class="text-h6 q-mt-md text-negative">Akses Dibatasi</div>
      <div class="text-grey-7 q-mt-xs">
        Sebagai staf teknisi, Anda hanya berwenang melihat detail permohonan material yang Anda ajukan sendiri.
      </div>
      <q-btn
        class="btn-gold q-mt-md"
        no-caps
        label="Kembali ke Permintaan Saya"
        @click="router.push('/dashboard/material-requests')"
      />
    </q-card>

    <template v-else>
      <div class="row items-start justify-between q-mb-md">
        <div>
          <div class="text-caption text-grey-7">{{ request.code }}</div>
          <div class="text-h5 text-weight-bold" style="color: #0f172a">
            {{ project?.name ?? 'Proyek tidak ditemukan' }}
          </div>
          <div class="text-grey-7 text-body2">
            Diajukan oleh {{ request.requesterName }}
            <span v-if="request.requesterPosition"
              >— {{ request.requesterPosition }}</span
            >
          </div>
        </div>
        <q-badge
          :color="approvalStatusOf(request.status).color"
          :label="approvalStatusOf(request.status).label"
          class="q-pa-sm"
        />
      </div>

      <div class="row q-col-gutter-lg">
        <!-- ================= KIRI: Detail & Item ================= -->
        <div class="col-12 col-md-7">
          <q-card class="company-dash-card q-pa-lg q-mb-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <div class="company-info-label">Dibutuhkan Tanggal</div>
                <div class="company-info-value">{{
                  formatDate(request.neededDate)
                }}</div>
              </div>
              <div class="col-12 col-sm-6">
                <div class="company-info-label">Prioritas</div>
                <div class="company-info-value">{{
                  priorityLabel(request.priority)
                }}</div>
              </div>
              <div class="col-12" v-if="request.notes">
                <div class="company-info-label">Catatan</div>
                <div class="company-info-value">{{ request.notes }}</div>
              </div>
            </div>
          </q-card>

          <q-card class="company-dash-card q-pa-lg">
            <div class="text-subtitle1 text-weight-bold q-mb-md"
              >Daftar Material</div
            >
            <q-list separator>
              <q-item
                v-for="item in request.items"
                :key="item.id"
                class="q-px-none"
              >
                <q-item-section>{{ item.name }}</q-item-section>
                <q-item-section side
                  >{{ item.qty }} {{ item.unit }}</q-item-section
                >
              </q-item>
            </q-list>
          </q-card>
        </div>

        <!-- ================= KANAN: Aksi & Riwayat ================= -->
        <div class="col-12 col-md-5">
          <!-- Aksi persetujuan, hanya tampil kalau role user berhak -->
          <q-card
            v-if="actions.length"
            class="company-dash-card q-pa-lg q-mb-lg"
          >
            <div class="text-subtitle1 text-weight-bold q-mb-md">Aksi</div>

            <q-input
              v-if="needsNote"
              v-model="note"
              type="textarea"
              autogrow
              outlined
              dense
              label="Catatan (wajib untuk penolakan)"
              class="q-mb-md"
            />

            <div class="q-gutter-sm">
              <q-btn
                v-for="a in actions"
                :key="a"
                :color="APPROVAL_ACTIONS[a].color"
                :icon="APPROVAL_ACTIONS[a].icon"
                no-caps
                unelevated
                class="full-width"
                :label="APPROVAL_ACTIONS[a].label"
                :loading="submitting === a"
                @click="runAction(a)"
              />
            </div>
          </q-card>

          <q-card class="company-dash-card q-pa-lg">
            <div class="text-subtitle1 text-weight-bold q-mb-md">Riwayat</div>
            <q-timeline color="amber-8">
              <q-timeline-entry
                v-for="(h, i) in [...request.history].reverse()"
                :key="i"
                :title="approvalStatusOf(h.status).label"
                :subtitle="`${h.by} • ${formatDateTime(h.at)}`"
              >
                <div v-if="h.note" class="text-body2 text-grey-8">{{
                  h.note
                }}</div>
              </q-timeline-entry>
            </q-timeline>
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'
import { getProject } from '/src/services/projects.service.js'
import {
  getMaterialRequest,
  applyAction
} from '/src/services/material-requests.service.js'
import {
  approvalStatusOf,
  availableActions,
  APPROVAL_ACTIONS,
  formatDateTime
} from '/src/config/approval.js'
import { priorityLabel } from '/src/config/material.js'
import { formatDate } from '/src/config/projects.js'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const request = ref(null)
const project = ref(null)
const loading = ref(true)
const note = ref('')
const submitting = ref(null)

const isStaff = computed(() => user.value?.role === 'staff')
const unauthorized = computed(() => {
  if (!request.value || !user.value) return false
  if (isStaff.value) {
    const isOwner =
      Number(request.value.requesterId) === Number(user.value.id) ||
      (!request.value.requesterId && request.value.requesterName === user.value.name)
    return !isOwner
  }
  return false
})

const actions = computed(() =>
  request.value && !unauthorized.value ? availableActions(request.value.status, user.value?.role) : []
)
const needsNote = computed(() =>
  actions.value.some(a => APPROVAL_ACTIONS[a].needsNote)
)

async function load() {
  loading.value = true
  try {
    request.value = await getMaterialRequest(route.params.id)
    if (request.value) {
      project.value = await getProject(request.value.projectId)
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)

async function runAction(action) {
  if (APPROVAL_ACTIONS[action].needsNote && !note.value.trim()) {
    $q.notify({ type: 'negative', message: 'Catatan wajib diisi' })
    return
  }

  submitting.value = action
  try {
    request.value = await applyAction(
      request.value.id,
      action,
      user.value,
      note.value
    )
    note.value = ''
    $q.notify({
      type: 'positive',
      message: `Status diubah menjadi "${approvalStatusOf(request.value.status).label}"`
    })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memproses' })
  } finally {
    submitting.value = null
  }
}
</script>
