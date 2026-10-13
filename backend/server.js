// Memuat backend/.env SEBELUM modul lain di-import (di ES Modules semua import dieksekusi
// lebih dulu, jadi dotenv.config() di bawah import bisa terlambat). Lihat config/env.js.
import './config/env.js';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './config/database.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import materialRequestRoutes from './routes/materialRequestRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import overtimeRoutes from './routes/overtimeRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Inisialisasi Express
const app = express();

// Koneksi ke Database MongoDB Cloud (dengan support Serverless Vercel)
// Di Vercel koneksi dibuat/dipakai ulang per request. Di mode standalone koneksi
// sudah dibuat saat server start (lihat bagian bawah), jadi ini hanya memastikan.
app.use(async (req, res, next) => {
  if (process.env.MONGODB_URI) {
    try {
      await connectDB();
    } catch (err) {
      console.error('[DB Connection Middleware Error]:', err.message);
    }
  }
  next();
});

// Global Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

// Body Parser diperbesar untuk foto selfie presensi
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Logger HTTP requests jika bukan di test
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check & Root Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'PT. Trimitra Solusindo Cemerlang API',
    environment: process.env.VERCEL ? 'Vercel Serverless' : 'Node.js Standalone',
    database: process.env.MONGODB_URI ? 'MongoDB Cloud Configured' : 'Missing MONGODB_URI',
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'PT. Trimitra Solusindo Cemerlang - Backend RESTful API',
    version: '1.0.0',
    documentation: '/api/v1',
    status: 'Running',
  });
});

// ================= DAFTAR ROUTE API v1 =================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/material-requests', materialRequestRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/overtime', overtimeRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/cms', cmsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Server Listening - Hanya dijalankan jika bukan di environment Vercel serverless
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  const startServer = async () => {
    // Konek ke database saat start, supaya berhasil/gagalnya langsung terlihat di terminal
    if (process.env.MONGODB_URI) {
      try {
        await connectDB(); // connectDB sudah mencetak log berhasil / gagal
      } catch {
        console.error(
          '[DB] Periksa MONGODB_URI dan Network Access (IP whitelist) di MongoDB Atlas.'
        );
        console.error('[DB] Server tetap berjalan; koneksi dicoba lagi pada request berikutnya.');
      }
    } else {
      console.warn('[DB] MONGODB_URI belum diset di file .env, server berjalan tanpa database.');
    }

    const server = app.listen(PORT, () => {
      console.log(`\n==========================================================`);
      console.log(`🚀 PT. TSC BACKEND SERVER BERJALAN`);
      console.log(`📡 URL API : http://localhost:${PORT}`);
      console.log(`🩺 Health  : http://localhost:${PORT}/api/health`);
      console.log(`🌐 Mode    : ${process.env.NODE_ENV || 'development'}`);
      console.log(`==========================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `[Server] Port ${PORT} sudah dipakai. Hentikan proses lain yang memakai port ini`
        );
        console.error(
          '[Server] (mis. backend yang dijalankan terpisah, padahal `quasar dev` sudah menjalankannya).'
        );
      } else {
        console.error('[Server Error]:', err.message);
      }
    });

    process.on('unhandledRejection', (err, _promise) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
      server.close(() => process.exit(1));
    });
  };

  startServer();
}

export default app;
