/**
 * Matter Service
 * Handles legal matter operations (extends deal logic for legal pipeline)
 */

import pool from '../../../config/database';
import AuditLogService from '../../legal-crm/services/audit-log.service';

export interface Matter {
  id: string;
  firm_id: string;
  company_id: string;
  title: string;
  pipeline_type: 'legal';
  lightning_stage_id?: string;
  matter_number: string;
  matter_type?: string;
  department_id?: string;
  lead_director_id?: string;
  budget_hours?: number;
  budget_amount?: number;
  actual_hours: number;
  actual_amount: number;
  burn_rate: number;
  health_status: 'healthy' | 'warning' | 'critical';
  matter_status: 'active' | 'on_hold' | 'closed' | 'archived';
  value?: number;
  opened_date?: string;
  closed_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  client_name?: string;
  department_name?: string;
  lead_director_name?: string;
  stage_name?: string;
  stage_color?: string;
  team_size?: number;
}

export interface CreateMatterDTO {
  company_id: string;
  title: string;
  matter_type?: string;
  department_id?: string;
  lead_director_id?: string;
  budget_hours?: number;
  budget_amount?: number;
  value?: number;
  description?: string;
  opened_date?: string;
}

export interface UpdateMatterDTO {
  title?: string;
  matter_type?: string;
  lightning_stage_id?: string;
  department_id?: string;
  lead_director_id?: string;
  budget_hours?: number;
  budget_amount?: number;
  value?: number;
  description?: string;
  matter_status?: string;
  opened_date?: string;
  closed_date?: string;
}

export interface MatterFilters {
  client_id?: string;
  department_id?: string;
  lead_director_id?: string;
  lightning_stage_id?: string;
  matter_status?: string;
  health_status?: string;
  matter_type?: string;
  page?: number;
  limit?: number;
}

export class MatterService {
  /**
   * Generate next matter number
   */
  private async generateMatterNumber(firmId: string): Promise<string> {
    const result = await pool.query(`SELECT nextval('matter_number_seq') as next_num`);
    const nextNum = result.rows[0].next_num;
    const year = new Date().getFullYear();
    return `M-${year}-${String(nextNum).padStart(4, '0')}`;
  }

  /**
   * Get all matters with filters
   */
  async getAll(firmId: string, filters: MatterFilters = {}) {
    const {
      client_id,
      department_id,
      lead_director_id,
      lightning_stage_id,
      matter_status,
      health_status,
      matter_type,
      page = 1,
      limit = 50
    } = filters;

    const offset = (page - 1) * limit;

    let whereConditions = ['firm_id = $1', "pipeline_type = 'legal'"];
    const params: any[] = [firmId];
    let paramIndex = 2;

    if (client_id) {
      whereConditions.push(`company_id = $${paramIndex++}`);
      params.push(client_id);
    }

    if (department_id) {
      whereConditions.push(`department_id = $${paramIndex++}`);
      params.push(department_id);
    }

    if (lead_director_id) {
      whereConditions.push(`lead_director_id = $${paramIndex++}`);
      params.push(lead_director_id);
    }

    if (lightning_stage_id) {
      whereConditions.push(`lightning_stage_id = $${paramIndex++}`);
      params.push(lightning_stage_id);
    }

    if (matter_status) {
      whereConditions.push(`matter_status = $${paramIndex++}`);
      params.push(matter_status);
    }

    if (health_status) {
      whereConditions.push(`health_status = $${paramIndex++}`);
      params.push(health_status);
    }

    if (matter_type) {
      whereConditions.push(`matter_type = $${paramIndex++}`);
      params.push(matter_type);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM deals WHERE ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);

    // Get paginated results from matter_summary view
    const result = await pool.query(
      `SELECT * FROM matter_summary
      WHERE firm_id = $1 ${client_id ? 'AND client_id = $2' : ''}
      ${department_id ? `AND department_id = $${params.indexOf(department_id) + 1}` : ''}
      ${lead_director_id ? `AND lead_director_id = $${params.indexOf(lead_director_id) + 1}` : ''}
      ${lightning_stage_id ? `AND lightning_stage_id = $${params.indexOf(lightning_stage_id) + 1}` : ''}
      ${matter_status ? `AND matter_status = $${params.indexOf(matter_status) + 1}` : ''}
      ${health_status ? `AND health_status = $${params.indexOf(health_status) + 1}` : ''}
      ${matter_type ? `AND matter_type = $${params.indexOf(matter_type) + 1}` : ''}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return {
      data: result.rows as Matter[],
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  /**
   * Get matter by ID
   */
  async getById(id: string, firmId: string): Promise<Matter | null> {
    const result = await pool.query(
      `SELECT * FROM matter_summary WHERE id = $1 AND firm_id = $2`,
      [id, firmId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create new matter
   */
  async create(
    firmId: string,
    userId: string,
    data: CreateMatterDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<Matter> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Generate matter number
      const matterNumber = await this.generateMatterNumber(firmId);

      // Get first Lightning Path stage
      const stageResult = await client.query(
        `SELECT id FROM lightning_stages WHERE firm_id = $1 ORDER BY stage_order LIMIT 1`,
        [firmId]
      );

      const firstStageId = stageResult.rows[0]?.id;

      // Create matter (as a deal with pipeline_type = 'legal')
      // Note: description field is intentionally omitted as deals table doesn't have this column
      const result = await client.query(
        `INSERT INTO deals (
          firm_id, company_id, title, pipeline_type, lightning_stage_id,
          matter_number, matter_type, department_id, lead_director_id,
          budget_hours, budget_amount, value, opened_date,
          matter_status
        ) VALUES ($1, $2, $3, 'legal', $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active')
        RETURNING *`,
        [
          firmId,
          data.company_id,
          data.title,
          firstStageId,
          matterNumber,
          data.matter_type,
          data.department_id,
          data.lead_director_id,
          data.budget_hours,
          data.budget_amount,
          data.value,
          data.opened_date || new Date().toISOString().split('T')[0]
        ]
      );

      const matter = result.rows[0];

      // Record stage transition
      if (firstStageId) {
        await client.query(
          `INSERT INTO stage_transitions (matter_id, from_stage_id, to_stage_id, transitioned_by)
          VALUES ($1, NULL, $2, $3)`,
          [matter.id, firstStageId, userId]
        );
      }

      // Auto-assign lead director to matter
      if (data.lead_director_id) {
        await client.query(
          `INSERT INTO matter_assignments (matter_id, user_id, role)
          VALUES ($1, $2, 'Lead Director')`,
          [matter.id, data.lead_director_id]
        );
      }

      await client.query('COMMIT');

      // Audit log
      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'CREATE',
        entity_type: 'matter',
        entity_id: matter.id,
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

      return await this.getById(matter.id, firmId) as Matter;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update matter
   */
  async update(
    id: string,
    firmId: string,
    userId: string,
    data: UpdateMatterDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<Matter> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Matter not found');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        params.push(data.title);
      }

      if (data.matter_type !== undefined) {
        updates.push(`matter_type = $${paramIndex++}`);
        params.push(data.matter_type);
      }

      if (data.department_id !== undefined) {
        updates.push(`department_id = $${paramIndex++}`);
        params.push(data.department_id);
      }

      if (data.lead_director_id !== undefined) {
        updates.push(`lead_director_id = $${paramIndex++}`);
        params.push(data.lead_director_id);
      }

      if (data.budget_hours !== undefined) {
        updates.push(`budget_hours = $${paramIndex++}`);
        params.push(data.budget_hours);
      }

      if (data.budget_amount !== undefined) {
        updates.push(`budget_amount = $${paramIndex++}`);
        params.push(data.budget_amount);
      }

      if (data.value !== undefined) {
        updates.push(`value = $${paramIndex++}`);
        params.push(data.value);
      }

      // Note: description field is intentionally omitted as deals table doesn't have this column
      // If needed in the future, add a notes column to the deals table in a migration

      if (data.matter_status !== undefined) {
        updates.push(`matter_status = $${paramIndex++}`);
        params.push(data.matter_status);

        // Set closed_date if closing matter
        if (data.matter_status === 'closed' && !existing.closed_date) {
          updates.push(`closed_date = CURRENT_DATE`);
        }
      }

      if (data.opened_date !== undefined) {
        updates.push(`opened_date = $${paramIndex++}`);
        params.push(data.opened_date);
      }

      if (data.closed_date !== undefined) {
        updates.push(`closed_date = $${paramIndex++}`);
        params.push(data.closed_date);
      }

      // Handle stage transition separately
      if (data.lightning_stage_id !== undefined && data.lightning_stage_id !== existing.lightning_stage_id) {
        updates.push(`lightning_stage_id = $${paramIndex++}`);
        params.push(data.lightning_stage_id);

        // Record stage transition
        await client.query(
          `INSERT INTO stage_transitions (matter_id, from_stage_id, to_stage_id, transitioned_by, notes)
          VALUES ($1, $2, $3, $4, $5)`,
          [id, existing.lightning_stage_id, data.lightning_stage_id, userId, 'Stage updated']
        );
      }

      if (updates.length === 0) {
        await client.query('COMMIT');
        return existing;
      }

      const result = await client.query(
        `UPDATE deals SET ${updates.join(', ')}
        WHERE id = $${paramIndex} AND firm_id = $${paramIndex + 1}
        RETURNING *`,
        [...params, id, firmId]
      );

      await client.query('COMMIT');

      // Audit log
      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'UPDATE',
        entity_type: 'matter',
        entity_id: id,
        changes: { old: existing, new: result.rows[0] },
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

      return await this.getById(id, firmId) as Matter;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete matter (only if no time entries or invoices)
   */
  async delete(
    id: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Matter not found');
    }

    // Check for time entries
    const timeEntriesCheck = await pool.query(
      `SELECT COUNT(*) as count FROM time_entries WHERE matter_id = $1`,
      [id]
    );

    if (parseInt(timeEntriesCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete matter with time entries');
    }

    await pool.query(
      `DELETE FROM deals WHERE id = $1 AND firm_id = $2 AND pipeline_type = 'legal'`,
      [id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'DELETE',
      entity_type: 'matter',
      entity_id: id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });
  }

  /**
   * Move matter to different stage (Lightning Path)
   */
  async moveStage(
    id: string,
    firmId: string,
    userId: string,
    newStageId: string,
    notes?: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<Matter> {
    const matter = await this.getById(id, firmId);
    if (!matter) {
      throw new Error('Matter not found');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update stage
      await client.query(
        `UPDATE deals SET lightning_stage_id = $1 WHERE id = $2 AND firm_id = $3`,
        [newStageId, id, firmId]
      );

      // Record transition
      await client.query(
        `INSERT INTO stage_transitions (matter_id, from_stage_id, to_stage_id, transitioned_by, notes)
        VALUES ($1, $2, $3, $4, $5)`,
        [id, matter.lightning_stage_id, newStageId, userId, notes]
      );

      // Check if moved to closed stage
      const stageCheck = await client.query(
        `SELECT is_closed, closed_status FROM lightning_stages WHERE id = $1`,
        [newStageId]
      );

      if (stageCheck.rows[0]?.is_closed) {
        await client.query(
          `UPDATE deals SET matter_status = 'closed', closed_date = CURRENT_DATE WHERE id = $1`,
          [id]
        );
      }

      await client.query('COMMIT');

      // Audit log
      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'UPDATE',
        entity_type: 'matter',
        entity_id: id,
        changes: { stage_change: { from: matter.stage_name, to: newStageId, notes } },
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

      return await this.getById(id, firmId) as Matter;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get matter statistics
   */
  async getStats(firmId: string, departmentId?: string) {
    let whereClause = 'firm_id = $1';
    const params: any[] = [firmId];

    if (departmentId) {
      whereClause += ' AND department_id = $2';
      params.push(departmentId);
    }

    const result = await pool.query(
      `SELECT
        COUNT(*) as total_matters,
        COUNT(*) FILTER (WHERE matter_status = 'active') as active_matters,
        COUNT(*) FILTER (WHERE matter_status = 'on_hold') as on_hold_matters,
        COUNT(*) FILTER (WHERE matter_status = 'closed') as closed_matters,
        COUNT(*) FILTER (WHERE health_status = 'critical') as critical_matters,
        COUNT(*) FILTER (WHERE health_status = 'warning') as warning_matters,
        SUM(budget_amount) as total_budget,
        SUM(actual_amount) as total_actual,
        AVG(burn_rate) as avg_burn_rate
      FROM deals
      WHERE ${whereClause} AND pipeline_type = 'legal'`,
      params
    );

    return result.rows[0];
  }

  /**
   * Get matters by department
   */
  async getByDepartment(firmId: string) {
    const result = await pool.query(
      `SELECT * FROM matters_by_department WHERE firm_id = $1 ORDER BY total_matters DESC`,
      [firmId]
    );

    return result.rows;
  }

  /**
   * Get team workload
   */
  async getTeamWorkload(firmId: string, userId?: string) {
    let whereClause = 'firm_id = $1';
    const params: any[] = [firmId];

    if (userId) {
      whereClause += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await pool.query(
      `SELECT * FROM team_workload WHERE ${whereClause} ORDER BY assigned_matters DESC`,
      params
    );

    return result.rows;
  }
}

export const matterService = new MatterService();
