/**
 * Document Access Service
 * Audit logging for document access
 */

import pool from '../../../config/database';

class DocumentAccessService {
  /**
   * Log document access
   */
  async logAccess(data: {
    firmId: string;
    documentId: string;
    userId: string;
    action: 'view' | 'download' | 'edit' | 'delete' | 'share';
    ipAddress?: string;
    userAgent?: string;
    accessGranted: boolean;
    denialReason?: string;
  }) {
    try {
      await pool.query(`
        INSERT INTO document_access_logs (
          firm_id, document_id, user_id, action,
          ip_address, user_agent, access_granted, denial_reason
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        data.firmId,
        data.documentId,
        data.userId,
        data.action,
        data.ipAddress || null,
        data.userAgent || null,
        data.accessGranted,
        data.denialReason || null
      ]);

      // Update last accessed timestamp on document
      if (data.accessGranted && data.action === 'view') {
        await pool.query(`
          UPDATE legal_documents
          SET last_accessed_at = CURRENT_TIMESTAMP,
              last_accessed_by = $1
          WHERE id = $2
        `, [data.userId, data.documentId]);
      }

    } catch (error) {
      console.error('Access logging error:', error);
      // Don't throw error - logging failures shouldn't block operations
    }
  }

  /**
   * Get document access history
   */
  async getDocumentHistory(documentId: string, limit: number = 100) {
    const result = await pool.query(`
      SELECT
        dal.*,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email
      FROM document_access_logs dal
      LEFT JOIN users u ON u.id = dal.user_id
      WHERE dal.document_id = $1
      ORDER BY dal.created_at DESC
      LIMIT $2
    `, [documentId, limit]);

    return result.rows;
  }

  /**
   * Get user's document access history
   */
  async getUserHistory(userId: string, firmId: string, limit: number = 100) {
    const result = await pool.query(`
      SELECT
        dal.*,
        ld.title AS document_title,
        ld.document_type
      FROM document_access_logs dal
      JOIN legal_documents ld ON ld.id = dal.document_id
      WHERE dal.user_id = $1
      AND dal.firm_id = $2
      ORDER BY dal.created_at DESC
      LIMIT $3
    `, [userId, firmId, limit]);

    return result.rows;
  }

  /**
   * Get access statistics
   */
  async getAccessStats(firmId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    documentId?: string;
  }) {
    let query = `
      SELECT
        COUNT(*) as total_accesses,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT document_id) as unique_documents,
        COUNT(CASE WHEN action = 'view' THEN 1 END) as view_count,
        COUNT(CASE WHEN action = 'download' THEN 1 END) as download_count,
        COUNT(CASE WHEN action = 'edit' THEN 1 END) as edit_count,
        COUNT(CASE WHEN action = 'delete' THEN 1 END) as delete_count,
        COUNT(CASE WHEN action = 'share' THEN 1 END) as share_count,
        COUNT(CASE WHEN access_granted = false THEN 1 END) as denied_accesses
      FROM document_access_logs
      WHERE firm_id = $1
    `;

    const params: any[] = [firmId];
    let paramIndex = 2;

    if (filters?.startDate) {
      query += ` AND created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ` AND created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    if (filters?.userId) {
      query += ` AND user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters?.documentId) {
      query += ` AND document_id = $${paramIndex++}`;
      params.push(filters.documentId);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  /**
   * Get most accessed documents
   */
  async getMostAccessedDocuments(firmId: string, limit: number = 10, days: number = 30) {
    const result = await pool.query(`
      SELECT
        ld.id,
        ld.title,
        ld.document_type,
        COUNT(dal.id) as access_count,
        COUNT(DISTINCT dal.user_id) as unique_users,
        MAX(dal.created_at) as last_accessed
      FROM legal_documents ld
      JOIN document_access_logs dal ON dal.document_id = ld.id
      WHERE ld.firm_id = $1
      AND dal.created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      AND dal.access_granted = true
      GROUP BY ld.id, ld.title, ld.document_type
      ORDER BY access_count DESC
      LIMIT $2
    `, [firmId, limit]);

    return result.rows;
  }

  /**
   * Get recent access denials
   */
  async getRecentDenials(firmId: string, limit: number = 50) {
    const result = await pool.query(`
      SELECT
        dal.*,
        u.first_name || ' ' || u.last_name AS user_name,
        u.email AS user_email,
        ld.title AS document_title,
        ld.access_level AS document_access_level
      FROM document_access_logs dal
      LEFT JOIN users u ON u.id = dal.user_id
      LEFT JOIN legal_documents ld ON ld.id = dal.document_id
      WHERE dal.firm_id = $1
      AND dal.access_granted = false
      ORDER BY dal.created_at DESC
      LIMIT $2
    `, [firmId, limit]);

    return result.rows;
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string, firmId: string, days: number = 30) {
    const result = await pool.query(`
      SELECT
        DATE(dal.created_at) as activity_date,
        COUNT(*) as total_actions,
        COUNT(CASE WHEN dal.action = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN dal.action = 'download' THEN 1 END) as downloads,
        COUNT(CASE WHEN dal.action = 'edit' THEN 1 END) as edits,
        COUNT(DISTINCT dal.document_id) as unique_documents
      FROM document_access_logs dal
      WHERE dal.user_id = $1
      AND dal.firm_id = $2
      AND dal.created_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      GROUP BY DATE(dal.created_at)
      ORDER BY activity_date DESC
    `, [userId, firmId]);

    return result.rows;
  }

  /**
   * Clean up old logs (retention policy)
   */
  async cleanupOldLogs(firmId: string, retentionDays: number = 365) {
    const result = await pool.query(`
      DELETE FROM document_access_logs
      WHERE firm_id = $1
      AND created_at < CURRENT_TIMESTAMP - INTERVAL '${retentionDays} days'
    `, [firmId]);

    return result.rowCount;
  }

  /**
   * Export access logs (for compliance)
   */
  async exportLogs(firmId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    documentId?: string;
  }) {
    let query = `
      SELECT
        dal.id,
        dal.created_at,
        dal.action,
        dal.access_granted,
        dal.denial_reason,
        dal.ip_address,
        u.email AS user_email,
        u.first_name || ' ' || u.last_name AS user_name,
        ld.title AS document_title,
        ld.document_type,
        ld.access_level
      FROM document_access_logs dal
      LEFT JOIN users u ON u.id = dal.user_id
      LEFT JOIN legal_documents ld ON ld.id = dal.document_id
      WHERE dal.firm_id = $1
    `;

    const params: any[] = [firmId];
    let paramIndex = 2;

    if (filters?.startDate) {
      query += ` AND dal.created_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ` AND dal.created_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    if (filters?.userId) {
      query += ` AND dal.user_id = $${paramIndex++}`;
      params.push(filters.userId);
    }

    if (filters?.documentId) {
      query += ` AND dal.document_id = $${paramIndex++}`;
      params.push(filters.documentId);
    }

    query += ` ORDER BY dal.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

export default new DocumentAccessService();
