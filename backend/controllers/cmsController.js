import CmsContent from '../models/CmsContent.js'
import { successResponse } from '../utils/apiResponse.js'

const DEFAULT_CONTENT = {
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
    address: 'Legenda Wisata Ruko Newton Square U18/30, Nagrak, Gn. Putri, Bogor',
    officeHours: 'Senin - Jumat: 08:30 - 17:00 WIB'
  }
}

export const getCmsContent = async (req, res, next) => {
  try {
    let content = await CmsContent.findOne()
    if (!content) {
      content = await CmsContent.create(DEFAULT_CONTENT)
    }
    return successResponse(res, {
      statusCode: 200,
      message: 'Konten CMS berhasil dimuat.',
      data: content
    })
  } catch (err) {
    next(err)
  }
}

export const updateCmsContent = async (req, res, next) => {
  try {
    let content = await CmsContent.findOne()
    if (!content) {
      content = await CmsContent.create(req.body)
    } else {
      content = await CmsContent.findByIdAndUpdate(content._id, req.body, { new: true, runValidators: true })
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Konten Website Utama berhasil diperbarui.',
      data: content
    })
  } catch (err) {
    next(err)
  }
}

export const resetCmsContent = async (req, res, next) => {
  try {
    await CmsContent.deleteMany({})
    const content = await CmsContent.create(DEFAULT_CONTENT)

    return successResponse(res, {
      statusCode: 200,
      message: 'Konten Website Utama telah direset ke default.',
      data: content
    })
  } catch (err) {
    next(err)
  }
}
