import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    docNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['bast', 'spk', 'sika', 'drawing', 'submittal', 'other'],
      default: 'bast'
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
    client: {
      type: String,
      required: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'review', 'signed', 'archived'],
      default: 'draft'
    },
    fileUrl: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

const Document = mongoose.model('Document', documentSchema)
export default Document
