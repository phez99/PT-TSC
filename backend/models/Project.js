import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Kode proyek wajib diisi'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Nama proyek wajib diisi'],
      trim: true
    },
    client: {
      type: String,
      required: [true, 'Nama klien / pemberi kerja wajib diisi'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Lokasi proyek wajib diisi']
    },
    status: {
      type: String,
      enum: ['planning', 'ongoing', 'done', 'on_hold'],
      default: 'ongoing'
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    contractValue: {
      type: Number,
      default: 0
    },
    startDate: {
      type: String, // YYYY-MM-DD
      default: null
    },
    endDate: {
      type: String, // YYYY-MM-DD
      default: null
    },
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

const Project = mongoose.model('Project', projectSchema)
export default Project
