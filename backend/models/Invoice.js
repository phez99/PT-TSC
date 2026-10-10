import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'Lot' },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true }
})

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
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
    clientName: {
      type: String,
      required: true
    },
    clientAddress: {
      type: String,
      default: ''
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    taxRate: {
      type: Number,
      default: 11 // PPN 11%
    },
    taxAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft'
    },
    notes: {
      type: String,
      default: 'Pembayaran ditransfer ke rekening resmi PT. Trimitra Solusindo Cemerlang.'
    }
  },
  {
    timestamps: true
  }
)

const Invoice = mongoose.model('Invoice', invoiceSchema)
export default Invoice
