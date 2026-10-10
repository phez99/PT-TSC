import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id wajib disertakan']
    },
    userName: {
      type: String,
      required: true
    },
    userRole: {
      type: String,
      default: 'staff'
    },
    position: {
      type: String,
      default: 'Teknisi Lapangan'
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    clockIn: {
      type: String, // Format: HH:mm
      required: true
    },
    clockOut: {
      type: String,
      default: null
    },
    location: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['ontime', 'late', 'leave', 'sick'],
      default: 'ontime'
    },
    notes: {
      type: String,
      default: 'Hadir dan bertugas di lapangan/kantor.'
    },
    photo: {
      type: String, // Base64 data URL atau URL CDN
      default: null
    },
    coords: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      address: { type: String, default: null }
    },
    clockOutPhoto: {
      type: String,
      default: null
    },
    clockOutCoords: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null }
    },
    apdList: {
      type: [String],
      default: []
    },
    healthStatus: {
      type: String,
      enum: ['fit', 'unfit'],
      default: 'fit'
    }
  },
  {
    timestamps: true
  }
)

// Index compound untuk memastikan user hanya bisa clock in sekali per tanggal
attendanceSchema.index({ user: 1, date: 1 }, { unique: true })

const Attendance = mongoose.model('Attendance', attendanceSchema)
export default Attendance
