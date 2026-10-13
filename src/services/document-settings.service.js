// ============================================================
// DOCUMENT SETTINGS SERVICE (CMS KOP SURAT, TTD & PENUGASAN)
// Satu sumber konfigurasi untuk semua dokumen cetak resmi
// (SPKL, BAST, Invoice, Rekap Absensi).
// ============================================================

const STORAGE_KEY = 'tsc_doc_settings'

export const DEFAULT_DOC_SETTINGS = {
  // ---------- KOP SURAT (dipakai semua dokumen) ----------
  companyName: 'PT. TRIMITRA SOLUSINDO CEMERLANG',
  tagline:
    'Mechanical, Electrical, Plumbing, CCTV Security System & IT Infrastructure',
  address: 'Ruko Newton Square U18/30, Legenda Wisata, Nagrak, Gn. Putri, Bogor',
  phone: '+62 812 1050 1150',
  email: 'info@tsc.co.id',
  website: 'www.tsc.co.id',
  logoUrl: '/logo_white-removebg-preview.png',

  // ---------- NOMOR & KOTA SURAT ----------
  docNumberPrefix: 'TSC',
  letterCity: 'Bogor',

  // ---------- TANDA TANGAN SPKL ----------
  spklLeftLabel: 'Pelaksana Lembur,',
  spklLeftTitle: 'Teknisi Yang Bersangkutan',
  spklRightLabel: 'Menyetujui & Menugaskan,',
  spklRightTitle: 'Project Manager / Supervisor',
  spklRightCaption: 'Manager / Pengawas Proyek',
  spklDefaultApprover: 'Manager TSC',
  spklClosingText:
    'Demikian Surat Perintah Kerja Lembur ini diterbitkan untuk dilaksanakan dengan penuh rasa tanggung jawab serta tetap memprioritaskan keselamatan kerja (K3).',

  // ---------- TANDA TANGAN REKAP ABSENSI ----------
  recapRightTitle: 'Manager Operasional / HRD',
  recapRightName: 'Bambang Trihatmojo, S.T.',
  recapRightCaption: 'Manager Operasional PT. TSC',

  // ---------- TANDA TANGAN INVOICE ----------
  invoiceClientAckLabel: 'Diterima oleh Klien,',
  invoiceSignerName: 'Drs. H. Mulyono / Finance Dept.',
  invoiceSignerTitle: 'Finance & Accounting Manager',

  // ---------- TANDA TANGAN BAST ----------
  bastLeftCaption: 'Pemberi Kerja / Direktur',
  bastRightCaption: 'Direktur Pelaksana'
}

function mergeWithDefaults(raw) {
  const merged = { ...DEFAULT_DOC_SETTINGS }
  for (const key of Object.keys(DEFAULT_DOC_SETTINGS)) {
    if (raw && raw[key] !== undefined && raw[key] !== null) {
      merged[key] = raw[key]
    }
  }
  return merged
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return mergeWithDefaults(JSON.parse(raw))
  } catch (e) {
    console.error('Error reading doc settings:', e)
  }
  return { ...DEFAULT_DOC_SETTINGS }
}

function write(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function getDocSettings() {
  return read()
}

export function saveDocSettings(patch) {
  const next = mergeWithDefaults({ ...read(), ...patch })
  write(next)
  return next
}

export function resetDocSettings() {
  const next = { ...DEFAULT_DOC_SETTINGS }
  write(next)
  return next
}
