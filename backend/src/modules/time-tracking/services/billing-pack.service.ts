/**
 * Billing Pack Service
 * Handles generation and management of monthly billing packs
 */

import pool from '../../../config/database';
import AuditLogService from '../../legal-crm/services/audit-log.service';

export interface BillingPack {
  id: string;
  firm_id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'generated' | 'sent' | 'approved';
  total_time_entries: number;
  total_hours: number;
  total_amount: number;
  generated_by?: string;
  generated_at?: string;
  sent_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  client_name?: string;
  generated_by_name?: string;
}

export interface CreateBillingPackDTO {
  client_id: string;
  period_start: string;
  period_end: string;
  notes?: string;
}

export interface BillingPackFilters {
  client_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export class BillingPackService {
  /**
   * Get all billing packs with filters
   */
  async getAll(firmId: string, filters: BillingPackFilters = {}) {
    const {
      client_id,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 20
    } = filters;

    const offset = (page - 1) * limit;

    let whereConditions = ['firm_id = $1'];
    const params: any[] = [firmId];
    let paramIndex = 2;

    if (client_id) {
      whereConditions.push(`client_id = $${paramIndex++}`);
      params.push(client_id);
    }

    if (status) {
      whereConditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (start_date) {
      whereConditions.push(`period_start >= $${paramIndex++}`);
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push(`period_end <= $${paramIndex++}`);
      params.push(end_date);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM billing_packs WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const result = await pool.query(
      `SELECT * FROM billing_pack_summary
      WHERE ${whereClause}
      ORDER BY period_end DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows as BillingPack[],
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  /**
   * Get billing pack by ID
   */
  async getById(id: string, firmId: string): Promise<BillingPack | null> {
    const result = await pool.query(
      `SELECT * FROM billing_pack_summary WHERE id = $1 AND firm_id = $2`,
      [id, firmId]
    );

    return result.rows[0] || null;
  }

  /**
   * Get time entries for a billing pack
   */
  async getTimeEntries(packId: string, firmId: string) {
    const result = await pool.query(
      `SELECT
        te.*,
        d.title as matter_name,
        CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM billing_pack_entries bpe
      JOIN time_entries te ON te.id = bpe.time_entry_id
      LEFT JOIN deals d ON d.id = te.matter_id
      LEFT JOIN users u ON u.id = te.user_id
      WHERE bpe.billing_pack_id = $1 AND te.firm_id = $2
      ORDER BY te.entry_date DESC, te.created_at DESC`,
      [packId, firmId]
    );

    return result.rows;
  }

  /**
   * Create billing pack
   */
  async create(
    firmId: string,
    userId: string,
    data: CreateBillingPackDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<BillingPack> {
    let { client_id, period_start, period_end, notes } = data;

    // If client_id is not provided, validate it's required
    if (!client_id) {
      throw new Error('client_id is required to create a billing pack');
    }

    const result = await pool.query(
      `INSERT INTO billing_packs (
        firm_id, client_id, period_start, period_end, status, notes
      ) VALUES ($1, $2, $3, $4, 'draft', $5)
      RETURNING *`,
      [firmId, client_id, period_start, period_end, notes]
    );

    const billingPack = result.rows[0];

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'CREATE',
      entity_type: 'billing_pack',
      entity_id: billingPack.id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return billingPack;
  }

  /**
   * Generate billing pack from approved unbilled time entries
   */
  async generate(
    firmId: string,
    userId: string,
    data: CreateBillingPackDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<BillingPack> {
    let { client_id, period_start, period_end, notes } = data;

    // Validate client_id is provided
    if (!client_id) {
      throw new Error('client_id is required to generate a billing pack');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create billing pack
      const packResult = await client.query(
        `INSERT INTO billing_packs (
          firm_id, client_id, period_start, period_end, status, notes, generated_by, generated_at
        ) VALUES ($1, $2, $3, $4, 'generated', $5, $6, CURRENT_TIMESTAMP)
        RETURNING *`,
        [firmId, client_id, period_start, period_end, notes, userId]
      );

      const billingPack = packResult.rows[0];

      // Find all approved unbilled time entries for this client in the period
      const timeEntriesResult = await client.query(
        `SELECT te.id
        FROM time_entries te
        JOIN deals d ON d.id = te.matter_id
        WHERE te.firm_id = $1
          AND d.company_id = $2
          AND te.entry_date >= $3
          AND te.entry_date <= $4
          AND te.billable = true
          AND te.billed = false
          AND te.approved_by IS NOT NULL`,
        [firmId, client_id, period_start, period_end]
      );

      // Add time entries to billing pack
      for (const row of timeEntriesResult.rows) {
        await client.query(
          `INSERT INTO billing_pack_entries (billing_pack_id, time_entry_id)
          VALUES ($1, $2)`,
          [billingPack.id, row.id]
        );
      }

      // Totals are auto-calculated by trigger

      await client.query('COMMIT');

      // Audit log
      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'GENERATE',
        entity_type: 'billing_pack',
        entity_id: billingPack.id,
        changes: { time_entries_count: timeEntriesResult.rowCount },
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

      // Fetch complete billing pack with updated totals
      return await this.getById(billingPack.id, firmId) as BillingPack;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update billing pack
   */
  async update(
    id: string,
    firmId: string,
    userId: string,
    data: { notes?: string; status?: string },
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<BillingPack> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Billing pack not found');
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      params.push(data.notes);
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(data.status);

      // Set sent_at when status changes to 'sent'
      if (data.status === 'sent') {
        updates.push(`sent_at = CURRENT_TIMESTAMP`);
      }
    }

    if (updates.length === 0) {
      return existing;
    }

    const result = await pool.query(
      `UPDATE billing_packs SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND firm_id = $${paramIndex + 1}
      RETURNING *`,
      [...params, id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'billing_pack',
      entity_id: id,
      changes: { old: existing, new: result.rows[0] },
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return result.rows[0];
  }

  /**
   * Delete billing pack (only if not sent or approved)
   */
  async delete(
    id: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Billing pack not found');
    }

    if (existing.status === 'sent' || existing.status === 'approved') {
      throw new Error('Cannot delete sent or approved billing pack');
    }

    await pool.query(
      `DELETE FROM billing_packs WHERE id = $1 AND firm_id = $2`,
      [id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'DELETE',
      entity_type: 'billing_pack',
      entity_id: id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });
  }

  /**
   * Send billing pack to client
   */
  async send(
    id: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<BillingPack> {
    const result = await this.update(id, firmId, userId, { status: 'sent' }, requestMetadata);

    return result;
  }

  /**
   * Approve billing pack and create invoice
   */
  async approve(
    id: string,
    firmId: string,
    userId: string,
    createInvoice: boolean = false,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<BillingPack> {
    const pack = await this.getById(id, firmId);
    if (!pack) {
      throw new Error('Billing pack not found');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update status to approved
      await client.query(
        `UPDATE billing_packs SET status = 'approved' WHERE id = $1 AND firm_id = $2`,
        [id, firmId]
      );

      if (createInvoice) {
        // TODO: Integrate with invoice service to create invoice from billing pack
        // This will be implemented after invoice service is available
      }

      // Mark all time entries as billed
      await client.query(
        `UPDATE time_entries
        SET billed = true
        WHERE id IN (
          SELECT time_entry_id FROM billing_pack_entries WHERE billing_pack_id = $1
        )`,
        [id]
      );

      await client.query('COMMIT');

      // Audit log
      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'APPROVE',
        entity_type: 'billing_pack',
        entity_id: id,
        changes: { create_invoice: createInvoice },
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

      return await this.getById(id, firmId) as BillingPack;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get billing pack statistics
   */
  async getStats(firmId: string) {
    const result = await pool.query(
      `SELECT
        COUNT(*) as total_packs,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_packs,
        COUNT(*) FILTER (WHERE status = 'generated') as generated_packs,
        COUNT(*) FILTER (WHERE status = 'sent') as sent_packs,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_packs,
        SUM(total_amount) as total_amount,
        SUM(total_amount) FILTER (WHERE status = 'approved') as approved_amount,
        SUM(total_hours) as total_hours,
        SUM(total_hours) FILTER (WHERE status = 'approved') as approved_hours
      FROM billing_packs
      WHERE firm_id = $1`,
      [firmId]
    );

    return result.rows[0];
  }

  /**
   * Auto-generate billing packs for clients with billing dates today
   */
  async autoGenerate(firmId: string, systemUserId: string): Promise<number> {
    const today = new Date();
    const billingDate = today.getDate();

    // Find clients with preferred billing date matching today
    const clientsResult = await pool.query(
      `SELECT id, name FROM companies
      WHERE firm_id = $1 AND preferred_billing_date = $2 AND is_active = true`,
      [firmId, billingDate]
    );

    let generatedCount = 0;

    for (const client of clientsResult.rows) {
      try {
        // Calculate period (previous month)
        const periodEnd = new Date(today);
        periodEnd.setDate(0); // Last day of previous month

        const periodStart = new Date(periodEnd);
        periodStart.setDate(1); // First day of previous month

        // Check if billing pack already exists for this period
        const existingResult = await pool.query(
          `SELECT id FROM billing_packs
          WHERE firm_id = $1 AND client_id = $2 AND period_start = $3 AND period_end = $4`,
          [firmId, client.id, periodStart.toISOString().split('T')[0], periodEnd.toISOString().split('T')[0]]
        );

        if (existingResult.rows.length > 0) {
          console.log(`Billing pack already exists for client ${client.name}`);
          continue;
        }

        // Generate billing pack
        await this.generate(firmId, systemUserId, {
          client_id: client.id,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          notes: `Auto-generated on ${today.toISOString().split('T')[0]}`
        });

        generatedCount++;
        console.log(`Generated billing pack for client: ${client.name}`);

      } catch (error) {
        console.error(`Failed to generate billing pack for client ${client.name}:`, error);
      }
    }

    return generatedCount;
  }
}

export const billingPackService = new BillingPackService();
