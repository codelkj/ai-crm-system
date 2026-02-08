/**
 * Invoice Controller
 * Handles invoice CRUD and operations
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/authenticate';
import { asyncHandler } from '../../../shared/utils/async-handler';
import invoiceService, { CreateInvoiceDTO, UpdateInvoiceDTO } from '../services/invoice.service';
import invoiceNumberService from '../services/invoice-number.service';
import invoicePDFService from '../services/invoice-pdf.service';
import { auditLog, auditCustomAction } from '../../../shared/middleware/audit.middleware';
import { AuditAction } from '../../legal-crm/services/audit-log.service';

export class InvoiceController {
  /**
   * Get all invoices for firm
   */
  static getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const filters = {
      status: req.query.status as string,
      client_id: req.query.client_id as string,
      start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
      end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 50
    };

    const result = await invoiceService.getAll(firmId, filters);

    res.json({
      success: true,
      data: result.invoices,
      pagination: {
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        pages: Math.ceil(result.total / filters.limit)
      }
    });
  });

  /**
   * Get invoice by ID
   */
  static getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const invoice = await invoiceService.getById(id);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Verify invoice belongs to user's firm
    if (invoice.firm_id !== req.user?.firm_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get line items
    const lineItems = await invoiceService.getLineItems(id);

    res.json({
      success: true,
      data: {
        ...invoice,
        line_items: lineItems
      }
    });
  });

  /**
   * Create invoice
   */
  static create = [
    auditLog(AuditAction.CREATE, 'invoices'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const firmId = req.user?.firm_id;
      const userId = req.user?.id;

      if (!firmId || !userId) {
        return res.status(400).json({
          success: false,
          message: 'User not associated with any firm'
        });
      }

      const data: CreateInvoiceDTO = req.body;

      // Generate invoice number
      const invoiceNumber = await invoiceNumberService.generateInvoiceNumber(firmId);

      // Create invoice
      const invoice = await invoiceService.create(firmId, userId, data, invoiceNumber);

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      });
    })
  ];

  /**
   * Update invoice
   */
  static update = [
    auditLog(AuditAction.UPDATE, 'invoices'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;
      const data: UpdateInvoiceDTO = req.body;

      // Verify invoice belongs to user's firm
      const existing = await invoiceService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      if (existing.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const invoice = await invoiceService.update(id, data);

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice updated successfully'
      });
    })
  ];

  /**
   * Delete invoice
   */
  static delete = [
    auditLog(AuditAction.DELETE, 'invoices'),
    asyncHandler(async (req: AuthRequest, res: Response) => {
      const { id } = req.params;

      // Verify invoice belongs to user's firm
      const existing = await invoiceService.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }

      if (existing.firm_id !== req.user?.firm_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await invoiceService.delete(id);

      res.json({
        success: true,
        message: 'Invoice cancelled successfully'
      });
    })
  ];

  /**
   * Add line item to invoice
   */
  static addLineItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    // Verify invoice belongs to user's firm
    const invoice = await invoiceService.getById(id);
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

    const lineItem = await invoiceService.addLineItem(id, data);

    res.status(201).json({
      success: true,
      data: lineItem,
      message: 'Line item added successfully'
    });
  });

  /**
   * Update line item
   */
  static updateLineItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, lineItemId } = req.params;
    const data = req.body;

    const lineItem = await invoiceService.updateLineItem(lineItemId, data);
    if (!lineItem) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    res.json({
      success: true,
      data: lineItem,
      message: 'Line item updated successfully'
    });
  });

  /**
   * Delete line item
   */
  static deleteLineItem = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { lineItemId } = req.params;

    const success = await invoiceService.deleteLineItem(lineItemId);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Line item not found'
      });
    }

    res.json({
      success: true,
      message: 'Line item deleted successfully'
    });
  });

  /**
   * Send invoice
   */
  static sendInvoice = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Verify invoice belongs to user's firm
    const invoice = await invoiceService.getById(id);
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

    await invoiceService.sendInvoice(id);

    // Log custom action
    await auditCustomAction(req, AuditAction.SEND, 'invoices', id, 'Invoice sent to client');

    res.json({
      success: true,
      message: 'Invoice sent successfully'
    });
  });

  /**
   * Get invoice PDF
   */
  static getPDF = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Verify invoice belongs to user's firm
    const invoice = await invoiceService.getById(id);
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

    const pdfBuffer = await invoicePDFService.generatePDF(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
    res.send(pdfBuffer);
  });

  /**
   * Get overdue invoices
   */
  static getOverdue = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const clientId = req.query.client_id as string;
    const invoices = await invoiceService.getOverdueInvoices(firmId, clientId);

    res.json({
      success: true,
      data: invoices
    });
  });

  /**
   * Get invoice statistics
   */
  static getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const firmId = req.user?.firm_id;
    if (!firmId) {
      return res.status(400).json({
        success: false,
        message: 'User not associated with any firm'
      });
    }

    const stats = await invoiceService.getStats(firmId);

    res.json({
      success: true,
      data: stats
    });
  });
}
