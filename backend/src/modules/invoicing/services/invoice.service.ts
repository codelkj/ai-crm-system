/**
 * Invoice Service
 * CRUD operations, status management, and totals calculation
 */

import pool from '../../../config/database';

export interface Invoice {
  id: string;
  firm_id: string;
  invoice_number: string;
  client_id?: string;
  matter_id?: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  issue_date: Date;
  due_date: Date;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  notes?: string;
  terms?: string;
  created_by?: string;
  sent_date?: Date;
  paid_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvoiceDTO {
  client_id?: string;
  matter_id?: string;
  issue_date: Date;
  due_date: Date;
  notes?: string;
  terms?: string;
  vat_rate?: number;
}

export interface UpdateInvoiceDTO {
  client_id?: string;
  matter_id?: string;
  issue_date?: Date;
  due_date?: Date;
  notes?: string;
  terms?: string;
  status?: string;
}

class InvoiceService {
  /**
   * Get all invoices for a firm
   */
  async getAll(firmId: string, filters?: {
    status?: string;
    client_id?: string;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ invoices: Invoice[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['i.firm_id = $1'];
    const params: any[] = [firmId];
    let paramCount = 2;

    if (filters?.status) {
      conditions.push(`i.status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.client_id) {
      conditions.push(`i.client_id = $${paramCount}`);
      params.push(filters.client_id);
      paramCount++;
    }

    if (filters?.start_date) {
      conditions.push(`i.issue_date >= $${paramCount}`);
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters?.end_date) {
      conditions.push(`i.issue_date <= $${paramCount}`);
      params.push(filters.end_date);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM invoices i WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const result = await pool.query(
      `SELECT
        i.*,
        c.name as client_name,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
        (SELECT COUNT(*) FROM invoice_line_items WHERE invoice_id = i.id) as line_items_count
       FROM invoices i
       LEFT JOIN companies c ON i.client_id = c.id
       LEFT JOIN users u ON i.created_by = u.id
       WHERE ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      invoices: result.rows,
      total
    };
  }

  /**
   * Get invoice by ID
   */
  async getById(invoiceId: string): Promise<Invoice | null> {
    const result = await pool.query(
      `SELECT
        i.*,
        c.name as client_name,
        c.billing_email,
        c.address as client_address,
        c.city as client_city,
        c.state as client_state,
        c.country as client_country,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
       FROM invoices i
       LEFT JOIN companies c ON i.client_id = c.id
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.id = $1`,
      [invoiceId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create new invoice
   */
  async create(firmId: string, userId: string, data: CreateInvoiceDTO, invoiceNumber: string): Promise<Invoice> {
    const result = await pool.query(
      `INSERT INTO invoices (
        firm_id, invoice_number, client_id, matter_id,
        issue_date, due_date, notes, terms, vat_rate, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        firmId,
        invoiceNumber,
        data.client_id,
        data.matter_id,
        data.issue_date,
        data.due_date,
        data.notes,
        data.terms,
        data.vat_rate || 0.15,
        userId
      ]
    );

    return result.rows[0];
  }

  /**
   * Update invoice
   */
  async update(invoiceId: string, data: UpdateInvoiceDTO): Promise<Invoice | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.getById(invoiceId);
    }

    values.push(invoiceId);

    const result = await pool.query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete invoice (soft delete - set status to cancelled)
   */
  async delete(invoiceId: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE invoices SET status = 'cancelled' WHERE id = $1`,
      [invoiceId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Calculate invoice totals (recalculates from line items)
   */
  async calculateTotals(invoiceId: string): Promise<void> {
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as subtotal
       FROM invoice_line_items
       WHERE invoice_id = $1`,
      [invoiceId]
    );

    const subtotal = parseFloat(result.rows[0].subtotal);

    await pool.query(
      `UPDATE invoices SET subtotal = $1 WHERE id = $2`,
      [subtotal, invoiceId]
    );
  }

  /**
   * Get line items for invoice
   */
  async getLineItems(invoiceId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT * FROM invoice_line_items
       WHERE invoice_id = $1
       ORDER BY line_order ASC`,
      [invoiceId]
    );

    return result.rows;
  }

  /**
   * Add line item to invoice
   */
  async addLineItem(invoiceId: string, data: {
    description: string;
    quantity: number;
    unit_price: number;
    billable_type?: string;
    reference_id?: string;
  }): Promise<any> {
    // Get next line order
    const orderResult = await pool.query(
      `SELECT COALESCE(MAX(line_order), 0) + 1 as next_order
       FROM invoice_line_items
       WHERE invoice_id = $1`,
      [invoiceId]
    );
    const lineOrder = orderResult.rows[0].next_order;

    const result = await pool.query(
      `INSERT INTO invoice_line_items (
        invoice_id, description, quantity, unit_price,
        line_order, billable_type, reference_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        invoiceId,
        data.description,
        data.quantity,
        data.unit_price,
        lineOrder,
        data.billable_type,
        data.reference_id
      ]
    );

    // Recalculate totals
    await this.calculateTotals(invoiceId);

    return result.rows[0];
  }

  /**
   * Update line item
   */
  async updateLineItem(lineItemId: string, data: {
    description?: string;
    quantity?: number;
    unit_price?: number;
  }): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return null;
    }

    values.push(lineItemId);

    const result = await pool.query(
      `UPDATE invoice_line_items SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    // Recalculate totals
    if (result.rows[0]) {
      await this.calculateTotals(result.rows[0].invoice_id);
    }

    return result.rows[0] || null;
  }

  /**
   * Delete line item
   */
  async deleteLineItem(lineItemId: string): Promise<boolean> {
    const itemResult = await pool.query(
      `SELECT invoice_id FROM invoice_line_items WHERE id = $1`,
      [lineItemId]
    );

    if (itemResult.rows.length === 0) {
      return false;
    }

    const invoiceId = itemResult.rows[0].invoice_id;

    const result = await pool.query(
      `DELETE FROM invoice_line_items WHERE id = $1`,
      [lineItemId]
    );

    // Recalculate totals
    await this.calculateTotals(invoiceId);

    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Send invoice (update status and sent_date)
   */
  async sendInvoice(invoiceId: string): Promise<void> {
    await pool.query(
      `UPDATE invoices
       SET status = 'sent', sent_date = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'draft'`,
      [invoiceId]
    );
  }

  /**
   * Mark invoice as viewed
   */
  async markAsViewed(invoiceId: string): Promise<void> {
    await pool.query(
      `UPDATE invoices
       SET status = 'viewed'
       WHERE id = $1 AND status = 'sent'`,
      [invoiceId]
    );
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(firmId: string, clientId?: string): Promise<Invoice[]> {
    const params: any[] = [firmId];
    let query = `
      SELECT i.*, c.name as client_name
      FROM invoices i
      LEFT JOIN companies c ON i.client_id = c.id
      WHERE i.firm_id = $1
        AND i.status IN ('sent', 'viewed')
        AND i.due_date < CURRENT_DATE
    `;

    if (clientId) {
      params.push(clientId);
      query += ` AND i.client_id = $2`;
    }

    query += ` ORDER BY i.due_date ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get invoice statistics for firm
   */
  async getStats(firmId: string): Promise<any> {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_invoices,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
        COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
        COUNT(*) FILTER (WHERE status IN ('sent', 'viewed') AND due_date < CURRENT_DATE) as overdue_count,
        COALESCE(SUM(total), 0) as total_value,
        COALESCE(SUM(amount_paid), 0) as total_paid,
        COALESCE(SUM(balance_due), 0) as total_outstanding
       FROM invoices
       WHERE firm_id = $1`,
      [firmId]
    );

    return result.rows[0];
  }
}

export default new InvoiceService();
