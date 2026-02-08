/**
 * Matter Assignment Service
 * Manages team member assignments to legal matters
 */

import pool from '../../../config/database';
import AuditLogService from '../../legal-crm/services/audit-log.service';

export interface MatterAssignment {
  id: string;
  matter_id: string;
  user_id: string;
  role: string;
  assigned_date: string;
  removed_date?: string;
  is_active: boolean;
  created_at: string;
  // Joined fields
  user_name?: string;
  user_email?: string;
  job_title?: string;
  matter_name?: string;
}

export interface CreateAssignmentDTO {
  matter_id: string;
  user_id: string;
  role: string;
  assigned_date?: string;
}

export class MatterAssignmentService {
  /**
   * Get all assignments for a matter
   */
  async getByMatter(matterId: string, firmId: string, activeOnly: boolean = true): Promise<MatterAssignment[]> {
    let query = `
      SELECT
        ma.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        u.job_title,
        d.title as matter_name
      FROM matter_assignments ma
      JOIN users u ON u.id = ma.user_id
      JOIN deals d ON d.id = ma.matter_id
      WHERE ma.matter_id = $1 AND d.firm_id = $2
    `;

    if (activeOnly) {
      query += ' AND ma.is_active = true';
    }

    query += ' ORDER BY ma.assigned_date DESC';

    const result = await pool.query(query, [matterId, firmId]);
    return result.rows;
  }

  /**
   * Get all assignments for a user
   */
  async getByUser(userId: string, firmId: string, activeOnly: boolean = true): Promise<MatterAssignment[]> {
    let query = `
      SELECT
        ma.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        u.job_title,
        d.title as matter_name,
        d.matter_number,
        d.matter_status,
        d.health_status
      FROM matter_assignments ma
      JOIN users u ON u.id = ma.user_id
      JOIN deals d ON d.id = ma.matter_id
      WHERE ma.user_id = $1 AND d.firm_id = $2
    `;

    if (activeOnly) {
      query += ' AND ma.is_active = true AND d.matter_status = \'active\'';
    }

    query += ' ORDER BY ma.assigned_date DESC';

    const result = await pool.query(query, [userId, firmId]);
    return result.rows;
  }

  /**
   * Get assignment by ID
   */
  async getById(id: string, firmId: string): Promise<MatterAssignment | null> {
    const result = await pool.query(
      `SELECT
        ma.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.email as user_email,
        u.job_title,
        d.title as matter_name
      FROM matter_assignments ma
      JOIN users u ON u.id = ma.user_id
      JOIN deals d ON d.id = ma.matter_id
      WHERE ma.id = $1 AND d.firm_id = $2`,
      [id, firmId]
    );

    return result.rows[0] || null;
  }

  /**
   * Assign user to matter
   */
  async create(
    firmId: string,
    userId: string,
    data: CreateAssignmentDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<MatterAssignment> {
    // Verify matter belongs to firm
    const matterCheck = await pool.query(
      `SELECT id FROM deals WHERE id = $1 AND firm_id = $2 AND pipeline_type = 'legal'`,
      [data.matter_id, firmId]
    );

    if (matterCheck.rows.length === 0) {
      throw new Error('Matter not found');
    }

    // Check if assignment already exists (including inactive ones)
    const existingCheck = await pool.query(
      `SELECT id, is_active FROM matter_assignments
      WHERE matter_id = $1 AND user_id = $2 AND role = $3`,
      [data.matter_id, data.user_id, data.role]
    );

    if (existingCheck.rows.length > 0) {
      const existing = existingCheck.rows[0];
      if (existing.is_active) {
        throw new Error('User already assigned to this matter with this role');
      }

      // Reactivate existing assignment
      const result = await pool.query(
        `UPDATE matter_assignments
        SET is_active = true, removed_date = NULL, assigned_date = $1
        WHERE id = $2
        RETURNING *`,
        [data.assigned_date || new Date().toISOString().split('T')[0], existing.id]
      );

      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'UPDATE',
        entity_type: 'matter_assignment',
        entity_id: result.rows[0].id,
        changes: { reactivated: true },
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

      return await this.getById(result.rows[0].id, firmId) as MatterAssignment;
    }

    // Create new assignment
    const result = await pool.query(
      `INSERT INTO matter_assignments (matter_id, user_id, role, assigned_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [
        data.matter_id,
        data.user_id,
        data.role,
        data.assigned_date || new Date().toISOString().split('T')[0]
      ]
    );

    const assignment = result.rows[0];

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'CREATE',
      entity_type: 'matter_assignment',
      entity_id: assignment.id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return await this.getById(assignment.id, firmId) as MatterAssignment;
  }

  /**
   * Remove user from matter
   */
  async remove(
    id: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Assignment not found');
    }

    await pool.query(
      `UPDATE matter_assignments
      SET is_active = false, removed_date = CURRENT_DATE
      WHERE id = $1`,
      [id]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'DELETE',
      entity_type: 'matter_assignment',
      entity_id: id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });
  }

  /**
   * Bulk assign team to matter
   */
  async bulkAssign(
    firmId: string,
    userId: string,
    matterId: string,
    assignments: Array<{ user_id: string; role: string }>,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<MatterAssignment[]> {
    // Verify matter exists
    const matterCheck = await pool.query(
      `SELECT id FROM deals WHERE id = $1 AND firm_id = $2 AND pipeline_type = 'legal'`,
      [matterId, firmId]
    );

    if (matterCheck.rows.length === 0) {
      throw new Error('Matter not found');
    }

    const createdAssignments: MatterAssignment[] = [];

    for (const assignment of assignments) {
      try {
        const created = await this.create(firmId, userId, {
          matter_id: matterId,
          user_id: assignment.user_id,
          role: assignment.role
        }, requestMetadata);

        createdAssignments.push(created);
      } catch (error) {
        console.error(`Failed to assign user ${assignment.user_id}:`, error);
      }
    }

    return createdAssignments;
  }

  /**
   * Transfer matter from one user to another
   */
  async transfer(
    matterId: string,
    fromUserId: string,
    toUserId: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get existing assignments for the from user
      const existingAssignments = await client.query(
        `SELECT id, role FROM matter_assignments
        WHERE matter_id = $1 AND user_id = $2 AND is_active = true`,
        [matterId, fromUserId]
      );

      // Remove existing assignments
      await client.query(
        `UPDATE matter_assignments
        SET is_active = false, removed_date = CURRENT_DATE
        WHERE matter_id = $1 AND user_id = $2 AND is_active = true`,
        [matterId, fromUserId]
      );

      // Create new assignments for the to user
      for (const assignment of existingAssignments.rows) {
        await client.query(
          `INSERT INTO matter_assignments (matter_id, user_id, role)
          VALUES ($1, $2, $3)`,
          [matterId, toUserId, assignment.role]
        );
      }

      // Update lead director if transferring lead
      const leadCheck = existingAssignments.rows.find(a => a.role === 'Lead Director');
      if (leadCheck) {
        await client.query(
          `UPDATE deals SET lead_director_id = $1 WHERE id = $2 AND firm_id = $3`,
          [toUserId, matterId, firmId]
        );
      }

      await client.query('COMMIT');

      // Audit log
      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'UPDATE',
        entity_type: 'matter_assignment',
        changes: { transfer: { from: fromUserId, to: toUserId, matter: matterId } },
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(firmId: string) {
    const result = await pool.query(
      `SELECT * FROM team_workload WHERE firm_id = $1 ORDER BY assigned_matters DESC`,
      [firmId]
    );

    return result.rows;
  }
}

export const matterAssignmentService = new MatterAssignmentService();
