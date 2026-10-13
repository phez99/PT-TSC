# PRD Modul Manajemen Proyek PT-TSC (Revisi)

Oct 13, 2026 · @aseptian abdurohman

## Ringkasan dan ruang lingkup

Modul Manajemen Proyek menjadi sumber data utama proyek PT-TSC dan dasar penyusunan tagihan. Pembangunannya dibagi empat fase, supaya tiap fase bisa dipakai dan diuji sendiri.

Tujuan modul:

- Mencatat kontrak proyek: nilai kontrak, rincian pekerjaan (BoQ), dan termin pembayaran.
- Menjaga data keuangan: proyek yang sudah dipakai Material Request, Lembur, Invoice, atau Dokumen tidak bisa dihapus permanen, hanya diarsipkan.
- Menyiapkan data terstruktur supaya Finance membuat invoice dari termin tanpa mengetik ulang.

Di luar ruang lingkup versi pertama: dua metode tagihan sekaligus (berbasis progres dan berbasis item), retensi, dan addendum kontrak. Termin menjadi satu-satunya metode tagihan, dan item BoQ menjadi rincian pekerjaan yang dirujuk termin.

## Peran dan hak akses

PM mengubah progres dan status pekerjaan, tetapi tidak harga; harga, BoQ, dan termin hanya bisa diubah admin dan manager. Pemisahan ini mencegah angka tagihan berubah oleh orang yang menilai progres.

| Role | Lihat proyek | Ubah data umum dan progres | Ubah harga, BoQ, termin | Arsipkan dan pulihkan | Generate invoice |
| --- | --- | --- | --- | --- | --- |
| admin | Ya | Ya | Ya | Ya | Ya |
| manager | Ya | Ya | Ya | Tidak | Tidak |
| pm | Ya | Ya | Tidak | Tidak | Tidak |
| finance | Ya, termasuk nilai | Tidak | Tidak | Tidak | Ya |
| staff | Tidak ada menu proyek | Tidak | Tidak | Tidak | Tidak |

Catatan penerapan: backend sudah menyembunyikan nilai kontrak dari role staff. Menu Manajemen Proyek saat ini tidak menampilkan finance, jadi perlu ditambahkan, dengan tombol ubah dan arsip disembunyikan untuk role itu.

## Keputusan desain dan aturan bisnis

Tujuh aturan menutup celah di PRD awal, dan semuanya divalidasi di server, bukan hanya di tampilan.

1. **Status dan arsip dipisah.** Status bisnis memakai nilai yang sudah ada di kode: `planning`, `ongoing`, `hold`, `done`, ditambah `cancelled`. Arsip adalah penanda tampilan (`isArchived`): proyek dibatalkan tetap muncul di laporan, proyek terarsip disembunyikan dari daftar utama dan bisa dipulihkan.
2. **Hapus permanen hanya untuk proyek tanpa relasi.** Syaratnya: tidak dipakai Material Request, Lembur, Invoice, atau Dokumen, dan berstatus `planning`. Di luar itu, tombol "Hapus" menjadi "Arsipkan".
3. **Nilai kontrak dihitung dari jumlah harga item BoQ**, bukan diinput terpisah, supaya dua angka tidak bisa berbeda.
4. **Pajak bisa diatur.** Tarif PPN disimpan per proyek, bukan angka tetap di kode. PPh dicatat sebagai informasi potongan dan tidak menambah total tagihan, sampai Finance mengonfirmasi perlakuannya.
5. **Total persentase termin wajib 100%**, divalidasi saat simpan. Setiap termin punya syarat progres dan paling banyak satu invoice.
6. **Data yang sudah ditagih dikunci.** Item dan termin yang sudah punya invoice tidak bisa diubah atau dihapus. Perubahan nilai kontrak setelah itu lewat addendum, yang direncanakan setelah fase 4.
7. **Uang dihitung di server** dalam Rupiah bulat, angka dari tampilan tidak dipercaya. Perubahan data keuangan dan arsip dicatat: siapa, kapan, apa.

## Skema data

Contoh di bawah konsisten: item berjumlah Rp250.000.000 dan tiga termin berjumlah 100%. Penamaan memakai camelCase dan nilai status yang sudah ada di kode.

```json
{
  "code": "PRJ-2026-002",
  "name": "Pemasangan Panel Genset 500kVA",
  "client": "PT Bio Farma (Persero)",
  "clientAddress": "(alamat tagihan klien)",
  "contractNumber": "(nomor kontrak atau PO)",
  "category": "electrical",
  "status": "ongoing",
  "progress": 85,
  "isArchived": false,
  "archivedAt": null,
  "archivedBy": null,
  "archiveReason": "",
  "taxRate": 11,
  "contractValue": 250000000,
  "items": [
    { "description": "Supply Panel Genset 500kVA", "qty": 1, "unit": "Unit", "unitPrice": 180000000, "amount": 180000000, "status": "inProgress" },
    { "description": "Jasa Instalasi & Cable Termination", "qty": 1, "unit": "Lot", "unitPrice": 70000000, "amount": 70000000, "status": "notStarted" }
  ],
  "milestones": [
    { "title": "DP 30%", "percent": 30, "amount": 75000000, "requiredProgress": 0, "status": "paid", "invoice": "(id invoice)" },
    { "title": "Termin 2", "percent": 50, "amount": 125000000, "requiredProgress": 80, "status": "draft", "invoice": null },
    { "title": "Pelunasan setelah BAST", "percent": 20, "amount": 50000000, "requiredProgress": 100, "status": "draft", "invoice": null }
  ]
}
```

Aturan hitung, semuanya di server:

- `amount` item = `qty` × `unitPrice`.
- `contractValue` = jumlah `amount` semua item, sebelum PPN.
- `amount` termin = `contractValue` × `percent` / 100, dibulatkan ke Rupiah.
- PPN dihitung saat invoice dibuat: `amount` termin × `taxRate` / 100.
- Status item: `notStarted`, `inProgress`, `done`. Status termin: `draft`, `invoiced`, `paid`.

## Rencana empat fase

Tiap fase bisa dirilis dan dipakai sendiri, dan fase berikutnya dimulai setelah acceptance criteria fase sebelumnya lulus. Fase 1 sedang dikerjakan di kode.

1. **Arsip dan status.** Menambah `isArchived`, status `cancelled`, tombol Arsipkan dan Pulihkan, filter arsip di daftar proyek, dan hapus permanen hanya untuk proyek tanpa relasi. Selesai ketika AC-1.1 sampai AC-1.4 lulus.
2. **Kontrak dan BoQ.** Menambah item pekerjaan, nilai kontrak hasil hitung, `taxRate`, alamat klien, nomor kontrak, dan tab Detail Kontrak di halaman proyek. Selesai ketika AC-2.1 sampai AC-2.3 lulus.
3. **Termin.** Menambah termin dengan persentase, syarat progres, dan status, validasi total 100%, serta penguncian item dan termin yang sudah ditagih. Selesai ketika AC-3.1 sampai AC-3.3 lulus.
4. **Generate Invoice.** Menambah tombol di detail proyek yang mengisi form invoice dari termin, dengan perlindungan tagihan ganda dan sinkron status dengan invoice. Selesai ketika AC-4.1 sampai AC-4.4 lulus.

## Alur Generate Invoice

&#91;embedded content: alur generate invoice · 2 pemeriksaan, 3 hasil\]

Termin hanya bisa ditagih sekali: server memeriksa status termin dan mengubahnya dalam satu operasi, sehingga permintaan kedua untuk termin yang sama ditolak dengan 409. Status termin mengikuti status invoice:

| Status invoice | Status termin |
| --- | --- |
| `draft`, `sent`, `overdue` | `invoiced` |
| `paid` | `paid` |
| Dihapus | `draft` |

## Acceptance criteria

Setiap kriteria bisa diuji dengan satu skenario, dan yang menyangkut hak akses atau data uang diuji lewat API, bukan hanya lewat tampilan.

| Fase | ID | Kriteria |
| --- | --- | --- |
| 1 | AC-1.1 | Menekan Arsipkan mengubah `isArchived` menjadi true dan menyembunyikan proyek dari daftar utama. Proyek muncul di filter Arsip, dan Material Request, Lembur, Invoice, serta Dokumen miliknya tetap utuh. |
| 1 | AC-1.2 | Admin bisa memulihkan proyek terarsip. Role lain mendapat 403 saat mengarsipkan atau memulihkan. |
| 1 | AC-1.3 | Hapus permanen proyek yang dipakai Material Request, Lembur, Invoice, atau Dokumen ditolak dengan 409 dan pesan yang menyebut jenis datanya. Proyek `planning` tanpa relasi bisa dihapus. |
| 1 | AC-1.4 | Status `cancelled` tersedia di form dan filter. KPI hanya menghitung proyek yang tidak terarsip. |
| 2 | AC-2.1 | Admin atau manager menambah item dengan qty, satuan, dan harga satuan. `amount` item dan `contractValue` dihitung server dan tidak bisa diisi dari klien. |
| 2 | AC-2.2 | PM dan finance yang mengubah harga, item, atau nilai kontrak mendapat 403. |
| 2 | AC-2.3 | `taxRate` bisa diubah per proyek, dengan nilai awal 11. |
| 3 | AC-3.1 | Menyimpan termin dengan total persentase selain 100% ditolak dengan pesan yang menyebut selisihnya. |
| 3 | AC-3.2 | Syarat progres termin harus 0 sampai 100. `amount` termin dihitung dari `contractValue`. |
| 3 | AC-3.3 | Item dan termin yang sudah tertaut invoice tidak bisa diubah atau dihapus (409). |
| 4 | AC-4.1 | Tombol Generate Invoice hanya tampil untuk admin dan finance, pada termin `draft` yang syarat progresnya sudah tercapai. |
| 4 | AC-4.2 | Tombol membuka form invoice yang terisi: klien, alamat, nomor kontrak, rincian termin, subtotal, dan PPN dari `taxRate`. |
| 4 | AC-4.3 | Dua permintaan bersamaan untuk termin yang sama menghasilkan satu invoice, dan permintaan kedua ditolak dengan 409. |
| 4 | AC-4.4 | Termin menjadi `paid` saat invoicenya `paid`, dan kembali ke `draft` bila invoice dihapus. |

## Pertanyaan terbuka

Enam keputusan ini perlu jawaban dari Finance atau pimpinan sebelum fase 2 dimulai. Fase 1 tidak bergantung pada satupun.

- [ ] Apakah nilai kontrak dan persen termin dihitung sebelum PPN? PRD ini mengasumsikan sebelum PPN.
- [ ] Berapa tarif PPN yang dipakai, dan bagaimana PPh diperlakukan: siapa yang memotong, dan apakah perlu tertulis di faktur?
- [ ] Boleh manager mengubah harga dan BoQ, atau hanya admin? Tabel peran mengusulkan admin dan manager.
- [ ] Apakah ada uang muka yang dipotongkan dari termin berikutnya, dan apakah ada retensi (persen dan kapan dilepas)?
- [ ] Siapa yang menyetujui perubahan nilai kontrak setelah ada tagihan (addendum)?
- [ ] Siapa yang menyatakan progres cukup untuk menagih sebuah termin: PM saja, atau perlu persetujuan manager? Apakah BAST wajib diunggah sebelum termin akhir?
