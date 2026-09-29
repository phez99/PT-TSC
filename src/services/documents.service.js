// ============================================================
// DOCUMENTS & BAST SERVICE (DOCUMENT CONTROL)
// Mengelola dokumen proyek, BAST (Berita Acara Serah Terima),
// As-Built Drawing, dan dokumen K3/QA-QC
// ============================================================

const STORAGE_KEY = 'tsc_documents'

const SEED_DOCUMENTS = [
  {
    id: 1,
    docNumber: 'BAST/01/TSC-PMS/VIII/2026',
    title: 'Berita Acara Serah Terima I (BAST-1) Pekerjaan HVAC & Plumbing',
    category: 'bast', // bast | drawing | contract | testing | hse
    projectId: 3,
    projectName: 'Apartemen Jakarta Utara - HVAC & Plumbing',
    clientName: 'PT Properti Megah Sentosa',
    status: 'signed', // draft | review | signed | archived
    createdAt: '2026-08-20',
    signDate: '2026-08-25',
    firstParty: 'Ir. Hendra Wijaya (Project Director PT Properti Megah Sentosa)',
    secondParty: 'Ahmad Fauzi (Direktur Operasional PT Trimitra Solusindo Cemerlang)',
    warrantyPeriod: '12 (Dua Belas) Bulan sejak penandatanganan BAST-1',
    description: 'Serah terima pertama fisik pekerjaan instalasi HVAC Chiller dan pipa air bersih/kotor dengan hasil uji fungsi baik 100%.',
    fileUrl: '/docs/sample-bast.pdf'
  },
  {
    id: 2,
    docNumber: 'DWG/TSC/EL-001/Rev2',
    title: 'As-Built Drawing Single Line Diagram & IP CCTV Network Layout',
    category: 'drawing',
    projectId: 1,
    projectName: 'Puri Mansion Apartemen - Electronic System',
    clientName: 'PT Puri Indah Makmur (Puri Mansion)',
    status: 'signed',
    createdAt: '2026-09-05',
    signDate: '2026-09-12',
    firstParty: 'Budi Santoso (Site Coordinator)',
    secondParty: 'Dedi Kurniawan (Lead Drafter TSC)',
    warrantyPeriod: '-',
    description: 'Gambar terpasang resmi jaringan kabel FO, switch core, 128 titik CCTV Hikvision, dan server NVR.',
    fileUrl: '/docs/asbuilt-cctv.pdf'
  },
  {
    id: 3,
    docNumber: 'BAP/04/TSC/IX/2026',
    title: 'Berita Acara Kemajuan Pekerjaan (BAP) Fisik 50% Panel & Genset',
    category: 'testing',
    projectId: 2,
    projectName: 'Pabrik Bekasi - Instalasi Genset & Panel Listrik',
    clientName: 'PT Industri Manufaktur Bekasi',
    status: 'signed',
    createdAt: '2026-09-18',
    signDate: '2026-09-19',
    firstParty: 'Ir. Surya Hartanto (Konsultan Pengawas)',
    secondParty: 'Rina Marlina (Project Manager TSC)',
    warrantyPeriod: '-',
    description: 'Pemeriksaan bersama progres pengadaan panel genset dan penarikan kabel feeder daya.',
    fileUrl: '/docs/bap-progres-50.pdf'
  },
  {
    id: 4,
    docNumber: 'HSE/TSC/SIKA-2026-089',
    title: 'Surat Izin Kerja Aman (SIKA) Ketinggian & Pekerjaan Listrik Tegangan Menengah',
    category: 'hse',
    projectId: 2,
    projectName: 'Pabrik Bekasi - Instalasi Genset & Panel Listrik',
    clientName: 'PT Industri Manufaktur Bekasi',
    status: 'signed',
    createdAt: '2026-09-15',
    signDate: '2026-09-15',
    firstParty: 'HSE Officer Kawasan Industri',
    secondParty: 'Safety Officer PT TSC',
    warrantyPeriod: 'Berlaku 14 Hari Kalender',
    description: 'Persetujuan Job Safety Analysis (JSA) dan perlengkapan APD teknisi.',
    fileUrl: '/docs/sika-hse.pdf'
  }
]

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed reading documents:', e)
  }
  write(SEED_DOCUMENTS)
  return JSON.parse(JSON.stringify(SEED_DOCUMENTS))
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function getDocuments() {
  await delay()
  return read()
}

export async function getDocument(id) {
  await delay(100)
  return read().find(d => d.id === Number(id)) ?? null
}

export async function createDocument(data) {
  await delay()
  const list = read()
  const id = list.reduce((max, d) => Math.max(max, d.id), 0) + 1
  const newDoc = {
    ...data,
    id,
    createdAt: data.createdAt || new Date().toISOString().slice(0, 10),
    status: data.status || 'draft'
  }
  list.unshift(newDoc)
  write(list)
  return newDoc
}

export async function updateDocument(id, patch) {
  await delay(100)
  const list = read()
  const index = list.findIndex(d => d.id === Number(id))
  if (index === -1) throw new Error('Dokumen tidak ditemukan')
  list[index] = { ...list[index], ...patch }
  write(list)
  return list[index]
}

export async function deleteDocument(id) {
  await delay(100)
  let list = read()
  list = list.filter(d => d.id !== Number(id))
  write(list)
  return true
}
