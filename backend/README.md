# PT. Trimitra Solusindo Cemerlang - Backend RESTful API

Backend resmi untuk sistem ERP & Portal Operasional Lapangan **PT. Trimitra Solusindo Cemerlang (TSC)** yang dibangun menggunakan **Node.js, Express.js, dan MongoDB Cloud (MongoDB Atlas)**.

---

## 📁 Struktur Folder

```
backend/
├── config/
│   └── database.js               # Koneksi Mongoose ke MongoDB Cloud / Atlas
├── controllers/                  # Logika Bisnis & Handler Endpoint
│   ├── authController.js         # Autentikasi, Profil, dan Kelola Pengguna
│   ├── attendanceController.js   # Presensi Geotagging GPS & Selfie Wajah
│   ├── projectController.js      # Manajemen Data & Progres Proyek
│   ├── materialRequestController.js # Alur Approval Permintaan Material (MR)
│   ├── leaveController.js        # Pengajuan & Persetujuan Cuti / Izin
│   ├── overtimeController.js     # Surat Perintah Kerja Lembur (SPKL)
│   ├── invoiceController.js      # Penagihan Termin Proyek & PPN 11%
│   ├── documentController.js     # Dokumen BAST, SPK & SIKA
│   ├── feedController.js         # Papan Pengumuman K3 & Diskusi Lapangan
│   └── cmsController.js          # Pengelolaan Konten Website Landing Page
├── middleware/                   # Interseptor & Keamanan
│   ├── auth.js                   # Verifikasi JWT Token (Bearer Auth)
│   ├── role.js                   # Role-Based Access Control (RBAC)
│   ├── errorMiddleware.js        # Global Error Handler & MongoDB Cast/Validation
│   └── notFound.js               # Handler 404 Route Not Found
├── models/                       # Skema Data Mongoose
│   ├── User.js                   # Pengguna & Enkripsi Password Bcrypt
│   ├── Attendance.js             # Log Presensi, Koordinat Satelit & Foto Bukti
│   ├── Project.js                # Data Proyek, Nilai Kontrak & Timeline
│   ├── MaterialRequest.js        # Item Suku Cadang & Timeline Approval
│   ├── Leave.js                  # Kuota Cuti & Alasan Izin
│   ├── Overtime.js               # SPKL, Durasi Jam & Kompensasi
│   ├── Invoice.js                # Penagihan, Subtotal & Pajak
│   ├── Document.js               # Berita Acara & Pengendalian Proyek
│   ├── FeedPost.js               # Postingan Internal, Like, dan Komentar
│   └── CmsContent.js             # Teks Hero, Profil & Kontak Landing Page
├── routes/                       # Rute API Express v1
│   ├── authRoutes.js
│   ├── attendanceRoutes.js
│   ├── projectRoutes.js
│   ├── materialRequestRoutes.js
│   ├── leaveRoutes.js
│   ├── overtimeRoutes.js
│   ├── invoiceRoutes.js
│   ├── documentRoutes.js
│   ├── feedRoutes.js
│   └── cmsRoutes.js
├── utils/
│   ├── apiResponse.js            # Standarisasi Format JSON Response
│   └── seeder.js                 # Seeder Database Awal Otomatis
├── .env.example                  # Template Variabel Lingkungan
├── package.json                  # Dependensi & Script Node.js
└── server.js                     # File Utama Aplikasi Express
```

---

## ⚙️ Persyaratan Sistem
* Node.js v18+ atau v20+
* Akun MongoDB Cloud ([MongoDB Atlas Free Tier M0](https://www.mongodb.com/cloud/atlas))

---

## 🚀 Panduan Memulai (Quick Start)

### 1. Masuk ke Folder Backend & Install Dependensi
```bash
cd backend
npm install
```

### 2. Atur Environment Variable
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan masukkan URI koneksi MongoDB Atlas Anda:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tsc_erp_db?retryWrites=true&w=majority
JWT_SECRET=rahasia_jwt_pt_tsc_2026_super_aman
CLIENT_URL=http://localhost:3000
```

### 3. Jalankan Seeder Database
Mengisi database dengan akun pengguna awal, data proyek, riwayat presensi, pengumuman K3, dan konten CMS:
```bash
npm run seed
```

### 4. Jalankan Server Backend
* **Mode Development (Auto-Reload)**:
  ```bash
  npm run dev
  ```
* **Mode Production**:
  ```bash
  npm start
  ```
Server akan aktif di: `http://localhost:5000`

---

## 🛡️ Format Standar Respons API

### Respons Berhasil (Success)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operasi berhasil dilakukan",
  "data": { ... },
  "meta": {
    "total": 10
  }
}
```

### Respons Gagal (Error)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Format ID tidak valid atau data tidak lengkap"
}
```

---

## 📋 Daftar Akun Pengguna Bawaan (Hasil Seeder)

| Role | Nama | Email | Password |
|---|---|---|---|
| **Admin** | Ir. Hendra Gunawan | `admin@tsc.co.id` | `password` |
| **Manager** | Bambang Trihatmojo, S.T. | `manager@tsc.co.id` | `password` |
| **Project Manager** | Hendro Wijaya, S.Kom. | `pm@tsc.co.id` | `password` |
| **Finance** | Siti Rahmawati, S.E. | `finance@tsc.co.id` | `password` |
| **Teknisi Lapangan** | Staf Teknisi | `staff@tsc.co.id` | `password` |

---

## 📡 Ringkasan Endpoint Utama (API v1)

### 1. Autentikasi (`/api/v1/auth`)
* `POST /login` - Login email & password (menghasilkan JWT)
* `GET  /me` - Ambil profil pengguna saat ini
* `PUT  /change-password` - Ubah kata sandi
* `GET  /users` - Daftar seluruh karyawan *(Admin & Manager)*
* `POST /users` - Tambah karyawan baru *(Admin)*

### 2. Presensi Geotagging & Kamera (`/api/v1/attendance`)
* `POST /clock-in` - Presensi Masuk (Selfie base64 + GPS + APD checklist)
* `POST /clock-out` - Presensi Pulang (Foto selesai tugas + GPS)
* `GET  /today` - Cek status presensi saya hari ini
* `GET  /` - Seluruh riwayat presensi harian

### 3. Proyek Lapangan (`/api/v1/projects`)
* `GET    /` - Daftar proyek (dengan filter status & pencarian)
* `GET    /:id` - Detail spesifik proyek
* `POST   /` - Tambah proyek baru *(Admin, Manager, PM)*
* `PUT    /:id` - Update progres & timeline proyek

### 4. Permintaan Material / MR (`/api/v1/material-requests`)
* `GET  /` - Daftar permohonan material
* `POST /` - Buat permohonan baru dari lapangan
* `PUT  /:id/status` - Persetujuan status (Review, Approved, Rejected)

### 5. Cuti & Lembur (`/api/v1/leaves`, `/api/v1/overtime`)
* `POST /api/v1/leaves` - Pengajuan cuti/izin tahunan
* `PUT  /api/v1/leaves/:id/status` - Approval cuti atasan
* `POST /api/v1/overtime` - Pengajuan surat lembur SPKL
* `PUT  /api/v1/overtime/:id/status` - Approval SPKL lembur

### 6. Papan Informasi & Diskusi (`/api/v1/feed`)
* `GET  /` - Feed pengumuman K3, milestone & teknis
* `POST /` - Terbitkan briefing baru *(Admin, Manager, PM)*
* `POST /:id/like` - Toggle suka postingan
* `POST /:id/comments` - Kirim tanggapan diskusi tim

### 7. CMS Website Utama (`/api/v1/cms`)
* `GET  /` - Ambil konten landing page *(Publik)*
* `PUT  /` - Perbarui konten hero, profil, visi-misi, kontak *(Admin, Manager)*
* `POST /reset` - Reset konten ke teks standar
