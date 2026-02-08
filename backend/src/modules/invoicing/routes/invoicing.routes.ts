/**
 * Invoicing Routes
 * Invoice and payment management endpoints
 */

import { Router } from 'express';
import { authenticate, authorizePermission } from '../../../shared/middleware/authenticate';
import { InvoiceController } from '../controllers/invoice.controller';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

// =====================================================
// INVOICE ROUTES
// =====================================================

// Get invoice statistics
router.get(
  '/invoices/stats',
  authenticate,
  authorizePermission('invoices', 'read'),
  InvoiceController.getStats
);

// Get overdue invoices
router.get(
  '/invoices/overdue',
  authenticate,
  authorizePermission('invoices', 'read'),
  InvoiceController.getOverdue
);

// Get all invoices (with filters)
router.get(
  '/invoices',
  authenticate,
  authorizePermission('invoices', 'read'),
  InvoiceController.getAll
);

// Get invoice by ID
router.get(
  '/invoices/:id',
  authenticate,
  authorizePermission('invoices', 'read'),
  InvoiceController.getById
);

// Get invoice PDF
router.get(
  '/invoices/:id/pdf',
  authenticate,
  authorizePermission('invoices', 'read'),
  InvoiceController.getPDF
);

// Create invoice
router.post(
  '/invoices',
  authenticate,
  authorizePermission('invoices', 'create'),
  InvoiceController.create
);

// Update invoice
router.put(
  '/invoices/:id',
  authenticate,
  authorizePermission('invoices', 'update'),
  InvoiceController.update
);

// Delete invoice (cancel)
router.delete(
  '/invoices/:id',
  authenticate,
  authorizePermission('invoices', 'delete'),
  InvoiceController.delete
);

// Send invoice
router.post(
  '/invoices/:id/send',
  authenticate,
  authorizePermission('invoices', 'send'),
  InvoiceController.sendInvoice
);

// =====================================================
// INVOICE LINE ITEMS ROUTES
// =====================================================

// Add line item to invoice
router.post(
  '/invoices/:id/line-items',
  authenticate,
  authorizePermission('invoices', 'update'),
  InvoiceController.addLineItem
);

// Update line item
router.put(
  '/invoices/:id/line-items/:lineItemId',
  authenticate,
  authorizePermission('invoices', 'update'),
  InvoiceController.updateLineItem
);

// Delete line item
router.delete(
  '/invoices/:id/line-items/:lineItemId',
  authenticate,
  authorizePermission('invoices', 'update'),
  InvoiceController.deleteLineItem
);

// =====================================================
// PAYMENT ROUTES
// =====================================================

// Get payment statistics
router.get(
  '/payments/stats',
  authenticate,
  authorizePermission('invoices', 'read'),
  PaymentController.getStats
);

// Get recent payments
router.get(
  '/payments/recent',
  authenticate,
  authorizePermission('invoices', 'read'),
  PaymentController.getRecent
);

// Get payments for an invoice
router.get(
  '/invoices/:invoiceId/payments',
  authenticate,
  authorizePermission('invoices', 'read'),
  PaymentController.getByInvoice
);

// Get payment by ID
router.get(
  '/payments/:id',
  authenticate,
  authorizePermission('invoices', 'read'),
  PaymentController.getById
);

// Record payment
router.post(
  '/payments',
  authenticate,
  authorizePermission('invoices', 'update'),
  PaymentController.create
);

// Update payment
router.put(
  '/payments/:id',
  authenticate,
  authorizePermission('invoices', 'update'),
  PaymentController.update
);

// Delete payment (refund)
router.delete(
  '/payments/:id',
  authenticate,
  authorizePermission('invoices', 'delete'),
  PaymentController.delete
);

export default router;
