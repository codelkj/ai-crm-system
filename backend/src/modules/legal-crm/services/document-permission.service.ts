/**
 * Document Permission Service
 * RBAC for legal documents
 */

import pool from '../../../config/database';

class DocumentPermissionService {
  /**
   * Check if user can access a document
   */
  async canAccess(userId: string, documentId: string): Promise<boolean> {
    try {
      const result = await pool.query(`
        SELECT can_access
        FROM v_document_access
        WHERE user_id = $1 AND document_id = $2
        LIMIT 1
      `, [userId, documentId]);

      if (result.rows.length === 0) return false;

      return result.rows[0].can_access;

    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Get documents user can access
   */
  async getAccessibleDocuments(userId: string, firmId: string, filters?: {
    matterFilter?: string;
    accessLevel?: string;
    documentType?: string;
  }): Promise<any[]> {
    let query = `
      SELECT DISTINCT
        ld.id,
        ld.title,
        ld.document_type,
        ld.access_level,
        ld.matter_id,
        ld.file_size,
        ld.mime_type,
        ld.upload_date,
        ld.tags,
        ld.version
      FROM legal_documents ld
      JOIN v_document_access vda ON vda.document_id = ld.id
      WHERE vda.user_id = $1
      AND ld.firm_id = $2
      AND vda.can_access = true
    `;

    const params: any[] = [userId, firmId];
    let paramIndex = 3;

    if (filters?.matterId) {
      query += ` AND ld.matter_id = $${paramIndex++}`;
      params.push(filters.matterId);
    }

    if (filters?.accessLevel) {
      query += ` AND ld.access_level = $${paramIndex++}`;
      params.push(filters.accessLevel);
    }

    if (filters?.documentType) {
      query += ` AND ld.document_type = $${paramIndex++}`;
      params.push(filters.documentType);
    }

    query += ` ORDER BY ld.upload_date DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Check multiple permissions at once
   */
  async checkBulkAccess(userId: string, documentIds: string[]): Promise<Map<string, boolean>> {
    if (documentIds.length === 0) return new Map();

    const result = await pool.query(`
      SELECT document_id, can_access
      FROM v_document_access
      WHERE user_id = $1
      AND document_id = ANY($2)
    `, [userId, documentIds]);

    const accessMap = new Map<string, boolean>();
    for (const row of result.rows) {
      accessMap.set(row.document_id, row.can_access);
    }

    // Set false for any missing documents
    for (const docId of documentIds) {
      if (!accessMap.has(docId)) {
        accessMap.set(docId, false);
      }
    }

    return accessMap;
  }

  /**
   * Get access level recommendations based on document type
   */
  async getRecommendedAccessLevel(documentType: string, firmId: string): Promise<string> {
    const result = await pool.query(`
      SELECT default_access_level
      FROM document_types
      WHERE code = $1 AND firm_id = $2
      LIMIT 1
    `, [documentType, firmId]);

    if (result.rows.length === 0) return 'matter_team';

    return result.rows[0].default_access_level;
  }

  /**
   * Share document with user or department
   */
  async shareDocument(data: {
    documentId: string;
    sharedBy: string;
    sharedWithUserId?: string;
    sharedWithDepartmentId?: string;
    permission: 'view' | 'edit' | 'manage';
    expiresAt?: Date;
  }) {
    if (!data.sharedWithUserId && !data.sharedWithDepartmentId) {
      throw new Error('Must specify either user or department to share with');
    }

    const result = await pool.query(`
      INSERT INTO document_shares (
        document_id, shared_by, shared_with_user_id,
        shared_with_department_id, permission, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      data.documentId,
      data.sharedBy,
      data.sharedWithUserId || null,
      data.sharedWithDepartmentId || null,
      data.permission,
      data.expiresAt || null
    ]);

    return result.rows[0];
  }

  /**
   * Revoke document share
   */
  async revokeShare(shareId: string) {
    await pool.query('DELETE FROM document_shares WHERE id = $1', [shareId]);
  }

  /**
   * Get document shares
   */
  async getDocumentShares(documentId: string) {
    const result = await pool.query(`
      SELECT
        ds.*,
        u.first_name || ' ' || u.last_name AS shared_with_user_name,
        d.name AS shared_with_department_name,
        sb.first_name || ' ' || sb.last_name AS shared_by_name
      FROM document_shares ds
      LEFT JOIN users u ON u.id = ds.shared_with_user_id
      LEFT JOIN departments d ON d.id = ds.shared_with_department_id
      LEFT JOIN users sb ON sb.id = ds.shared_by
      WHERE ds.document_id = $1
      AND (ds.expires_at IS NULL OR ds.expires_at > CURRENT_TIMESTAMP)
      ORDER BY ds.created_at DESC
    `, [documentId]);

    return result.rows;
  }

  /**
   * Update document access level
   */
  async updateAccessLevel(documentId: string, accessLevel: string) {
    const validLevels = ['public', 'matter_team', 'partner_only', 'restricted'];
    if (!validLevels.includes(accessLevel)) {
      throw new Error('Invalid access level');
    }

    const result = await pool.query(`
      UPDATE legal_documents
      SET access_level = $1
      WHERE id = $2
      RETURNING *
    `, [accessLevel, documentId]);

    return result.rows[0];
  }

  /**
   * Get user's role level
   */
  async getUserRoleLevel(userId: string): Promise<number> {
    const result = await pool.query(`
      SELECT r.level
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) return 999; // Very low permission level

    return result.rows[0].level;
  }

  /**
   * Check if user is partner/director (level 1)
   */
  async isPartner(userId: string): Promise<boolean> {
    const level = await this.getUserRoleLevel(userId);
    return level <= 1;
  }

  /**
   * Get access statistics for a user
   */
  async getUserAccessStats(userId: string, firmId: string) {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_accessible_documents,
        COUNT(CASE WHEN vda.document_access_level = 'public' THEN 1 END) as public_documents,
        COUNT(CASE WHEN vda.document_access_level = 'matter_team' THEN 1 END) as matter_team_documents,
        COUNT(CASE WHEN vda.document_access_level = 'partner_only' THEN 1 END) as partner_only_documents,
        COUNT(CASE WHEN vda.document_access_level = 'restricted' THEN 1 END) as restricted_documents
      FROM (
        SELECT DISTINCT ld.id, ld.access_level as document_access_level
        FROM legal_documents ld
        JOIN v_document_access vda ON vda.document_id = ld.id
        WHERE vda.user_id = $1
        AND ld.firm_id = $2
        AND vda.can_access = true
      ) vda
    `, [userId, firmId]);

    return result.rows[0];
  }

  /**
   * Check if user is on matter team
   */
  async isOnMatterTeam(userId: string, matterId: string): Promise<boolean> {
    const result = await pool.query(`
      SELECT 1
      FROM matter_assignments
      WHERE matter_id = $1 AND user_id = $2
      LIMIT 1
    `, [matterId, userId]);

    return result.rows.length > 0;
  }
}

export default new DocumentPermissionService();
