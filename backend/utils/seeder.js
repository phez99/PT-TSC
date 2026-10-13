import '../config/env.js';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Attendance from '../models/Attendance.js';
import MaterialRequest from '../models/MaterialRequest.js';
import Leave from '../models/Leave.js';
import Overtime from '../models/Overtime.js';
import Invoice from '../models/Invoice.js';
import Document from '../models/Document.js';
import FeedPost from '../models/FeedPost.js';
import CmsContent from '../models/CmsContent.js';

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI belum diset di file .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Seeder] Terhubung ke MongoDB Cloud...');

    // 1. Bersihkan koleksi lama
    await User.deleteMany({});
    await Project.deleteMany({});
    await Attendance.deleteMany({});
    await MaterialRequest.deleteMany({});
    await Leave.deleteMany({});
    await Overtime.deleteMany({});
    await Invoice.deleteMany({});
    await Document.deleteMany({});
    await FeedPost.deleteMany({});
    await CmsContent.deleteMany({});
    console.log('[Seeder] Koleksi lama berhasil dibersihkan.');

    // 2. Seed Pengguna (Users)
    // Catatan: password di User model otomatis di-hash oleh bcrypt hook
    const users = await User.create([
      {
        name: 'Ir. Hendra Gunawan',
        email: 'admin@tsc.co.id',
        password: 'password',
        role: 'admin',
        position: 'Direktur Utama / Administrator',
        phone: '+62 811 8888 001',
      },
      {
        name: 'Bambang Trihatmojo, S.T.',
        email: 'manager@tsc.co.id',
        password: 'password',
        role: 'manager',
        position: 'Manager Operasional',
        phone: '+62 812 7777 002',
      },
      {
        name: 'Hendro Wijaya, S.Kom.',
        email: 'pm@tsc.co.id',
        password: 'password',
        role: 'pm',
        position: 'Project Manager (PM)',
        phone: '+62 813 6666 003',
      },
      {
        name: 'Siti Rahmawati, S.E.',
        email: 'finance@tsc.co.id',
        password: 'password',
        role: 'finance',
        position: 'Staff Finance & Accounting',
        phone: '+62 815 5555 004',
      },
      {
        name: 'Staf Teknisi',
        email: 'staff@tsc.co.id',
        password: 'password',
        role: 'staff',
        position: 'Teknisi Lapangan',
        phone: '+62 817 4444 005',
      },
    ]);
    console.log(`[Seeder] ${users.length} Akun Pengguna berhasil dibuat.`);

    // 3. Seed Proyek (Projects)
    const projects = await Project.create([
      {
        code: 'PRJ-2026-001',
        name: 'Instalasi CCTV & Access Control Puri Mansion',
        client: 'Agung Sedayu Group',
        location: 'Jakarta Barat',
        category: 'electronic',
        status: 'ongoing',
        progress: 68,
        contractValue: 485000000,
        startDate: '2026-08-01',
        endDate: '2026-11-30',
        projectManager: users[2]._id,
        description:
          'Pengadaan dan instalasi 128 titik IP camera, access control lift, dan server NVR redundant.',
        members: [
          { user: users[2]._id, name: users[2].name, role: 'Project Manager' },
          { user: users[4]._id, name: users[4].name, role: 'Teknisi Lapangan' },
        ],
      },
      {
        code: 'PRJ-2026-002',
        name: 'Pengadaan & Pemasangan Panel Genset 500kVA',
        client: 'PT Bio Farma (Persero)',
        location: 'Kawasan Industri MM2100 Bekasi',
        category: 'electrical',
        status: 'ongoing',
        progress: 85,
        contractValue: 720000000,
        startDate: '2026-07-15',
        endDate: '2026-10-25',
        projectManager: users[2]._id,
        description:
          'Pekerjaan mekanikal elektrikal sinkronisasi ATS/AMF dan kabel power NYFGBY 4x185mm.',
      },
      {
        code: 'PRJ-2026-003',
        name: 'Revitalisasi Jaringan Backbone Fiber Optic',
        client: 'Sahid Jaya Hotel & Resorts',
        location: 'Jakarta Pusat',
        category: 'electronic',
        status: 'done',
        progress: 100,
        contractValue: 310000000,
        startDate: '2026-05-10',
        endDate: '2026-08-20',
        projectManager: users[2]._id,
        description:
          'Penarikan FO 24 core single-mode antar gedung dan instalasi rak server switch core.',
      },
    ]);
    console.log(`[Seeder] ${projects.length} Data Proyek berhasil dibuat.`);

    // 4. Seed Presensi Lapangan (Attendance)
    const today = new Date().toISOString().slice(0, 10);
    await Attendance.create([
      {
        user: users[4]._id,
        userName: users[4].name,
        userRole: users[4].role,
        position: users[4].position,
        date: today,
        clockIn: '07:55',
        clockOut: null,
        location: 'Proyek Puri Mansion Apartemen',
        status: 'ontime',
        notes: 'Pemasangan kabel tray FO dan terminasi patch panel rack 2.',
        coords: {
          latitude: -6.183412,
          longitude: 106.721405,
          accuracy: 12,
          address: 'Jl. Lingkar Luar Barat No. 8, Kembangan, Jakarta Barat',
        },
        apdList: ['Helm Keselamatan (Safety Helmet)', 'Rompi Reflektor', 'Sepatu Safety'],
        healthStatus: 'fit',
      },
      {
        user: users[2]._id,
        userName: users[2].name,
        userRole: users[2].role,
        position: users[2].position,
        date: today,
        clockIn: '08:10',
        clockOut: null,
        location: 'Kawasan Industri MM2100 Bekasi',
        status: 'ontime',
        notes: 'Supervisi pengiriman panel genset dan koordinasi K3.',
        coords: {
          latitude: -6.311245,
          longitude: 107.098712,
          accuracy: 15,
          address: 'Kawasan Industri MM2100 Blok C-2, Cikarang Barat, Bekasi',
        },
        apdList: ['Helm Keselamatan (Safety Helmet)', 'Rompi Reflektor', 'Sepatu Safety'],
        healthStatus: 'fit',
      },
    ]);
    console.log('[Seeder] Data Presensi Geotagging berhasil dibuat.');

    // 5. Seed Material Requests
    await MaterialRequest.create([
      {
        code: 'MR-2026-001',
        project: projects[0]._id,
        projectName: projects[0].name,
        requester: users[4]._id,
        requesterName: users[4].name,
        items: [
          {
            itemName: 'Kabel UTP Cat6 CommScope',
            qty: 4,
            unit: 'Roll (305m)',
            specs: 'CM Rated Blue',
            notes: 'Untuk lantai 2 & 3',
          },
          {
            itemName: 'Konektor RJ45 Cat6 Modular',
            qty: 2,
            unit: 'Box (100pcs)',
            specs: 'Gold Plated Shielded',
            notes: 'Terminasi patch cord',
          },
        ],
        urgency: 'high',
        status: 'approved',
        neededDate: '2026-10-15',
        notes: 'Kebutuhan mendesak untuk penarikan kabel zona lift.',
        timeline: [
          { action: 'Pengajuan Dibuat', byName: users[4].name, byRole: 'staff' },
          {
            action: 'Disetujui Manager',
            byName: users[1].name,
            byRole: 'manager',
            notes: 'Disetujui sesuai RAB proyek',
          },
        ],
      },
    ]);
    console.log('[Seeder] Data Material Request berhasil dibuat.');

    // 6. Seed Feed Posts (Papan Informasi & K3)
    await FeedPost.create([
      {
        author: {
          id: users[1]._id,
          name: users[1].name,
          position: users[1].position,
          role: users[1].role,
          avatarColor: 'navy-900',
        },
        category: 'safety',
        title: 'Wajib K3 & APD Lengkap di Proyek Sudirman & Puri Mansion',
        content:
          'Mengingat sedang berlangsung inspeksi K3 dan pekerjaan di ketinggian pada instalasi CCTV lantai 25, seluruh tim teknisi lapangan diwajibkan mengenakan Full Body Harness, Safety Helmet, dan Rompi Reflektor standar. Mohon koordinasi dengan pengawas K3 setempat.',
        taggedUsers: ['Staf Teknisi', 'Ahmad Dani'],
        projectName: 'Instalasi CCTV & Access Control Puri Mansion',
        likes: [users[0]._id, users[4]._id],
        comments: [
          {
            author: {
              id: users[4]._id,
              name: users[4].name,
              position: users[4].position,
              role: 'staff',
            },
            text: 'Siap Pak Bambang, seluruh APD dan lanyard ganda sudah dicek bersama supervisor sebelum naik tower.',
          },
        ],
      },
    ]);
    console.log('[Seeder] Data Papan Informasi & Diskusi berhasil dibuat.');

    // 7. Seed CMS Content
    await CmsContent.create({
      hero: {
        badgeText: 'Security System, MEP & Advertising Solutions',
        titlePrefix: 'Solusi Terintegrasi',
        titleHighlight: 'Security System & MEP Terpercaya',
        description:
          'PT. Trimitra Solusindo Cemerlang menghadirkan solusi terintegrasi di bidang Security System, Mechanical, Electrical & Plumbing (MEP), Advertising, serta Pengadaan Material.',
        ctaPrimaryLabel: 'Lihat Layanan Kami',
        ctaSecondaryLabel: 'Hubungi Kami',
        backgroundImage: '/01.jpg',
        highlights: [
          { label: 'Berdiri Sejak', value: '2024', icon: 'event' },
          { label: 'Standar Kerja', value: 'K3 & Mutu', icon: 'shield' },
          { label: 'Cakupan', value: 'Gedung & Industri', icon: 'apartment' },
        ],
      },
      about: {
        title: 'PT. Trimitra Solusindo Cemerlang',
        paragraphs: [
          'PT. Trimitra Solusindo Cemerlang merupakan perusahaan yang bergerak di bidang Security System, Mechanical, Electrical & Plumbing (MEP), Advertising, serta Pengadaan Material.',
          'Perusahaan ini berdiri pada tahun 2024 sebagai respon terhadap kebutuhan pasar yang terus berkembang di sektor tersebut.',
          'Kami berkomitmen untuk memberikan layanan terbaik dengan mengutamakan kualitas pekerjaan, keselamatan kerja, dan kepuasan mitra.',
        ],
      },
      visionMission: {
        vision:
          'Menjadi perusahaan penyedia solusi terintegrasi yang terdepan, profesional, dan tepercaya di bidang Security System, MEP, Advertising, serta Pengadaan Material di Indonesia.',
        missions: [
          'Menyediakan layanan berkualitas tinggi dengan standar keselamatan dan ketepatan waktu.',
          'Membangun kemitraan jangka panjang berlandaskan integritas dan kepercayaan.',
          'Terus berinovasi mengikuti perkembangan teknologi keamanan dan infrastruktur modern.',
        ],
      },
      contact: {
        title: "Let's Work Together With TSC",
        description:
          'Kami terbuka untuk menjalin kerja sama sebagai partner, subkontraktor, maupun joint operation dalam pelaksanaan proyek.',
        phone: '+62 812 1050 1150',
        email: 'trimitrasolusindocemerlang@gmail.com',
        address: 'Legenda Wisata Ruko Newton Square U18/30, Nagrak, Gn. Putri, Bogor',
        officeHours: 'Senin - Jumat: 08:30 - 17:00 WIB',
      },
    });
    console.log('[Seeder] Data Konten CMS Website Utama berhasil dibuat.');

    console.log('\n======================================================');
    console.log('✅ SEEDING DATABASE MONGODB CLOUD BERHASIL LENGKAP!');
    console.log('======================================================');
    console.log('Akun Login Bawaan:');
    console.log('1. Admin   : admin@tsc.co.id   / password');
    console.log('2. Manager : manager@tsc.co.id / password');
    console.log('3. PM      : pm@tsc.co.id      / password');
    console.log('4. Finance : finance@tsc.co.id / password');
    console.log('5. Teknisi : staff@tsc.co.id   / password');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedData();
