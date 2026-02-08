/**
 * Role Service
 * Manages legal-specific roles and permissions (RBAC)
 */

import pool from '../../../config/database';

export interface Role {
  id: string;
  firm_id: string;
  name: string;
  description?: string;
  level: number;
  permissions: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateRoleDTO {
  firm_id: string;
  name: string;
  description?: string;
  level: number;
  permissions?: any;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  level?: number;
  permissions?: any;
}

class RoleService {
  /**
   * Get all roles for a firm
   */
  async getAll(firmId: string): Promise<Role[]> {
    const result = await pool.query(
      'SELECT * FROM roles WHERE firm_id = $1 ORDER BY level ASC, name ASC',
      [firmId]
    );
    return result.rows;
  }

  /**
   * Get role by ID
   */
  async getById(roleId: string): Promise<Role | null> {
    const result = await pool.query(
      'SELECT * FROM roles WHERE id = $1',
      [roleId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get role by name
   */
  async getByName(firmId: string, name: string): Promise<Role | null> {
    const result = await pool.query(
      'SELECT * FROM roles WHERE firm_id = $1 AND name = $2',
      [firmId, name]
    );
    return result.rows[0] || null;
  }

  /**
   * Create role
   */
  async create(data: CreateRoleDTO): Promise<Role> {
    const result = await pool.query(
      `INSERT INTO roles (firm_id, name, description, level, permissions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.firm_id,
        data.name,
        data.description,
        data.level,
        data.permissions ? JSON.stringify(data.permissions) : '{}'
      ]
    );
    return result.rows[0];
  }

  /**
   * Update role
   */
  async update(roleId: string, data: UpdateRoleDTO): Promise<Role | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'permissions' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.getById(roleId);
    }

    values.push(roleId);

    const result = await pool.query(
      `UPDATE roles SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete role
   */
  async delete(roleId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM roles WHERE id = $1',
      [roleId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Check if user has permission
   */
  hasPermission(role: Role, resource: string, action: string): boolean {
    if (!role || !role.permissions) {
      return false;
    }

    const permissions = role.permissions[resource];
    if (!permissions) {
      return false;
    }

    // Check if permissions is an array and includes the action
    if (Array.isArray(permissions)) {
      return permissions.includes(action) || permissions.includes('all');
    }

    return false;
  }

  /**
   * Get users with role
   */
  async getUsersWithRole(roleId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.job_title, u.employee_number
       FROM users u
       WHERE u.role_id = $1 AND u.is_deleted = false
       ORDER BY u.name ASC`,
      [roleId]
    );
    return result.rows;
  }

  /**
   * Check if role can be deleted (no users assigned)
   */
  async canDelete(roleId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = $1 AND is_deleted = false',
      [roleId]
    );
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Get role permissions matrix (for UI display)
   */
  getPermissionMatrix(): any {
    return {
      clients: ['create', 'read', 'update', 'delete'],
      matters: ['create', 'read', 'update', 'delete', 'assign', 'close'],
      documents: ['create', 'read', 'update', 'delete', 'all_access'],
      financials: ['create', 'read', 'update', 'delete', 'approve', 'read_own'],
      invoices: ['create', 'read', 'update', 'delete', 'send', 'approve'],
      time_entries: ['create', 'read', 'update', 'delete', 'approve', 'approve_own_team'],
      users: ['create', 'read', 'update', 'delete'],
      reports: ['all', 'department', 'own_matters', 'own_time', 'financial', 'billing', 'revenue', 'operational', 'management', 'own_work'],
      settings: ['manage', 'manage_practice'],
      audit_logs: ['read'],
      billing_packs: ['create', 'read', 'update', 'send']
    };
  }
}

export default new RoleService();
