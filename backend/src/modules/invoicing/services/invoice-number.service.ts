/**
 * Invoice Number Service
 * Generates unique invoice numbers in format: INV-YYYY-####
 */

import pool from '../../../config/database';

class InvoiceNumberService {
  /**
   * Generate next invoice number for firm
   * Format: INV-2026-0001, INV-2026-0002, etc.
   */
  async generateInvoiceNumber(firmId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `INV-${currentYear}-`;

    // Get the highest invoice number for this firm and year
    const result = await pool.query(
      `SELECT invoice_number
       FROM invoices
       WHERE firm_id = $1
         AND invoice_number LIKE $2
       ORDER BY invoice_number DESC
       LIMIT 1`,
      [firmId, `${prefix}%`]
    );

    let nextNumber = 1;

    if (result.rows.length > 0) {
      // Extract number from last invoice (e.g., "INV-2026-0123" -> 123)
      const lastInvoiceNumber = result.rows[0].invoice_number;
      const lastNumber = parseInt(lastInvoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    // Format with leading zeros (4 digits)
    const formattedNumber = nextNumber.toString().padStart(4, '0');

    return `${prefix}${formattedNumber}`;
  }

  /**
   * Validate invoice number format
   */
  validateInvoiceNumber(invoiceNumber: string): boolean {
    // Format: INV-YYYY-####
    const pattern = /^INV-\d{4}-\d{4}$/;
    return pattern.test(invoiceNumber);
  }

  /**
   * Check if invoice number exists for firm
   */
  async invoiceNumberExists(firmId: string, invoiceNumber: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT id FROM invoices WHERE firm_id = $1 AND invoice_number = $2`,
      [firmId, invoiceNumber]
    );

    return result.rows.length > 0;
  }

  /**
   * Get invoice number statistics
   */
  async getStats(firmId: string): Promise<any> {
    const currentYear = new Date().getFullYear();

    const result = await pool.query(
      `SELECT
        COUNT(*) as total_this_year,
        MIN(invoice_number) as first_invoice,
        MAX(invoice_number) as last_invoice
       FROM invoices
       WHERE firm_id = $1
         AND invoice_number LIKE $2`,
      [firmId, `INV-${currentYear}-%`]
    );

    return result.rows[0];
  }
}

export default new InvoiceNumberService();
