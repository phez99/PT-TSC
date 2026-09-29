// ============================================================
// INVOICES SERVICE (MOCK / LOCALSTORAGE)
// Mengelola data faktur/invoice penagihan proyek PT. TSC
// ============================================================

const STORAGE_KEY = 'tsc_invoices'

const SEED_INVOICES = [
  {
    id: 1,
    invoiceNumber: 'INV/TSC/2026/09/001',
    projectId: 1,
    projectName: 'Puri Mansion Apartemen - Electronic System',
    clientName: 'PT Puri Indah Makmur (Puri Mansion)',
    clientAddress: 'Jl. Lingkar Luar Barat No. 8, Puri Kembangan, Jakarta Barat',
    clientEmail: 'finance@purimansion.co.id',
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    status: 'paid', // draft | sent | paid | overdue
    notes: 'Termin I (DP 30%) untuk pengadaan dan instalasi IP CCTV & Access Control System.',
    items: [
      {
        description: 'Down Payment (DP) 30% Pekerjaan Security System & Surveillance',
        qty: 1,
        unit: 'Lot',
        unitPrice: 150000000,
        amount: 150000000
      }
    ],
    subtotal: 150000000,
    taxPercent: 11,
    taxAmount: 16500000,
    total: 166500000,
    paymentMethod: 'Bank Transfer - Bank Mandiri (KCP Newton Square)',
    paidAt: '2026-09-18'
  },
  {
    id: 2,
    invoiceNumber: 'INV/TSC/2026/09/002',
    projectId: 2,
    projectName: 'Pabrik Bekasi - Instalasi Genset & Panel Listrik',
    clientName: 'PT Industri Manufaktur Bekasi',
    clientAddress: 'Kawasan Industri MM2100, Cikarang Barat, Bekasi',
    clientEmail: 'procurement@imb.co.id',
    issueDate: '2026-09-20',
    dueDate: '2026-10-05',
    status: 'sent',
    notes: 'Termin II (Progress 50%) Sesuai Berita Acara Progres Fisik No. BAP/04/TSC/IX/2026.',
    items: [
      {
        description: 'Termin II (50%) Pengadaan & Perakitan Panel MDP/SDP',
        qty: 1,
        unit: 'Lot',
        unitPrice: 95000000,
        amount: 95000000
      },
      {
        description: 'Pemasangan Kabel Feeder NYY 4x185mm & Tray Listrik',
        qty: 120,
        unit: 'Meter',
        unitPrice: 350000,
        amount: 42000000
      }
    ],
    subtotal: 137000000,
    taxPercent: 11,
    taxAmount: 15070000,
    total: 152070000,
    paymentMethod: 'Bank Transfer - BCA Cabang Cibubur',
    paidAt: null
  },
  {
    id: 3,
    invoiceNumber: 'INV/TSC/2026/09/003',
    projectId: 3,
    projectName: 'Apartemen Jakarta Utara - HVAC & Plumbing',
    clientName: 'PT Properti Megah Sentosa',
    clientAddress: 'Jl. Danau Sunter Selatan Blok O, Tanjung Priok, Jakarta Utara',
    clientEmail: 'billing@megahsentosa.com',
    issueDate: '2026-08-15',
    dueDate: '2026-08-30',
    status: 'paid',
    notes: 'Pelunasan 100% dan Serah Terima Pertama (BAST-1) No. BAST/01/TSC-PMS/VIII/2026.',
    items: [
      {
        description: 'Pelunasan Akhir (Termin III) Instalasi Pemipaan Chiller & Plumbing',
        qty: 1,
        unit: 'Lot',
        unitPrice: 85000000,
        amount: 85000000
      }
    ],
    subtotal: 85000000,
    taxPercent: 11,
    taxAmount: 9350000,
    total: 94350000,
    paymentMethod: 'Bank Transfer - Bank Mandiri',
    paidAt: '2026-08-28'
  }
]

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms))

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed reading invoices:', e)
  }
  write(SEED_INVOICES)
  return JSON.parse(JSON.stringify(SEED_INVOICES))
}

function write(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export async function getInvoices() {
  await delay()
  return read()
}

export async function getInvoice(id) {
  await delay(100)
  return read().find(inv => inv.id === Number(id)) ?? null
}

export async function createInvoice(data) {
  await delay()
  const list = read()
  const id = list.reduce((max, inv) => Math.max(max, inv.id), 0) + 1
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const invoiceNumber = `INV/TSC/${year}/${month}/${String(id).padStart(3, '0')}`

  const newInvoice = {
    ...data,
    id,
    invoiceNumber: data.invoiceNumber || invoiceNumber,
    status: data.status || 'draft'
  }
  list.unshift(newInvoice)
  write(list)
  return newInvoice
}

export async function updateInvoice(id, patch) {
  await delay(100)
  const list = read()
  const index = list.findIndex(inv => inv.id === Number(id))
  if (index === -1) throw new Error('Invoice tidak ditemukan')
  list[index] = { ...list[index], ...patch }
  write(list)
  return list[index]
}

export async function deleteInvoice(id) {
  await delay(100)
  let list = read()
  list = list.filter(inv => inv.id !== Number(id))
  write(list)
  return true
}
