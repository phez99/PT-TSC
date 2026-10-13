// ============================================================
// LOADER ENV BACKEND
// Dipanggil paling awal oleh server.js dan utils/seeder.js.
//
// Kenapa perlu: di development, `quasar dev` meng-import backend/server.js
// dari folder ROOT, sehingga dotenv biasa membaca .env di root, sedangkan
// `pnpm run seed` dijalankan dari folder backend/ dan membaca backend/.env.
// Dua file .env bisa berbeda isi (mis. database yang berbeda).
//
// Urutan: backend/.env diutamakan; .env di folder kerja (root) hanya mengisi
// variabel yang belum ada. Di Vercel tidak ada file .env, variabel diambil
// dari Environment Variables project.
// ============================================================
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

dotenv.config({ path: path.join(backendDir, '.env'), quiet: true });
dotenv.config({ quiet: true }); // tidak menimpa variabel yang sudah terisi
