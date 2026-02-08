/**
 * User Service (Database-backed)
 * Manages user authentication with multi-tenancy and role-based access
 */

import pool from '../../../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  firm_id: string;
  email: string;
  password_hash?: string;
  name: string;
  role_id?: string;
  role?: any;
  employee_number?: string;
  job_title?: string;
  hourly_rate?: number;
  is_attorney?: boolean;
  bar_number?: string;
  is_active: boolean;
  is_deleted?: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

class UserService {
  /**
   * Find user by email with role and permissions
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT
        u.*,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        r.name as role_name,
        r.level as role_level,
        r.permissions as role_permissions
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      ...user,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: user.role_name ? {
        id: user.role_id,
        name: user.role_name,
        level: user.role_level,
        permissions: user.role_permissions
      } : null
    };
  }

  /**
   * Find user by ID with role and permissions
   */
  async findById(userId: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT
        u.*,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        r.name as role_name,
        r.level as role_level,
        r.permissions as role_permissions
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return {
      ...user,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      role: user.role_name ? {
        id: user.role_id,
        name: user.role_name,
        level: user.role_level,
        permissions: user.role_permissions
      } : null
    };
  }

  /**
   * Create new user
   */
  async create(data: {
    firm_id: string;
    email: string;
    password: string;
    name: string;
    role_id?: string;
    job_title?: string;
    employee_number?: string;
    hourly_rate?: number;
    is_attorney?: boolean;
  }): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, 10);

    const result = await pool.query(
      `INSERT INTO users (
        firm_id, email, password_hash, name, role_id,
        job_title, employee_number, hourly_rate, is_attorney
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.firm_id,
        data.email,
        password_hash,
        data.name,
        data.role_id,
        data.job_title,
        data.employee_number,
        data.hourly_rate,
        data.is_attorney || false
      ]
    );

    return result.rows[0];
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  /**
   * Get all users for a firm
   */
  async getAll(firmId: string): Promise<User[]> {
    const result = await pool.query(
      `SELECT
        u.id, u.firm_id, u.email, u.name, u.role_id, u.employee_number,
        u.job_title, u.hourly_rate, u.is_attorney, u.bar_number,
        u.is_active, u.last_login, u.created_at,
        r.name as role_name,
        r.level as role_level
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.firm_id = $1 AND u.is_deleted = false
       ORDER BY u.name ASC`,
      [firmId]
    );

    return result.rows.map(user => ({
      ...user,
      role: user.role_name ? {
        id: user.role_id,
        name: user.role_name,
        level: user.role_level
      } : null
    }));
  }

  /**
   * Update user
   */
  async update(userId: string, data: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Don't allow updating firm_id or is_deleted through this method
    const { firm_id, is_deleted, password_hash, ...updateData } = data as any;

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.findById(userId);
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Soft delete user
   */
  async delete(userId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE users SET is_deleted = true, is_active = false WHERE id = $1',
      [userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export default new UserService();
