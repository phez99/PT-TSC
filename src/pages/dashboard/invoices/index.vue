<template>
  <q-page class="q-pa-md q-pa-sm-lg">
    <!-- ================= HEADER + AKSI ================= -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold" style="color: #0f172a">
          Invoices &amp; Penagihan Proyek
        </div>
        <div class="text-grey-7 text-body2">
          Kelola faktur penagihan termin proyek, status pembayaran, dan rekapitulasi PPN.
        </div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="primary"
          no-caps
          icon="help_outline"
          label="Panduan Invoice (SOP)"
          @click="showGuideDialog = true"
        />
        <q-btn
          class="btn-gold"
          no-caps
          icon="add"
          label="Buat Invoice Baru"
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- ================= METRIK KPI PENAGIHAN ================= -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">TOTAL TAGIHAN</div>
          <div class="text-h5 text-weight-bold text-navy-950 q-my-xs">
            Rp {{ formatRupiah(totalInvoiced) }}
          </div>
          <div class="text-caption text-grey-6">{{ invoices.length }} Faktur Terbit</div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">SUDAH DIBAYAR (LUNAS)</div>
          <div class="text-h5 text-weight-bold text-positive q-my-xs">
            Rp {{ formatRupiah(totalPaid) }}
          </div>
          <div class="text-caption text-positive text-weight-medium">
            {{ invoices.filter(i => i.status === 'paid').length }} Faktur Selesai
          </div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">MENUNGGU PEMBAYARAN</div>
          <div class="text-h5 text-weight-bold text-amber-8 q-my-xs">
            Rp {{ formatRupiah(totalPending) }}
          </div>
          <div class="text-caption text-amber-9 text-weight-bold">
            {{ invoices.filter(i => i.status === 'sent').length }} Faktur Aktif
          </div>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="company-dash-card q-pa-md">
          <div class="text-caption text-grey-7 text-weight-bold">ESTIMASI PPN 11%</div>
          <div class="text-h5 text-weight-bold text-primary q-my-xs">
            Rp {{ formatRupiah(totalTax) }}
          </div>
          <div class="text-caption text-grey-6">Kewajiban Faktur Pajak</div>
        </q-card>
      </div>
    </div>

    <!-- ================= TABEL INVOICES ================= -->
    <q-card class="company-dash-card">
      <q-table
        flat
        :rows="filteredInvoices"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        no-data-label="Belum ada data faktur invoice"
        class="company-dash-table"
      >
        <template #top>
          <q-input
            v-model="search"
            dense
            outlined
            debounce="200"
            placeholder="Cari no. invoice, klien, proyek..."
            style="width: 280px"
          >
            <template #prepend><q-icon name="search" /></template>
            <template #append v-if="search">
              <q-icon name="clear" class="cursor-pointer" @click="search = ''" />
            </template>
          </q-input>

          <q-space />

          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            emit-value
            map-options
            dense
            outlined
            label="Filter Status"
            style="min-width: 180px"
          />
        </template>

        <!-- No Invoice -->
        <template #body-cell-invoiceNumber="props">
          <q-td :props="props">
            <div class="font-mono text-weight-bold text-primary cursor-pointer" @click="openPreview(props.row)">
              {{ props.row.invoiceNumber }}
            </div>
            <div class="text-caption text-grey-6">{{ props.row.notes }}</div>
          </q-td>
        </template>

        <!-- Klien & Proyek -->
        <template #body-cell-client="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.clientName }}</div>
            <div class="text-caption text-grey-7">{{ props.row.projectName }}</div>
          </q-td>
        </template>

        <!-- Total -->
        <template #body-cell-total="props">
          <q-td :props="props" class="text-right">
            <div class="text-weight-bold text-navy-950 font-mono">
              Rp {{ formatRupiah(props.row.total) }}
            </div>
            <div class="text-caption text-grey-6">
              (PPN: Rp {{ formatRupiah(props.row.taxAmount) }})
            </div>
          </q-td>
        </template>

        <!-- Status -->
        <template #body-cell-status="props">
          <q-td :props="props" class="text-center">
            <q-chip
              dense
              size="sm"
              :color="statusBadge(props.row.status).color"
              :text-color="statusBadge(props.row.status).textColor"
              class="text-weight-bold"
            >
              {{ statusBadge(props.row.status).label }}
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
                icon="visibility"
                @click="openPreview(props.row)"
              >
                <q-tooltip>Lihat &amp; Cetak Faktur</q-tooltip>
              </q-btn>
              <q-btn
                v-if="props.row.status !== 'paid'"
                flat
                round
                dense
                color="positive"
                icon="check_circle"
                @click="markAsPaid(props.row)"
              >
                <q-tooltip>Tandai Sudah Lunas</q-tooltip>
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

    <!-- ================= DIALOG BUAT INVOICE BARU ================= -->
    <q-dialog v-model="createDialog" persistent>
      <q-card style="width: 760px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-sm">
          <div class="text-h6 text-weight-bold">Buat Faktur / Invoice Penagihan</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form @submit.prevent="saveNewInvoice">
          <q-card-section class="q-pt-sm q-gutter-y-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.projectId"
                  :options="projectOptions"
                  emit-value
                  map-options
                  dense
                  outlined
                  label="Pilih Proyek Terkait"
                  :rules="[v => !!v || 'Wajib memilih proyek']"
                  @update:model-value="onProjectSelect"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.clientName"
                  dense
                  outlined
                  label="Nama Klien / Instansi"
                  :rules="[v => !!v || 'Nama klien wajib diisi']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.issueDate"
                  type="date"
                  dense
                  outlined
                  label="Tanggal Terbit"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.dueDate"
                  type="date"
                  dense
                  outlined
                  label="Jatuh Tempo Pembayaran"
                  :rules="[v => !!v || 'Wajib diisi']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.clientAddress"
                  dense
                  outlined
                  label="Alamat Penagihan Klien"
                  placeholder="Alamat kantor klien untuk faktur"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.notes"
                  dense
                  outlined
                  label="Catatan Termin / Uraian Penagihan"
                  placeholder="Contoh: Termin I (DP 30%) Sesuai Kontrak No. 012/SPK/TSC/2026"
                />
              </div>
            </div>

            <!-- Item Barang / Jasa Penagihan -->
            <div class="text-subtitle2 text-weight-bold q-mt-md">
              Rincian Item Pekerjaan / Material
            </div>

            <div v-for="(item, idx) in form.items" :key="idx" class="row q-col-gutter-xs items-center q-mb-xs">
              <div class="col-5">
                <q-input
                  v-model="item.description"
                  dense
                  outlined
                  placeholder="Deskripsi item pekerjaan / material"
                />
              </div>
              <div class="col-2">
                <q-input
                  v-model.number="item.qty"
                  type="number"
                  dense
                  outlined
                  placeholder="Qty"
                  @update:model-value="calcItemAmount(item)"
                />
              </div>
              <div class="col-2">
                <q-input
                  v-model="item.unit"
                  dense
                  outlined
                  placeholder="Satuan (Lot/Unit)"
                />
              </div>
              <div class="col-2">
                <q-input
                  v-model.number="item.unitPrice"
                  type="number"
                  dense
                  outlined
                  placeholder="Harga (Rp)"
                  @update:model-value="calcItemAmount(item)"
                />
              </div>
              <div class="col-1 text-center">
                <q-btn
                  v-if="form.items.length > 1"
                  flat
                  round
                  dense
                  icon="remove_circle_outline"
                  color="negative"
                  @click="form.items.splice(idx, 1)"
                />
              </div>
            </div>

            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="add"
              label="Tambah Baris Item"
              @click="addItemRow"
            />

            <!-- Ringkasan Kalkulasi -->
            <div class="bg-grey-1 q-pa-md rounded-borders q-mt-md">
              <div class="row justify-between text-body2 q-mb-xs">
                <span>Subtotal Item:</span>
                <span class="font-mono text-weight-bold">Rp {{ formatRupiah(formSubtotal) }}</span>
              </div>
              <div class="row justify-between text-body2 q-mb-xs">
                <span>PPN (11%):</span>
                <span class="font-mono text-weight-bold">Rp {{ formatRupiah(formTax) }}</span>
              </div>
              <q-separator class="q-my-xs" />
              <div class="row justify-between text-subtitle1 text-weight-bold text-navy-950">
                <span>Total Tagihan:</span>
                <span class="font-mono text-primary">Rp {{ formatRupiah(formTotal) }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
            <q-btn type="submit" class="btn-gold" label="Simpan &amp; Terbitkan Faktur" no-caps />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- ================= MODAL PRATINJAU / CETAK FAKTUR RESMI ================= -->
    <q-dialog v-model="previewDialog" maximized>
      <q-card class="bg-grey-2">
        <q-toolbar class="bg-navy-950 text-white">
          <q-toolbar-title class="text-subtitle1 text-weight-bold">
            Pratinjau Faktur Penagihan &mdash; {{ activeInvoice?.invoiceNumber }}
          </q-toolbar-title>
          <q-btn
            class="btn-gold q-mr-sm"
            no-caps
            icon="print"
            label="Cetak / Unduh PDF"
            @click="printInvoice"
          />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <!-- Kertas Faktur Resmi -->
        <div class="q-pa-md q-pa-sm-xl flex justify-center">
          <div
            id="print-invoice-area"
            class="bg-white q-pa-xl shadow-4"
            style="width: 820px; min-height: 1050px; font-family: 'Segoe UI', Arial, sans-serif; position: relative;"
          >
            <!-- Kop Surat Perusahaan -->
            <div class="row items-center justify-between q-pb-md" style="border-bottom: 2px solid #0f172a;">
              <div class="row items-center q-gutter-md">
                <img src="/logo_white-removebg-preview.png" alt="TSC" style="height: 52px; background: #090d16; padding: 4px 10px; border-radius: 8px;" />
                <div>
                  <div class="text-h6 text-weight-bold text-navy-950" style="letter-spacing: 0.5px;">
                    PT. TRIMITRA SOLUSINDO CEMERLANG
                  </div>
                  <div class="text-caption text-grey-8">
                    Security System &bull; Mechanical &bull; Electrical &bull; Plumbing &bull; General Supplier
                  </div>
                  <div class="text-caption text-grey-7" style="font-size: 11px;">
                    Head Office: Ruko Newton Square U18/30 Legenda Wisata, Nagrak, Bogor | Telp: +62 812 1050 1150
                  </div>
                </div>
              </div>
              <div class="text-right">
                <div class="text-h4 text-weight-bold text-amber-8" style="letter-spacing: 2px;">
                  INVOICE
                </div>
                <div class="text-caption font-mono text-grey-7">{{ activeInvoice?.invoiceNumber }}</div>
              </div>
            </div>

            <!-- Detail Pihak Tertagih & Tanggal -->
            <div class="row justify-between q-mt-lg text-body2">
              <div style="max-width: 360px;">
                <div class="text-caption text-grey-6 text-uppercase text-weight-bold">Ditujukan Kepada:</div>
                <div class="text-subtitle1 text-weight-bold text-navy-950">{{ activeInvoice?.clientName }}</div>
                <div class="text-caption text-grey-8">{{ activeInvoice?.clientAddress }}</div>
                <div class="text-caption text-grey-7 q-mt-xs">Email: {{ activeInvoice?.clientEmail || '-' }}</div>
                <div class="text-caption text-primary text-weight-bold q-mt-xs">
                  Proyek: {{ activeInvoice?.projectName }}
                </div>
              </div>
              <div class="text-right" style="min-width: 220px;">
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption text-grey-7">Tgl. Terbit:</span>
                  <span class="text-weight-bold">{{ formatDate(activeInvoice?.issueDate) }}</span>
                </div>
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption text-grey-7">Jatuh Tempo:</span>
                  <span class="text-weight-bold text-negative">{{ formatDate(activeInvoice?.dueDate) }}</span>
                </div>
                <div class="row justify-between q-mb-xs">
                  <span class="text-caption text-grey-7">Status:</span>
                  <span
                    class="text-weight-bold"
                    :class="activeInvoice?.status === 'paid' ? 'text-positive' : 'text-amber-9'"
                  >
                    {{ activeInvoice?.status === 'paid' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Catatan Termin -->
            <div class="bg-grey-1 q-pa-sm rounded-borders q-my-md text-caption text-grey-8">
              <strong>Keterangan:</strong> {{ activeInvoice?.notes }}
            </div>

            <!-- Tabel Item Pekerjaan -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background: #0f172a; color: white;">
                  <th style="padding: 10px; text-align: left; font-size: 12px;">No.</th>
                  <th style="padding: 10px; text-align: left; font-size: 12px;">Deskripsi Item / Jasa</th>
                  <th style="padding: 10px; text-align: center; font-size: 12px;">Qty</th>
                  <th style="padding: 10px; text-align: center; font-size: 12px;">Satuan</th>
                  <th style="padding: 10px; text-align: right; font-size: 12px;">Harga Satuan</th>
                  <th style="padding: 10px; text-align: right; font-size: 12px;">Total (Rp)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(it, i) in activeInvoice?.items || []"
                  :key="i"
                  style="border-bottom: 1px solid #e2e8f0; font-size: 13px;"
                >
                  <td style="padding: 10px;">{{ i + 1 }}</td>
                  <td style="padding: 10px; font-weight: 500;">{{ it.description }}</td>
                  <td style="padding: 10px; text-align: center;">{{ it.qty }}</td>
                  <td style="padding: 10px; text-align: center;">{{ it.unit }}</td>
                  <td style="padding: 10px; text-align: right; font-family: monospace;">
                    Rp {{ formatRupiah(it.unitPrice) }}
                  </td>
                  <td style="padding: 10px; text-align: right; font-weight: bold; font-family: monospace;">
                    Rp {{ formatRupiah(it.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Kalkulasi Bawah -->
            <div class="row justify-end q-mt-md">
              <div style="width: 320px;">
                <div class="row justify-between q-py-xs" style="font-size: 13px;">
                  <span class="text-grey-7">Subtotal:</span>
                  <span class="font-mono text-weight-bold">Rp {{ formatRupiah(activeInvoice?.subtotal) }}</span>
                </div>
                <div class="row justify-between q-py-xs" style="font-size: 13px;">
                  <span class="text-grey-7">PPN (11%):</span>
                  <span class="font-mono text-weight-bold">Rp {{ formatRupiah(activeInvoice?.taxAmount) }}</span>
                </div>
                <div
                  class="row justify-between q-py-sm q-mt-xs"
                  style="border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; font-size: 16px; font-weight: bold;"
                >
                  <span>GRAND TOTAL:</span>
                  <span class="font-mono text-primary">Rp {{ formatRupiah(activeInvoice?.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Petunjuk Rekening Pembayaran -->
            <div class="q-mt-xl" style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; background: #f8fafc;">
              <div class="text-caption text-weight-bold text-navy-950 q-mb-xs">
                INSTRUKSI PEMBAYARAN TRANSFER BANK RESMI:
              </div>
              <div class="row q-col-gutter-md text-caption text-grey-8">
                <div class="col-6">
                  <div><strong>Bank Mandiri (KCP Newton Square)</strong></div>
                  <div>No. Rekening: <strong>133-00-1928374-1</strong></div>
                  <div>Atas Nama: <strong>PT Trimitra Solusindo Cemerlang</strong></div>
                </div>
                <div class="col-6">
                  <div><strong>BCA (Cabang Cibubur)</strong></div>
                  <div>No. Rekening: <strong>682-089-1122</strong></div>
                  <div>Atas Nama: <strong>PT Trimitra Solusindo Cemerlang</strong></div>
                </div>
              </div>
            </div>

            <!-- Tanda Tangan & Cap Resmi -->
            <div class="row justify-between items-end q-mt-xl text-center">
              <div style="width: 220px;">
                <div class="text-caption text-grey-6">Diterima oleh Klien,</div>
                <div style="height: 70px;"></div>
                <div style="border-bottom: 1px solid #94a3b8;"></div>
                <div class="text-caption text-grey-8 q-mt-xs">Tanda Tangan &amp; Cap Perusahaan</div>
              </div>

              <div style="width: 260px; position: relative;">
                <!-- Stempel Lunas jika Paid -->
                <div
                  v-if="activeInvoice?.status === 'paid'"
                  style="
                    position: absolute;
                    top: -20px;
                    left: 20px;
                    border: 3px solid #16a34a;
                    color: #16a34a;
                    padding: 4px 18px;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    transform: rotate(-12deg);
                    opacity: 0.85;
                  "
                >
                  LUNAS / PAID
                </div>

                <div class="text-caption text-grey-7">Bogor, {{ formatDate(activeInvoice?.issueDate) }}</div>
                <div class="text-caption text-weight-bold text-navy-950">PT. Trimitra Solusindo Cemerlang</div>
                <div style="height: 60px;"></div>
                <div style="border-bottom: 1px solid #0f172a;" class="text-weight-bold">
                  Drs. H. Mulyono / Finance Dept.
                </div>
                <div class="text-caption text-grey-7">Finance &amp; Accounting Manager</div>
              </div>
            </div>
          </div>
        </div>
      </q-card>
    </q-dialog>

    <!-- ================= DIALOG PANDUAN PENAGIHAN (SOP INVOICE) ================= -->
    <q-dialog v-model="showGuideDialog">
      <q-card style="width: 620px; max-width: 95vw; border-radius: 16px;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Standar Prosedur Operasional (SOP) Penagihan</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body2 text-grey-8" style="line-height: 1.8;">
            <div class="text-weight-bold text-navy-900 q-mb-xs">1. Berkas Lampiran Tagihan:</div>
            <p class="text-caption text-grey-7 q-mb-md">
              Setiap pengajuan faktur invoice wajib melampirkan: (a) Kuitansi asli bermeterai, (b) Berita Acara Kemajuan Progres (BAP) atau Berita Acara Serah Terima (BAST), (c) Salinan SPK/Kontrak Kerja, dan (d) Faktur Pajak e-Faktur elektronik.
            </p>

            <div class="text-weight-bold text-navy-900 q-mb-xs">2. Ketentuan Termin Pembayaran:</div>
            <ul class="text-caption text-grey-7 q-pl-md q-mb-md">
              <li><strong>Termin I (DP 30%)</strong>: Diterbitkan setelah penandatanganan kontrak dan penyerahan jaminan pelaksanaan.</li>
              <li><strong>Termin II &amp; Lanjutan</strong>: Diterbitkan berdasarkan verifikasi fisik bersama konsultan pengawas/klien.</li>
              <li><strong>Pelunasan (95%)</strong>: Diterbitkan setelah penandatanganan BAST-1 (Serah Terima Pertama).</li>
              <li><strong>Retensi (5%)</strong>: Dicairkan setelah masa garansi/pemeliharaan selesai dan terbit BAST-2 (Serah Terima Akhir).</li>
            </ul>

            <div class="text-weight-bold text-navy-900 q-mb-xs">3. Rekonsiliasi &amp; Pajak:</div>
            <p class="text-caption text-grey-7 q-mb-none">
              PPN dihitung otomatis 11% sesuai peraturan perundangan perpajakan. Pembayaran dianggap sah hanya jika masuk ke rekening giro resmi PT. Trimitra Solusindo Cemerlang.
            </p>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Mengerti &amp; Tutup" color="primary" v-close-popup no-caps />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '/src/services/invoices.service.js'
import { getProjects } from '/src/services/projects.service.js'
import { formatDate } from '/src/config/projects.js'

const $q = useQuasar()

const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const invoices = ref([])
const projects = ref([])

const createDialog = ref(false)
const previewDialog = ref(false)
const showGuideDialog = ref(false)
const activeInvoice = ref(null)

const statusOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Lunas (Paid)', value: 'paid' },
  { label: 'Menunggu Pembayaran', value: 'sent' },
  { label: 'Draft', value: 'draft' }
]

const columns = [
  { name: 'invoiceNumber', label: 'No. Faktur', field: 'invoiceNumber', align: 'left' },
  { name: 'client', label: 'Klien & Proyek', field: 'clientName', align: 'left' },
  { name: 'dueDate', label: 'Jatuh Tempo', field: 'dueDate', align: 'left', format: v => formatDate(v) },
  { name: 'total', label: 'Total Tagihan', field: 'total', align: 'right' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Aksi', align: 'center' }
]

const form = reactive({
  projectId: null,
  clientName: '',
  clientAddress: '',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  notes: '',
  items: [
    { description: 'Termin Pekerjaan Instalasi', qty: 1, unit: 'Lot', unitPrice: 50000000, amount: 50000000 }
  ]
})

const projectOptions = computed(() => {
  return projects.value.map(p => ({
    label: `${p.code} - ${p.name} (${p.client})`,
    value: p.id
  }))
})

const formSubtotal = computed(() => {
  return form.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
})

const formTax = computed(() => {
  return Math.round(formSubtotal.value * 0.11)
})

const formTotal = computed(() => {
  return formSubtotal.value + formTax.value
})

const filteredInvoices = computed(() => {
  let list = invoices.value
  if (statusFilter.value !== 'all') {
    list = list.filter(i => i.status === statusFilter.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(
      i =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.clientName.toLowerCase().includes(q) ||
        i.projectName.toLowerCase().includes(q)
    )
  }
  return list
})

const totalInvoiced = computed(() => invoices.value.reduce((s, i) => s + (Number(i.total) || 0), 0))
const totalPaid = computed(() => invoices.value.filter(i => i.status === 'paid').reduce((s, i) => s + (Number(i.total) || 0), 0))
const totalPending = computed(() => invoices.value.filter(i => i.status === 'sent').reduce((s, i) => s + (Number(i.total) || 0), 0))
const totalTax = computed(() => invoices.value.reduce((s, i) => s + (Number(i.taxAmount) || 0), 0))

function formatRupiah(num) {
  if (!num) return '0'
  return Number(num).toLocaleString('id-ID')
}

function statusBadge(status) {
  switch (status) {
    case 'paid': return { label: 'LUNAS', color: 'green-1', textColor: 'green-9' }
    case 'sent': return { label: 'TERKIRIM', color: 'amber-1', textColor: 'amber-9' }
    case 'overdue': return { label: 'JATUH TEMPO', color: 'red-1', textColor: 'red-9' }
    default: return { label: 'DRAFT', color: 'grey-2', textColor: 'grey-8' }
  }
}

function calcItemAmount(item) {
  item.amount = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0)
}

function addItemRow() {
  form.items.push({ description: '', qty: 1, unit: 'Unit', unitPrice: 0, amount: 0 })
}

function onProjectSelect(projectId) {
  const p = projects.value.find(pr => pr.id === projectId)
  if (p) {
    form.clientName = p.client
    form.clientAddress = p.location || ''
    form.notes = `Tagihan Pekerjaan Proyek ${p.name}`
  }
}

function openCreateDialog() {
  form.projectId = projects.value[0]?.id || null
  if (form.projectId) onProjectSelect(form.projectId)
  createDialog.value = true
}

async function saveNewInvoice() {
  try {
    const selectedP = projects.value.find(pr => pr.id === form.projectId)
    const newInv = await createInvoice({
      projectId: form.projectId,
      projectName: selectedP?.name || 'Proyek Lapangan',
      clientName: form.clientName,
      clientAddress: form.clientAddress,
      clientEmail: '',
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      notes: form.notes,
      items: form.items,
      subtotal: formSubtotal.value,
      taxPercent: 11,
      taxAmount: formTax.value,
      total: formTotal.value,
      status: 'sent'
    })
    invoices.value.unshift(newInv)
    createDialog.value = false
    $q.notify({ type: 'positive', message: 'Faktur invoice berhasil diterbitkan' })
    openPreview(newInv)
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal menyimpan invoice' })
  }
}

function openPreview(inv) {
  activeInvoice.value = inv
  previewDialog.value = true
}

async function markAsPaid(inv) {
  try {
    const updated = await updateInvoice(inv.id, {
      status: 'paid',
      paidAt: new Date().toISOString().slice(0, 10)
    })
    const idx = invoices.value.findIndex(i => i.id === inv.id)
    if (idx !== -1) invoices.value[idx] = updated
    $q.notify({ type: 'positive', message: `Invoice ${inv.invoiceNumber} ditandai Lunas!` })
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Gagal memperbarui status' })
  }
}

function confirmDelete(inv) {
  $q.dialog({
    title: 'Hapus Faktur',
    message: `Apakah Anda yakin ingin menghapus ${inv.invoiceNumber}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await deleteInvoice(inv.id)
    invoices.value = invoices.value.filter(i => i.id !== inv.id)
    $q.notify({ type: 'positive', message: 'Invoice dihapus' })
  })
}

function printInvoice() {
  window.print()
}

onMounted(async () => {
  try {
    const [invList, pList] = await Promise.all([
      getInvoices(),
      getProjects()
    ])
    invoices.value = invList || []
    projects.value = pList || []
  } finally {
    loading.value = false
  }
})
</script>
