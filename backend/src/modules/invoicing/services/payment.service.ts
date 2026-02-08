/**
 * Payment Service
 * Manages invoice payments and updates invoice status
 */

import pool from '../../../config/database';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: Date;
  payment_method?: string;
  reference?: string;
  notes?: string;
  recorded_by?: string;
  created_at: Date;
}

export interface CreatePaymentDTO {
  invoice_id: string;
  amount: number;
  payment_date: Date;
  payment_method?: string;
  reference?: string;
  notes?: string;
}

class PaymentService {
  /**
   * Get all payments for an invoice
   */
  async getByInvoice(invoiceId: string): Promise<Payment[]> {
    const result = await pool.query(
      `SELECT
        p.*,
        u.name as recorded_by_name
       FROM invoice_payments p
       LEFT JOIN users u ON p.recorded_by = u.id
       WHERE p.invoice_id = $1
       ORDER BY p.payment_date DESC, p.created_at DESC`,
      [invoiceId]
    );

    return result.rows;
  }

  /**
   * Get payment by ID
   */
  async getById(paymentId: string): Promise<Payment | null> {
    const result = await pool.query(
      `SELECT
        p.*,
        u.name as recorded_by_name
       FROM invoice_payments p
       LEFT JOIN users u ON p.recorded_by = u.id
       WHERE p.id = $1`,
      [paymentId]
    );

    return result.rows[0] || null;
  }

  /**
   * Record a payment
   */
  async create(userId: string, data: CreatePaymentDTO): Promise<Payment> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert payment
      const paymentResult = await client.query(
        `INSERT INTO invoice_payments (
          invoice_id, amount, payment_date, payment_method,
          reference, notes, recorded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          data.invoice_id,
          data.amount,
          data.payment_date,
          data.payment_method,
          data.reference,
          data.notes,
          userId
        ]
      );

      const payment = paymentResult.rows[0];

      // Update invoice amount_paid
      await client.query(
        `UPDATE invoices
         SET amount_paid = amount_paid + $1
         WHERE id = $2`,
        [data.amount, data.invoice_id]
      );

      // Check if invoice is now fully paid
      const invoiceResult = await client.query(
        `SELECT total, amount_paid, balance_due
         FROM invoices
         WHERE id = $1`,
        [data.invoice_id]
      );

      const invoice = invoiceResult.rows[0];

      // Update status if fully paid
      if (invoice && invoice.balance_due <= 0.01) { // Allow for rounding errors
        await client.query(
          `UPDATE invoices
           SET status = 'paid', paid_date = $1
           WHERE id = $2`,
          [data.payment_date, data.invoice_id]
        );
      }

      await client.query('COMMIT');

      return payment;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update payment
   */
  async update(paymentId: string, data: Partial<CreatePaymentDTO>): Promise<Payment | null> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get old payment amount
      const oldPaymentResult = await client.query(
        `SELECT amount, invoice_id FROM invoice_payments WHERE id = $1`,
        [paymentId]
      );

      if (oldPaymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const oldPayment = oldPaymentResult.rows[0];
      const oldAmount = parseFloat(oldPayment.amount);

      // Build update query
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'invoice_id') { // Don't allow changing invoice_id
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        await client.query('ROLLBACK');
        return this.getById(paymentId);
      }

      values.push(paymentId);

      // Update payment
      const result = await client.query(
        `UPDATE invoice_payments SET ${fields.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      );

      const updatedPayment = result.rows[0];

      // If amount changed, update invoice
      if (data.amount !== undefined) {
        const newAmount = parseFloat(data.amount.toString());
        const amountDifference = newAmount - oldAmount;

        await client.query(
          `UPDATE invoices
           SET amount_paid = amount_paid + $1
           WHERE id = $2`,
          [amountDifference, oldPayment.invoice_id]
        );

        // Recheck if invoice is paid
        const invoiceResult = await client.query(
          `SELECT total, amount_paid, balance_due, status
           FROM invoices
           WHERE id = $1`,
          [oldPayment.invoice_id]
        );

        const invoice = invoiceResult.rows[0];

        if (invoice) {
          if (invoice.balance_due <= 0.01 && invoice.status !== 'paid') {
            await client.query(
              `UPDATE invoices SET status = 'paid', paid_date = CURRENT_TIMESTAMP WHERE id = $1`,
              [oldPayment.invoice_id]
            );
          } else if (invoice.balance_due > 0.01 && invoice.status === 'paid') {
            // Unpaid if balance due exists
            await client.query(
              `UPDATE invoices SET status = 'sent', paid_date = NULL WHERE id = $1`,
              [oldPayment.invoice_id]
            );
          }
        }
      }

      await client.query('COMMIT');

      return updatedPayment;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete payment (refund)
   */
  async delete(paymentId: string): Promise<boolean> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get payment details
      const paymentResult = await client.query(
        `SELECT amount, invoice_id FROM invoice_payments WHERE id = $1`,
        [paymentId]
      );

      if (paymentResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const payment = paymentResult.rows[0];

      // Delete payment
      await client.query(
        `DELETE FROM invoice_payments WHERE id = $1`,
        [paymentId]
      );

      // Update invoice amount_paid
      await client.query(
        `UPDATE invoices
         SET amount_paid = amount_paid - $1
         WHERE id = $2`,
        [payment.amount, payment.invoice_id]
      );

      // Update invoice status if needed
      await client.query(
        `UPDATE invoices
         SET status = 'sent', paid_date = NULL
         WHERE id = $1 AND status = 'paid'`,
        [payment.invoice_id]
      );

      await client.query('COMMIT');

      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get payment statistics
   */
  async getStats(firmId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const params: any[] = [firmId];
    let dateFilter = '';

    if (startDate) {
      params.push(startDate);
      dateFilter += ` AND p.payment_date >= $${params.length}`;
    }

    if (endDate) {
      params.push(endDate);
      dateFilter += ` AND p.payment_date <= $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
        COUNT(*) as total_payments,
        COALESCE(SUM(p.amount), 0) as total_amount,
        COUNT(DISTINCT p.invoice_id) as invoices_with_payments,
        COUNT(DISTINCT DATE(p.payment_date)) as payment_days
       FROM invoice_payments p
       JOIN invoices i ON p.invoice_id = i.id
       WHERE i.firm_id = $1 ${dateFilter}`,
      params
    );

    return result.rows[0];
  }

  /**
   * Get recent payments
   */
  async getRecent(firmId: string, limit: number = 10): Promise<Payment[]> {
    const result = await pool.query(
      `SELECT
        p.*,
        i.invoice_number,
        c.name as client_name,
        u.name as recorded_by_name
       FROM invoice_payments p
       JOIN invoices i ON p.invoice_id = i.id
       LEFT JOIN companies c ON i.client_id = c.id
       LEFT JOIN users u ON p.recorded_by = u.id
       WHERE i.firm_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2`,
      [firmId, limit]
    );

    return result.rows;
  }
}

export default new PaymentService();
