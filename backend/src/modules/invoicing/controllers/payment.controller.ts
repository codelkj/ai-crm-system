/**
 * Payment Controller
 * Handles invoice payment recording and management
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import paymentService, { CreatePaymentDTO } from '../services/payment.service';
import invoiceService from '../services/invoice.service';
import { auditLog, auditCustomAction } from '../../../shared/middleware/audit.middleware';
import { AuditAction } from '../../legal-crm/services/audit-log.service';

export class PaymentController {
  /**
   * Get payments for an invoice
   */
  static getByInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { invoiceId } = req.params;

    // Verify invoice belongs to user's firm
    const invoice = await invoiceService.getById(invoiceId);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.firm_id !== req.user?.firm_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const payments = await paymentService.getByInvoice(invoiceId);

    res.json({
      success: true,
      data: payments
    });
  });

  /**
   * Get payment by ID
   */
  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const payment = await paymentService.getById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Verify payment's invoice belongs to user's firm
    const invoice = await invoiceService.getById(payment.invoice_id);
    if (!invoice || invoice.firm_id !== req.user?.firm_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  });

  /**
   * Record a payment
   */
  static create = [
    auditLog(AuditAction.CREATE, 'invoice_payments'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      const data: CreatePaymentDTO = req.body;

      // Verify invoice belongs to user's firm
      const invoice = await invoiceService.getById(data.invoice_id);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      if (invoice.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Validate payment amount
      if (data.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than zero'
        });
      }

      if (data.amount > invoice.balance_due) {
        return res.status(400).json({
          success: false,
          message: `Payment amount exceeds balance due (${invoice.balance_due})`
        });
      }

      const payment = await paymentService.create(userId, data);

      // Log custom action
      await auditCustomAction(
        req,
        'PAYMENT_RECORDED',
        'invoices',
        data.invoice_id,
        `Payment of ${data.amount} recorded`
      );

      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment recorded successfully'
      });
    })
  ];

  /**
   * Update payment
   */
  static update = [
    auditLog(AuditAction.UPDATE, 'invoice_payments'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const data: Partial<CreatePaymentDTO> = req.body;

      // Get existing payment
      const existing = await paymentService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Verify payment's invoice belongs to user's firm
      const invoice = await invoiceService.getById(existing.invoice_id);
      if (!invoice || invoice.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const payment = await paymentService.update(id, data);

      res.json({
        success: true,
        data: payment,
        message: 'Payment updated successfully'
      });
    })
  ];

  /**
   * Delete payment (refund)
   */
  static delete = [
    auditLog(AuditAction.DELETE, 'invoice_payments'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;

      // Get existing payment
      const existing = await paymentService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Verify payment's invoice belongs to user's firm
      const invoice = await invoiceService.getById(existing.invoice_id);
      if (!invoice || invoice.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const success = await paymentService.delete(id);

      // Log custom action
      await auditCustomAction(
        req,
        'PAYMENT_DELETED',
        'invoices',
        existing.invoice_id,
        `Payment of ${existing.amount} deleted/refunded`
      );

      res.json({
        success: true,
        message: 'Payment deleted successfully'
      });
    })
  ];

  /**
   * Get payment statistics
   */
  static getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
    const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

    const stats = await paymentService.getStats(firmId, startDate, endDate);

    res.json({
      success: true,
      data: stats
    });
  });

  /**
   * Get recent payments
   */
  static getRecent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const payments = await paymentService.getRecent(firmId, limit);

    res.json({
      success: true,
      data: payments
    });
  });
}
