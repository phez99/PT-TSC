import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Kode proyek wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Nama proyek wajib diisi'],
      trim: true,
    },
    client: {
      type: String,
      required: [true, 'Nama klien / pemberi kerja wajib diisi'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Lokasi proyek wajib diisi'],
      trim: true,
    },
    // Kategori proyek (mis. electronic, electrical, mechanical) — nilainya
    // mengikuti PROJECT_CATEGORIES di frontend (src/config/projects.js)
    category: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['planning', 'ongoing', 'hold', 'done', 'cancelled'], // sama dengan PROJECT_STATUSES di frontend
      default: 'ongoing',
    },
    // Arsip = penanda tampilan (soft delete). Terpisah dari status bisnis: proyek 'cancelled'
    // tetap tampil di laporan, proyek terarsip disembunyikan dari daftar utama dan bisa dipulihkan.
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    archiveReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Alasan arsip maksimal 500 karakter'],
      default: '',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    contractValue: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    endDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
    // Anggota tim proyek (subdokumen). `user` opsional, diisi jika anggota adalah akun sistem.
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
        name: {
          type: String,
          required: [true, 'Nama anggota wajib diisi'],
          trim: true,
        },
        role: {
          type: String,
          trim: true,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
