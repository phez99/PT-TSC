import mongoose from 'mongoose'

const leaveSchema = new mongoose.Schema(
  {
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
    type: {
      type: String,
      enum: ['annual', 'sick', 'special', 'unpaid'],
      default: 'annual'
    },
    startDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    endDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1
    },
    reason: {
      type: String,
      required: [true, 'Alasan cuti / izin wajib diisi']
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
    }
  },
  {
    timestamps: true
  }
)

const Leave = mongoose.model('Leave', leaveSchema)
export default Leave
