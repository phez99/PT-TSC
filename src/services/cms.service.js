// ============================================================
// CMS SERVICE (Content Management System Website Utama)
// Mengelola konten hero, profil, layanan, portofolio, dan kontak
// ============================================================

const STORAGE_KEY = 'tsc_landing_cms'

export const DEFAULT_CMS_CONTENT = {
  hero: {
    badgeText: 'Security System, MEP & Advertising Solutions',
    titlePrefix: 'Solusi Terintegrasi',
    titleHighlight: 'Security System & MEP Terpercaya',
    description:
      'PT. Trimitra Solusindo Cemerlang menghadirkan solusi terintegrasi di bidang Security System, Mechanical, Electrical & Plumbing (MEP), Advertising, serta Pengadaan Material — dengan mengedepankan profesionalisme, kualitas, dan kepuasan mitra.',
    ctaPrimaryLabel: 'Lihat Layanan Kami',
    ctaSecondaryLabel: 'Hubungi Kami',
    backgroundImage: '/01.jpg',
    highlights: [
      { label: 'Berdiri Sejak', value: '2024', icon: 'event' },
      { label: 'Standar Kerja', value: 'K3 & Mutu', icon: 'shield' },
      { label: 'Cakupan', value: 'Gedung & Industri', icon: 'apartment' }
    ]
  },
  about: {
    title: 'PT. Trimitra Solusindo Cemerlang',
    paragraphs: [
      'PT. Trimitra Solusindo Cemerlang merupakan perusahaan yang bergerak di bidang Security System, Mechanical, Electrical & Plumbing (MEP), Advertising, serta Pengadaan Material.',
      'Perusahaan ini berdiri pada tahun 2024 sebagai respon terhadap kebutuhan pasar yang terus berkembang di sektor tersebut. Kami hadir untuk memberikan solusi terintegrasi dengan mengedepankan profesionalisme, kualitas pekerjaan, dan kepuasan mitra.',
      'Kami berkomitmen untuk memberikan layanan terbaik dengan mengutamakan kualitas pekerjaan, keselamatan kerja, dan kepuasan mitra, serta mendukung berbagai proyek mulai dari gedung, komersial, hingga fasilitas industri.'
    ]
  },
  visionMission: {
    vision:
      'Menjadi perusahaan penyedia solusi terintegrasi yang terdepan, profesional, dan tepercaya di bidang Security System, MEP, Advertising, serta Pengadaan Material di Indonesia.',
    missions: [
      'Menyediakan layanan berkualitas tinggi dengan standar keselamatan dan ketepatan waktu.',
      'Membangun kemitraan jangka panjang berlandaskan integritas dan kepercayaan.',
      'Terus berinovasi mengikuti perkembangan teknologi keamanan dan infrastruktur modern.'
    ]
  },
  contact: {
    title: "Let's Work Together With TSC",
    description:
      'Kami terbuka untuk menjalin kerja sama sebagai partner, subkontraktor, maupun joint operation dalam pelaksanaan proyek gedung, komersial, dan fasilitas industri. Dengan komitmen pada kualitas, keselamatan kerja, dan kepatuhan standar, kami siap menjadi mitra yang andal dan profesional.',
    phone: '+62 812 1050 1150',
    email: 'trimitrasolusindocemerlang@gmail.com',
    address:
      'Legenda Wisata Ruko Newton Square U18/30, Nagrak, Gn. Putri, Bogor',
    officeHours: 'Senin - Jumat: 08:30 - 17:00 WIB'
  }
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_CMS_CONTENT, ...parsed }
    }
  } catch (e) {
    console.error('Failed reading CMS data:', e)
  }
  return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT))
}

import { api } from './api.js'

export function getCmsContent() {
  // Sync async dengan backend di background jika tersedia
  if (typeof window !== 'undefined') {
    api
      .get('/cms')
      .then(res => {
        if (res) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res))
          window.dispatchEvent(new CustomEvent('tsc_cms_updated', { detail: res }))
        }
      })
      .catch(e => {
        console.warn('[API CMS Background Sync Notice]:', e.message)
      })
  }
  return read()
}

export function saveCmsContent(content) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tsc_cms_updated', { detail: content })
    )
    // Simpan ke MongoDB Cloud via Backend API
    api.put('/cms', content).catch(e => {
      console.warn('[API Save CMS Notice]:', e.message)
    })
  }
  return content
}

export function resetCmsContent() {
  localStorage.removeItem(STORAGE_KEY)
  const def = JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tsc_cms_updated', { detail: def }))
    api.post('/cms/reset').catch(e => {
      console.warn('[API Reset CMS Notice]:', e.message)
    })
  }
  return def
}
