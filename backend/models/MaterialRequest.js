import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unit: { type: String, required: true, default: 'Pcs' },
  specs: { type: String, default: '' },
  notes: { type: String, default: '' },
});

const timelineSchema = new mongoose.Schema({
  status: { type: String, default: 'submitted' }, // <-- Tambahkan ini
  action: { type: String, required: true },
  byName: { type: String, required: true },
  byRole: { type: String, required: true },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const materialRequestSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Proyek penugasan wajib dipilih'],
    },
    projectName: {
      type: String,
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: {
      type: String,
      required: true,
    },
    items: [itemSchema],
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'review', 'approved', 'rejected', 'processed', 'fulfilled'],
      default: 'submitted',
    },
    neededDate: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    timeline: [timelineSchema],
  },
  {
    timestamps: true,
  }
);

const MaterialRequest = mongoose.model('MaterialRequest', materialRequestSchema);
export default MaterialRequest;
