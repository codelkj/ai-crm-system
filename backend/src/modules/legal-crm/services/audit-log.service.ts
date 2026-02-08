/**
 * Audit Log Service
 * POPIA-compliant audit trail for all data access and modifications
 */

import pool from '../../../config/database';

export interface AuditLog {
  id: string;
  firm_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
  created_at: Date;
}

export interface CreateAuditLogDTO {
  firm_id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  changes?: any;
  ip_address?: string;
  user_agent?: string;
  reason?: string;
}

export interface AuditLogFilter {
  firm_id: string;
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  action?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  DOWNLOAD = 'DOWNLOAD',
  EXPORT = 'EXPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SEND = 'SEND'
}

class AuditLogService {
  /**
   * Create audit log entry
   */
  async log(data: CreateAuditLogDTO): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs (
          firm_id, user_id, action, entity_type, entity_id,
          changes, ip_address, user_agent, reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          data.firm_id,
          data.user_id,
          data.action,
          data.entity_type,
          data.entity_id,
          data.changes ? JSON.stringify(data.changes) : null,
          data.ip_address,
          data.user_agent,
          data.reason
        ]
      );
    } catch (error) {
      // Audit logging should never fail silently but also shouldn't break the main flow
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Get audit logs with filters
   */
  async getAll(filters: AuditLogFilter): Promise<{ logs: AuditLog[]; total: number }> {
    const conditions: string[] = ['firm_id = $1'];
    const params: any[] = [filters.firm_id];
    let paramCount = 2;

    if (filters.user_id) {
      conditions.push(`user_id = $${paramCount}`);
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.entity_type) {
      conditions.push(`entity_type = $${paramCount}`);
      params.push(filters.entity_type);
      paramCount++;
    }

    if (filters.entity_id) {
      conditions.push(`entity_id = $${paramCount}`);
      params.push(filters.entity_id);
      paramCount++;
    }

    if (filters.action) {
      conditions.push(`action = $${paramCount}`);
      params.push(filters.action);
      paramCount++;
    }

    if (filters.start_date) {
      conditions.push(`created_at >= $${paramCount}`);
      params.push(filters.start_date);
      paramCount++;
    }

    if (filters.end_date) {
      conditions.push(`created_at <= $${paramCount}`);
      params.push(filters.end_date);
      paramCount++;
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM audit_logs WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const result = await pool.query(
      `SELECT
        al.*,
        u.name as user_name,
        u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    return {
      logs: result.rows,
      total
    };
  }

  /**
   * Get audit trail for specific entity
   */
  async getEntityHistory(firmId: string, entityType: string, entityId: string): Promise<AuditLog[]> {
    const result = await pool.query(
      `SELECT
        al.*,
        u.name as user_name,
        u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.firm_id = $1 AND al.entity_type = $2 AND al.entity_id = $3
       ORDER BY al.created_at DESC`,
      [firmId, entityType, entityId]
    );
    return result.rows;
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(firmId: string, userId: string, days: number = 30): Promise<any> {
    const result = await pool.query(
      `SELECT
        action,
        COUNT(*) as count
       FROM audit_logs
       WHERE firm_id = $1 AND user_id = $2 AND created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY action
       ORDER BY count DESC`,
      [firmId, userId]
    );
    return result.rows;
  }

  /**
   * Get entity access statistics
   */
  async getEntityAccessStats(firmId: string, entityType: string, days: number = 30): Promise<any> {
    const result = await pool.query(
      `SELECT
        action,
        DATE(created_at) as date,
        COUNT(*) as count
       FROM audit_logs
       WHERE firm_id = $1 AND entity_type = $2 AND created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY action, DATE(created_at)
       ORDER BY date DESC, action ASC`,
      [firmId, entityType]
    );
    return result.rows;
  }

  /**
   * Get recent activity across firm
   */
  async getRecentActivity(firmId: string, limit: number = 100): Promise<AuditLog[]> {
    const result = await pool.query(
      `SELECT
        al.*,
        u.name as user_name,
        u.email as user_email
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       WHERE al.firm_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2`,
      [firmId, limit]
    );
    return result.rows;
  }

  /**
   * Delete old audit logs (retention policy)
   */
  async cleanupOldLogs(firmId: string, retentionDays: number = 2555): Promise<number> {
    const result = await pool.query(
      `DELETE FROM audit_logs
       WHERE firm_id = $1 AND created_at < NOW() - INTERVAL '${retentionDays} days'`,
      [firmId]
    );
    return result.rowCount || 0;
  }
}

export default new AuditLogService();
