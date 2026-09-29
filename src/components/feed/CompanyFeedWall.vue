<template>
  <div class="company-feed-wall">
    <!-- Header Feed / Sapaan -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-subtitle1 text-weight-bold text-navy-950 row items-center">
          <q-icon name="campaign" color="amber-9" size="22px" class="q-mr-xs" />
          <span>Papan Informasi &amp; Diskusi Lapangan</span>
        </div>
        <div class="text-caption text-grey-7">
          Pengumuman resmi manajemen, instruksi K3, dan koordinasi teknis tim.
        </div>
      </div>

      <!-- Tombol Buat Postingan (Untuk Admin / Manager / PM) -->
      <q-btn
        v-if="canCreatePost"
        class="btn-gold"
        no-caps
        icon="add_comment"
        label="Buat Pengumuman"
        @click="createPostDialog = true"
      />
    </div>

    <!-- Filter Kategori Feed -->
    <div class="row q-gutter-xs q-mb-md overflow-auto no-wrap q-py-xs">
      <q-chip
        v-for="cat in categories"
        :key="cat.value"
        clickable
        :color="activeCategory === cat.value ? 'navy-900' : 'grey-2'"
        :text-color="activeCategory === cat.value ? 'amber-5' : 'dark'"
        class="text-weight-medium text-caption"
        @click="activeCategory = cat.value"
      >
        <q-icon :name="cat.icon" size="16px" class="q-mr-xs" />
        {{ cat.label }}
      </q-chip>
    </div>

    <!-- Feed List Postingan -->
    <div v-if="loading" class="text-center q-pa-lg">
      <q-spinner-dots color="amber-8" size="40px" />
      <div class="text-caption text-grey-6 q-mt-xs">Memuat informasi terkini...</div>
    </div>

    <div v-else-if="filteredPosts.length" class="q-gutter-y-md">
      <q-card
        v-for="post in filteredPosts"
        :key="post.id"
        class="feed-card shadow-1"
        style="border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;"
      >
        <!-- Card Header: Author & Kategori -->
        <q-card-section class="q-pb-sm">
          <div class="row items-center justify-between no-wrap">
            <div class="row items-center no-wrap q-gutter-x-sm">
              <q-avatar
                :color="getAuthorColor(post.author)"
                text-color="white"
                size="42px"
                class="text-weight-bold"
              >
                {{ post.author.name.charAt(0).toUpperCase() }}
              </q-avatar>
              <div>
                <div class="text-weight-bold text-navy-950 row items-center">
                  <span>{{ post.author.name }}</span>
                  <q-badge
                    v-if="post.author.role === 'admin' || post.author.role === 'manager'"
                    color="amber-8"
                    text-color="dark"
                    class="q-ml-xs text-weight-bold"
                    style="font-size: 10px;"
                  >
                    MANAJEMEN
                  </q-badge>
                </div>
                <div class="text-caption text-grey-6" style="font-size: 11px;">
                  {{ post.author.position }} &bull; {{ timeAgo(post.createdAt) }}
                </div>
              </div>
            </div>

            <!-- Kategori Badge -->
            <q-badge
              :color="getCategoryBadge(post.category).color"
              :text-color="getCategoryBadge(post.category).textColor"
              class="q-px-sm q-py-xs text-weight-bold"
            >
              <q-icon :name="getCategoryBadge(post.category).icon" size="14px" class="q-mr-xs" />
              {{ getCategoryBadge(post.category).label }}
            </q-badge>
          </div>
        </q-card-section>

        <!-- Card Body: Judul, Konten, Tagged User & Proyek -->
        <q-card-section class="q-py-none">
          <div class="text-subtitle1 text-weight-bold text-navy-950 q-mb-xs">
            {{ post.title }}
          </div>
          <div class="text-body2 text-grey-9" style="line-height: 1.6; white-space: pre-line;">
            {{ post.content }}
          </div>

          <!-- Tagged Karyawan & Proyek -->
          <div class="row items-center q-gutter-xs q-mt-sm">
            <q-chip
              v-if="post.projectName"
              dense
              outline
              color="primary"
              icon="business"
              style="font-size: 11px;"
            >
              {{ post.projectName }}
            </q-chip>
            <q-chip
              v-for="userTag in post.taggedUsers || []"
              :key="userTag"
              dense
              color="amber-1"
              text-color="amber-10"
              icon="alternate_email"
              style="font-size: 11px; font-weight: 600;"
            >
              {{ userTag }}
            </q-chip>
          </div>
        </q-card-section>

        <!-- Card Actions: Like & Komentar Toggle -->
        <q-card-actions class="q-px-md q-pt-md q-pb-sm justify-between items-center" style="border-top: 1px solid #f1f5f9; margin-top: 12px;">
          <div class="row items-center q-gutter-x-sm">
            <q-btn
              flat
              dense
              no-caps
              :color="isLiked(post) ? 'negative' : 'grey-7'"
              :icon="isLiked(post) ? 'favorite' : 'favorite_border'"
              :label="`${post.likes?.length || 0} Suka`"
              @click="handleLike(post)"
            />
            <q-btn
              flat
              dense
              no-caps
              color="grey-7"
              icon="chat_bubble_outline"
              :label="`${post.comments?.length || 0} Tanggapan`"
              @click="toggleComments(post.id)"
            />
          </div>

          <div class="text-caption text-grey-5" style="font-size: 11px;">
            PT. TSC Internal Wall
          </div>
        </q-card-actions>

        <!-- Thread Komentar / Diskusi (Expandable) -->
        <div v-if="expandedPosts[post.id]" class="bg-grey-1 q-pa-md" style="border-top: 1px solid #e2e8f0;">
          <!-- List Komentar yang Sudah Ada -->
          <div v-if="post.comments && post.comments.length" class="q-gutter-y-sm q-mb-md">
            <div
              v-for="c in post.comments"
              :key="c.id"
              class="row items-start no-wrap q-gutter-x-sm bg-white q-pa-sm rounded-borders shadow-1"
            >
              <q-avatar size="28px" color="navy-900" text-color="amber-5" class="text-caption text-weight-bold">
                {{ c.author.name.charAt(0).toUpperCase() }}
              </q-avatar>
              <div style="flex: 1;">
                <div class="row items-center justify-between">
                  <span class="text-caption text-weight-bold text-navy-950">{{ c.author.name }}</span>
                  <span class="text-caption text-grey-5" style="font-size: 10px;">{{ timeAgo(c.createdAt) }}</span>
                </div>
                <div class="text-caption text-grey-6" style="font-size: 10px;">{{ c.author.position }}</div>
                <div class="text-body2 text-grey-9 q-mt-xs" style="font-size: 12px; line-height: 1.4;">
                  {{ c.text }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-caption text-grey-6 text-center q-py-xs q-mb-sm">
            Belum ada diskusi pada postingan ini. Jadilah yang pertama menanggapi!
          </div>

          <!-- Input Tulis Komentar -->
          <div class="row items-center no-wrap q-gutter-x-sm">
            <q-avatar size="32px" color="amber-8" text-color="dark" class="text-weight-bold">
              {{ currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U' }}
            </q-avatar>
            <q-input
              v-model="commentInputs[post.id]"
              dense
              outlined
              bg-color="white"
              placeholder="Tulis tanggapan atau konfirmasi lapangan..."
              style="flex: 1;"
              @keyup.enter="submitComment(post.id)"
            >
              <template #append>
                <q-btn
                  flat
                  dense
                  round
                  color="primary"
                  icon="send"
                  :disable="!commentInputs[post.id]?.trim()"
                  @click="submitComment(post.id)"
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-card>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center q-pa-xl text-grey-6">
      <q-icon name="feed" size="48px" color="grey-4" class="q-mb-sm" />
      <div class="text-body2">Tidak ada pengumuman pada kategori ini.</div>
    </div>

    <!-- ================= MODAL BUAT POSTINGAN ADMIN ================= -->
    <q-dialog v-model="createPostDialog">
      <q-card style="width: 580px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-h6 text-weight-bold text-navy-950">
            Terbitkan Pengumuman / Briefing Lapangan
          </div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="submitNewPost">
          <q-card-section class="q-pt-md q-gutter-y-sm">
            <q-select
              v-model="newPostForm.category"
              :options="categoryOptions"
              emit-value
              map-options
              dense
              outlined
              label="Kategori Informasi"
            />

            <q-input
              v-model="newPostForm.title"
              dense
              outlined
              label="Judul Pengumuman"
              placeholder="Contoh: Instruksi Penggunaan APD / Update Proyek"
              :rules="[v => !!v || 'Judul wajib diisi']"
            />

            <q-input
              v-model="newPostForm.content"
              type="textarea"
              rows="4"
              dense
              outlined
              label="Isi Pengumuman / Instruksi Lengkap"
              placeholder="Jelaskan detail instruksi teknis, briefing keselamatan kerja, atau pengumuman resmi..."
              :rules="[v => !!v || 'Isi pengumuman wajib diisi']"
            />

            <q-select
              v-model="newPostForm.projectName"
              :options="projectNamesList"
              dense
              outlined
              label="Terkait Proyek (Opsional)"
            />

            <q-select
              v-model="newPostForm.taggedUsers"
              multiple
              use-chips
              :options="availableUserTags"
              dense
              outlined
              label="Tag / Mention Karyawan Terkait"
              hint="Karyawan yang di-tag akan diprioritaskan mendapat perhatian khusus"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" v-close-popup no-caps />
            <q-btn
              type="submit"
              class="btn-gold"
              icon="send"
              label="Terbitkan Sekarang"
              no-caps
              :loading="posting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from '/src/composables/useAuth.js'
import {
  getFeedPosts,
  createFeedPost,
  toggleLikePost,
  addPostComment
} from '/src/services/feed.service.js'

const $q = useQuasar()
const { user: currentUser } = useAuth()

const loading = ref(true)
const posts = ref([])
const activeCategory = ref('all')
const expandedPosts = ref({ 1: true }) // Buka komentar postingan pertama secara default
const commentInputs = ref({})
const createPostDialog = ref(false)
const posting = ref(false)

const canCreatePost = computed(() => {
  return ['admin', 'manager', 'pm'].includes(currentUser.value?.role)
})

const categories = [
  { label: 'Semua Feed', value: 'all', icon: 'dashboard' },
  { label: 'K3 & Safety', value: 'safety', icon: 'health_and_safety' },
  { label: 'Pengumuman', value: 'announcement', icon: 'campaign' },
  { label: 'Milestone Proyek', value: 'milestone', icon: 'emoji_events' },
  { label: 'Teknis & Logistik', value: 'technical', icon: 'engineering' }
]

const categoryOptions = [
  { label: 'K3 & Keselamatan Lapangan', value: 'safety' },
  { label: 'Pengumuman Resmi Perusahaan', value: 'announcement' },
  { label: 'Milestone & Serah Terima Proyek', value: 'milestone' },
  { label: 'Instruksi Teknis & Logistik', value: 'technical' }
]

const projectNamesList = [
  'Seluruh Proyek Lapangan',
  'Instalasi CCTV & Access Control Puri Mansion',
  'CCTV Gedung Perkantoran Sudirman',
  'Apartemen Sunter Jakarta Utara',
  'Gudang Logistik MM2100 Bekasi',
  'Workshop & Kantor Pusat TSC'
]

const availableUserTags = [
  'Staf Teknisi',
  'Ahmad Dani (Teknisi)',
  'Budi Santoso (Leader)',
  'Bambang Trihatmojo, S.T.',
  'Hendro Wijaya, S.Kom.'
]

const newPostForm = ref({
  category: 'safety',
  title: '',
  content: '',
  projectName: 'Seluruh Proyek Lapangan',
  taggedUsers: []
})

const filteredPosts = computed(() => {
  if (activeCategory.value === 'all') return posts.value
  return posts.value.filter(p => p.category === activeCategory.value)
})

async function loadFeed() {
  loading.value = true
  try {
    posts.value = await getFeedPosts()
  } finally {
    loading.value = false
  }
}

function getAuthorColor(author) {
  if (author.role === 'admin') return 'navy-950'
  if (author.role === 'manager') return 'amber-9'
  if (author.role === 'pm') return 'primary'
  return 'teal-8'
}

function getCategoryBadge(cat) {
  switch (cat) {
    case 'safety':
      return { label: 'K3 Safety', color: 'red-1', textColor: 'negative', icon: 'warning' }
    case 'milestone':
      return { label: 'Milestone', color: 'green-1', textColor: 'positive', icon: 'emoji_events' }
    case 'technical':
      return { label: 'Teknis', color: 'blue-1', textColor: 'primary', icon: 'engineering' }
    default:
      return { label: 'Info Kantor', color: 'amber-1', textColor: 'amber-9', icon: 'campaign' }
  }
}

function isLiked(post) {
  if (!currentUser.value) return false
  return post.likes && post.likes.includes(Number(currentUser.value.id))
}

async function handleLike(post) {
  if (!currentUser.value) return
  try {
    const updated = await toggleLikePost(post.id, currentUser.value.id)
    post.likes = updated.likes
  } catch (err) {
    console.error(err)
  }
}

function toggleComments(postId) {
  expandedPosts.value[postId] = !expandedPosts.value[postId]
}

async function submitComment(postId) {
  const text = commentInputs.value[postId]?.trim()
  if (!text || !currentUser.value) return

  try {
    const updated = await addPostComment(postId, {
      user: currentUser.value,
      text
    })
    const post = posts.value.find(p => p.id === postId)
    if (post) {
      post.comments = updated.comments
    }
    commentInputs.value[postId] = ''
    expandedPosts.value[postId] = true
    $q.notify({ type: 'positive', message: 'Tanggapan terkirim ke diskusi tim' })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal mengirim komentar' })
  }
}

async function submitNewPost() {
  if (!currentUser.value) return
  posting.value = true
  try {
    await createFeedPost({
      author: currentUser.value,
      category: newPostForm.value.category,
      title: newPostForm.value.title,
      content: newPostForm.value.content,
      projectName: newPostForm.value.projectName,
      taggedUsers: newPostForm.value.taggedUsers
    })
    $q.notify({
      type: 'positive',
      icon: 'campaign',
      message: 'Pengumuman berhasil diterbitkan ke portal karyawan!'
    })
    createPostDialog.value = false
    newPostForm.value = {
      category: 'safety',
      title: '',
      content: '',
      projectName: 'Seluruh Proyek Lapangan',
      taggedUsers: []
    }
    await loadFeed()
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal menerbitkan postingan' })
  } finally {
    posting.value = false
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / (60 * 1000))
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} mnt lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

onMounted(() => {
  loadFeed()
})
</script>

<style scoped>
.feed-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.feed-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}
</style>
