import mongoose from 'mongoose'

const overtimeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    position: {
      type: String,
      default: 'Teknisi Lapangan'
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    projectName: {
      type: String,
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    startTime: {
      type: String, // HH:mm
      required: true
    },
    endTime: {
      type: String, // HH:mm
      required: true
    },
    hours: {
      type: Number,
      required: true,
      min: 0.5
    },
    tasks: {
      type: String,
      required: [true, 'Uraian pekerjaan lembur wajib diisi']
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approverName: {
      type: String,
      default: null
    },
    approvalNotes: {
      type: String,
      default: null
    },
    compensationAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
)

const Overtime = mongoose.model('Overtime', overtimeSchema)
export default Overtime
