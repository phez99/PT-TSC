// ============================================================
// FEED & DISCUSSION SERVICE (Social Company Bulletin)
// Menampung postingan pengumuman, briefing K3, diskusi lapangan,
// tagging karyawan (@nama), dan interaksi like/komentar.
// ============================================================

const STORAGE_KEY = 'tsc_company_feed'

const SEED_FEED = [
  {
    id: 1,
    author: {
      id: 2,
      name: 'Bambang Trihatmojo, S.T.',
      position: 'Manager Operasional',
      role: 'manager',
      avatarColor: 'navy-900'
    },
    category: 'safety', // 'safety' | 'announcement' | 'milestone' | 'technical'
    title: 'Wajib K3 & APD Lengkap di Proyek Sudirman',
    content: 'Mengingat sedang berlangsung inspeksi K3 dan pekerjaan di ketinggian pada instalasi CCTV lantai 25, seluruh tim teknisi lapangan diwajibkan mengenakan Full Body Harness, Safety Helmet, dan Rompi Reflektor standar. Mohon koordinasi dengan pengawas K3 setempat.',
    taggedUsers: ['Staf Teknisi', 'Ahmad Dani'],
    projectName: 'CCTV Gedung Perkantoran Sudirman',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 jam lalu
    likes: [1, 5],
    comments: [
      {
        id: 101,
        author: {
          id: 5,
          name: 'Staf Teknisi',
          position: 'Teknisi Lapangan',
          role: 'staff'
        },
        text: 'Siap Pak Bambang, seluruh APD dan lanyard ganda sudah dicek bersama supervisor sebelum naik tower.',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
      },
      {
        id: 102,
        author: {
          id: 3,
          name: 'Hendro Wijaya, S.Kom.',
          position: 'Project Manager (PM)',
          role: 'pm'
        },
        text: 'Pastikan juga form SIKA (Surat Izin Kerja Aman) sudah ditandatangani oleh Manajemen Gedung.',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 2,
    author: {
      id: 1,
      name: 'Ir. Hendra Gunawan',
      position: 'Direktur Utama',
      role: 'admin',
      avatarColor: 'amber-9'
    },
    category: 'milestone',
    title: 'Apresiasi: BAST-1 Apartemen Sunter Sukses Ditandatangani!',
    content: 'Alhamdulillah, terima kasih banyak atas kerja keras tim lapangan dan logistik. Berita Acara Serah Terima Pertama (BAST-1) proyek instalasi MEP Apartemen Sunter telah resmi disetujui klien dengan nilai kepuasan memuaskan tanpa catatan defect.',
    taggedUsers: ['Staf Teknisi', 'Hendro Wijaya, S.Kom.'],
    projectName: 'Apartemen Sunter Jakarta Utara',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    likes: [1, 2, 3, 4, 5],
    comments: [
      {
        id: 201,
        author: {
          id: 5,
          name: 'Staf Teknisi',
          position: 'Teknisi Lapangan',
          role: 'staff'
        },
        text: 'Terima kasih atas bimbingan dan dukungannya Pak Direktur! Siap gas proyek selanjutnya.',
        createdAt: new Date(Date.now() - 15 * 3600 * 1000).toISOString()
      }
    ]
  },
  {
    id: 3,
    author: {
      id: 4,
      name: 'Siti Rahmawati, S.E.',
      position: 'Finance & Accounting',
      role: 'finance',
      avatarColor: 'blue-9'
    },
    category: 'announcement',
    title: 'Batas Pengajuan Klaim Nota & Reimburs Lapangan',
    content: 'Diingatkan kepada seluruh teknisi yang bertugas luar kota/lapangan, seluruh bukti struk bensin, tol, dan konsumsi lembur bulan berjalan wajib diinput ke sistem sebelum tanggal 28 pukul 17:00 WIB agar dapat diproses penggajian tepat waktu.',
    taggedUsers: ['Staf Teknisi'],
    projectName: 'Seluruh Proyek',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    likes: [2, 5],
    comments: []
  }
]

function readFeed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading feed:', e)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_FEED))
  return JSON.parse(JSON.stringify(SEED_FEED))
}

function writeFeed(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function getFeedPosts() {
  await delay(100)
  return readFeed().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function createFeedPost(data) {
  await delay(150)
  const posts = readFeed()
  const id = posts.reduce((max, p) => Math.max(max, p.id), 0) + 1
  const newPost = {
    id,
    author: {
      id: data.author.id,
      name: data.author.name,
      position: data.author.position,
      role: data.author.role
    },
    category: data.category || 'announcement',
    title: data.title,
    content: data.content,
    taggedUsers: data.taggedUsers || [],
    projectName: data.projectName || 'Umum / Seluruh Proyek',
    createdAt: new Date().toISOString(),
    likes: [],
    comments: []
  }
  posts.unshift(newPost)
  writeFeed(posts)
  return newPost
}

export async function toggleLikePost(postId, userId) {
  await delay(50)
  const posts = readFeed()
  const post = posts.find(p => p.id === Number(postId))
  if (!post) throw new Error('Postingan tidak ditemukan')
  
  const uId = Number(userId)
  const idx = post.likes.indexOf(uId)
  if (idx === -1) {
    post.likes.push(uId)
  } else {
    post.likes.splice(idx, 1)
  }
  writeFeed(posts)
  return post
}

export async function addPostComment(postId, commentData) {
  await delay(100)
  const posts = readFeed()
  const post = posts.find(p => p.id === Number(postId))
  if (!post) throw new Error('Postingan tidak ditemukan')

  const commentId = (post.comments || []).reduce((max, c) => Math.max(max, c.id), 0) + 1
  const newComment = {
    id: commentId,
    author: {
      id: commentData.user.id,
      name: commentData.user.name,
      position: commentData.user.position,
      role: commentData.user.role
    },
    text: commentData.text,
    createdAt: new Date().toISOString()
  }

  if (!post.comments) post.comments = []
  post.comments.push(newComment)
  writeFeed(posts)
  return post
}
