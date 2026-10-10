import Invoice from '../models/Invoice.js'
import Project from '../models/Project.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getInvoices = async (req, res, next) => {
  try {
    const { status, project: projectId } = req.query
    const query = {}

    if (status) query.status = status
    if (projectId) query.project = projectId

    const invoices = await Invoice.find(query).sort({ date: -1, createdAt: -1 })

    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.totalAmount, 0)

    const pendingRevenue = invoices
      .filter(i => i.status === 'sent')
      .reduce((sum, i) => sum + i.totalAmount, 0)

    return successResponse(res, {
      statusCode: 200,
      message: 'Daftar invoice & penagihan berhasil dimuat.',
      data: invoices,
      meta: {
        totalInvoices: invoices.length,
        paidRevenue: totalRevenue,
        pendingRevenue
      }
    })
  } catch (err) {
    next(err)
  }
}

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('project')
    if (!invoice) {
      return errorResponse(res, { statusCode: 404, message: 'Invoice tidak ditemukan.' })
    }
    return successResponse(res, { statusCode: 200, data: invoice })
  } catch (err) {
    next(err)
  }
}

export const createInvoice = async (req, res, next) => {
  try {
    const { projectId, invoiceNumber, date, dueDate, items, notes } = req.body

    const project = await Project.findById(projectId)
    if (!project) {
      return errorResponse(res, { statusCode: 404, message: 'Proyek penagihan tidak ditemukan.' })
    }

    const calculatedItems = (items || []).map(item => ({
      description: item.description,
      qty: Number(item.qty),
      unit: item.unit || 'Lot',
      unitPrice: Number(item.unitPrice),
      amount: Number(item.qty) * Number(item.unitPrice)
    }))

    const subtotal = calculatedItems.reduce((sum, i) => sum + i.amount, 0)
    const taxRate = 11 // PPN 11%
    const taxAmount = Math.round(subtotal * (taxRate / 100))
    const totalAmount = subtotal + taxAmount

    const newInvoice = await Invoice.create({
      invoiceNumber,
      project: project._id,
      projectName: project.name,
      clientName: project.client,
      date,
      dueDate,
      items: calculatedItems,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount,
      status: 'draft',
      notes
    })

    return successResponse(res, {
      statusCode: 201,
      message: `Invoice ${newInvoice.invoiceNumber} berhasil dibuat dengan total Rp ${totalAmount.toLocaleString('id-ID')}.`,
      data: newInvoice
    })
  } catch (err) {
    next(err)
  }
}

export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const invoice = await Invoice.findById(req.params.id)

    if (!invoice) {
      return errorResponse(res, { statusCode: 404, message: 'Invoice tidak ditemukan.' })
    }

    invoice.status = status
    await invoice.save()

    return successResponse(res, {
      statusCode: 200,
      message: `Status invoice ${invoice.invoiceNumber} diubah menjadi ${status}.`,
      data: invoice
    })
  } catch (err) {
    next(err)
  }
}
