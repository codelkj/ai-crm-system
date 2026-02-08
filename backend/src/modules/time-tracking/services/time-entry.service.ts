/**
 * Time Entry Service
 * Handles CRUD operations and approval workflow for time entries
 */

import pool from '../../../config/database';
import AuditLogService from '../../legal-crm/services/audit-log.service';

export interface TimeEntry {
  id: string;
  firm_id: string;
  matter_id?: string;
  user_id?: string;
  entry_date: string;
  duration_minutes: number;
  hourly_rate: number;
  amount: number;
  description: string;
  billable: boolean;
  billed: boolean;
  invoice_line_item_id?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  matter_name?: string;
  user_name?: string;
  approved_by_name?: string;
}

export interface CreateTimeEntryDTO {
  matter_id?: string;
  entry_date: string;
  duration_minutes: number;
  hourly_rate: number;
  description: string;
  billable?: boolean;
}

export interface UpdateTimeEntryDTO {
  matter_id?: string;
  entry_date?: string;
  duration_minutes?: number;
  hourly_rate?: number;
  description?: string;
  billable?: boolean;
}

export interface TimeEntryFilters {
  matter_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  billable?: boolean;
  billed?: boolean;
  approved?: boolean; // NULL = pending, true = approved, false = all
  page?: number;
  limit?: number;
}

export class TimeEntryService {
  /**
   * Get all time entries with filters
   */
  async getAll(firmId: string, filters: TimeEntryFilters = {}) {
    const {
      matter_id,
      user_id,
      start_date,
      end_date,
      billable,
      billed,
      approved,
      page = 1,
      limit = 50
    } = filters;

    const offset = (page - 1) * limit;

    let whereConditions = ['te.firm_id = $1'];
    const params: any[] = [firmId];
    let paramIndex = 2;

    if (matter_id) {
      whereConditions.push(`te.matter_id = $${paramIndex++}`);
      params.push(matter_id);
    }

    if (user_id) {
      whereConditions.push(`te.user_id = $${paramIndex++}`);
      params.push(user_id);
    }

    if (start_date) {
      whereConditions.push(`te.entry_date >= $${paramIndex++}`);
      params.push(start_date);
    }

    if (end_date) {
      whereConditions.push(`te.entry_date <= $${paramIndex++}`);
      params.push(end_date);
    }

    if (billable !== undefined) {
      whereConditions.push(`te.billable = $${paramIndex++}`);
      params.push(billable);
    }

    if (billed !== undefined) {
      whereConditions.push(`te.billed = $${paramIndex++}`);
      params.push(billed);
    }

    if (approved === true) {
      whereConditions.push(`te.approved_by IS NOT NULL`);
    } else if (approved === false) {
      whereConditions.push(`te.approved_by IS NULL`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM time_entries te WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get paginated results with joined data
    const result = await pool.query(
      `SELECT
        te.*,
        d.title as matter_name,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
      FROM time_entries te
      LEFT JOIN deals d ON d.id = te.matter_id
      LEFT JOIN users u ON u.id = te.user_id
      LEFT JOIN users approver ON approver.id = te.approved_by
      WHERE ${whereClause}
      ORDER BY te.entry_date DESC, te.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows as TimeEntry[],
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  /**
   * Get time entry by ID
   */
  async getById(id: string, firmId: string): Promise<TimeEntry | null> {
    const result = await pool.query(
      `SELECT
        te.*,
        d.title as matter_name,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
      FROM time_entries te
      LEFT JOIN deals d ON d.id = te.matter_id
      LEFT JOIN users u ON u.id = te.user_id
      LEFT JOIN users approver ON approver.id = te.approved_by
      WHERE te.id = $1 AND te.firm_id = $2`,
      [id, firmId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create time entry
   */
  async create(
    firmId: string,
    userId: string,
    data: CreateTimeEntryDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<TimeEntry> {
    const {
      matter_id,
      entry_date,
      duration_minutes,
      hourly_rate,
      description,
      billable = true
    } = data;

    const result = await pool.query(
      `INSERT INTO time_entries (
        firm_id, matter_id, user_id, entry_date, duration_minutes,
        hourly_rate, description, billable
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [firmId, matter_id, userId, entry_date, duration_minutes, hourly_rate, description, billable]
    );

    const timeEntry = result.rows[0];

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'CREATE',
      entity_type: 'time_entry',
      entity_id: timeEntry.id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return timeEntry;
  }

  /**
   * Update time entry (only if not approved)
   */
  async update(
    id: string,
    firmId: string,
    userId: string,
    data: UpdateTimeEntryDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<TimeEntry> {
    // Check if entry exists and is not approved
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Time entry not found');
    }

    if (existing.approved_by) {
      throw new Error('Cannot update approved time entry');
    }

    if (existing.billed) {
      throw new Error('Cannot update billed time entry');
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.matter_id !== undefined) {
      updates.push(`matter_id = $${paramIndex++}`);
      params.push(data.matter_id);
    }

    if (data.entry_date !== undefined) {
      updates.push(`entry_date = $${paramIndex++}`);
      params.push(data.entry_date);
    }

    if (data.duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramIndex++}`);
      params.push(data.duration_minutes);
    }

    if (data.hourly_rate !== undefined) {
      updates.push(`hourly_rate = $${paramIndex++}`);
      params.push(data.hourly_rate);
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }

    if (data.billable !== undefined) {
      updates.push(`billable = $${paramIndex++}`);
      params.push(data.billable);
    }

    if (updates.length === 0) {
      return existing;
    }

    const result = await pool.query(
      `UPDATE time_entries SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND firm_id = $${paramIndex + 1}
      RETURNING *`,
      [...params, id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'time_entry',
      entity_id: id,
      changes: { old: existing, new: result.rows[0] },
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return result.rows[0];
  }

  /**
   * Delete time entry (only if not approved or billed)
   */
  async delete(
    id: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Time entry not found');
    }

    if (existing.approved_by) {
      throw new Error('Cannot delete approved time entry');
    }

    if (existing.billed) {
      throw new Error('Cannot delete billed time entry');
    }

    await pool.query(
      `DELETE FROM time_entries WHERE id = $1 AND firm_id = $2`,
      [id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'DELETE',
      entity_type: 'time_entry',
      entity_id: id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });
  }

  /**
   * Approve time entry
   */
  async approve(
    id: string,
    firmId: string,
    approverId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<TimeEntry> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Time entry not found');
    }

    if (existing.approved_by) {
      throw new Error('Time entry already approved');
    }

    const result = await pool.query(
      `UPDATE time_entries
      SET approved_by = $1, approved_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND firm_id = $3
      RETURNING *`,
      [approverId, id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: approverId,
      action: 'APPROVE',
      entity_type: 'time_entry',
      entity_id: id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return result.rows[0];
  }

  /**
   * Unapprove time entry (if not billed)
   */
  async unapprove(
    id: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<TimeEntry> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Time entry not found');
    }

    if (existing.billed) {
      throw new Error('Cannot unapprove billed time entry');
    }

    const result = await pool.query(
      `UPDATE time_entries
      SET approved_by = NULL, approved_at = NULL
      WHERE id = $1 AND firm_id = $2
      RETURNING *`,
      [id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'UNAPPROVE',
      entity_type: 'time_entry',
      entity_id: id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return result.rows[0];
  }

  /**
   * Get unbilled hours summary by matter
   */
  async getUnbilledByMatter(firmId: string, matterId?: string) {
    let whereClause = 'firm_id = $1';
    const params: any[] = [firmId];

    if (matterId) {
      whereClause += ' AND matter_id = $2';
      params.push(matterId);
    }

    const result = await pool.query(
      `SELECT * FROM unbilled_hours_by_matter WHERE ${whereClause} ORDER BY latest_date DESC`,
      params
    );

    return result.rows;
  }

  /**
   * Get unbilled hours summary by user
   */
  async getUnbilledByUser(firmId: string, userId?: string) {
    let whereClause = 'firm_id = $1';
    const params: any[] = [firmId];

    if (userId) {
      whereClause += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(
      `SELECT * FROM unbilled_hours_by_user WHERE ${whereClause} ORDER BY latest_date DESC`,
      params
    );

    return result.rows;
  }

  /**
   * Get time entries pending approval
   */
  async getPendingApproval(firmId: string) {
    const result = await pool.query(
      `SELECT * FROM time_entries_pending_approval WHERE firm_id = $1`,
      [firmId]
    );

    return result.rows;
  }

  /**
   * Bulk approve time entries
   */
  async bulkApprove(
    ids: string[],
    firmId: string,
    approverId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<number> {
    const result = await pool.query(
      `UPDATE time_entries
      SET approved_by = $1, approved_at = CURRENT_TIMESTAMP
      WHERE id = ANY($2) AND firm_id = $3 AND approved_by IS NULL AND billed = false
      RETURNING id`,
      [approverId, ids, firmId]
    );

    const approvedCount = result.rowCount || 0;

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: approverId,
      action: 'BULK_APPROVE',
      entity_type: 'time_entry',
      changes: { ids, count: approvedCount },
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return approvedCount;
  }

  /**
   * Get time entry statistics
   */
  async getStats(firmId: string, startDate?: string, endDate?: string) {
    let dateFilter = '';
    const params: any[] = [firmId];
    let paramIndex = 2;

    if (startDate) {
      dateFilter += ` AND entry_date >= $${paramIndex++}`;
      params.push(startDate);
    }

    if (endDate) {
      dateFilter += ` AND entry_date <= $${paramIndex++}`;
      params.push(endDate);
    }

    const result = await pool.query(
      `SELECT
        COUNT(*) as total_entries,
        COUNT(*) FILTER (WHERE approved_by IS NOT NULL) as approved_entries,
        COUNT(*) FILTER (WHERE billed = true) as billed_entries,
        COUNT(*) FILTER (WHERE billable = true AND billed = false AND approved_by IS NOT NULL) as unbilled_entries,
        SUM(duration_minutes) / 60.0 as total_hours,
        SUM(duration_minutes) FILTER (WHERE approved_by IS NOT NULL) / 60.0 as approved_hours,
        SUM(duration_minutes) FILTER (WHERE billed = true) / 60.0 as billed_hours,
        SUM(duration_minutes) FILTER (WHERE billable = true AND billed = false AND approved_by IS NOT NULL) / 60.0 as unbilled_hours,
        SUM(amount) as total_amount,
        SUM(amount) FILTER (WHERE approved_by IS NOT NULL) as approved_amount,
        SUM(amount) FILTER (WHERE billed = true) as billed_amount,
        SUM(amount) FILTER (WHERE billable = true AND billed = false AND approved_by IS NOT NULL) as unbilled_amount
      FROM time_entries
      WHERE firm_id = $1 ${dateFilter}`,
      params
    );

    return result.rows[0];
  }
}

export const timeEntryService = new TimeEntryService();
