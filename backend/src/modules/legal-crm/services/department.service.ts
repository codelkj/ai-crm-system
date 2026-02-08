/**
 * Department Service
 * Manages practice areas/departments within law firms
 */

import pool from '../../../config/database';

export interface Department {
  id: string;
  firm_id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateDepartmentDTO {
  firm_id: string;
  name: string;
  code: string;
  description?: string;
}

export interface UpdateDepartmentDTO {
  name?: string;
  code?: string;
  description?: string;
  active?: boolean;
}

class DepartmentService {
  /**
   * Get all departments for a firm
   */
  async getAll(firmId: string): Promise<Department[]> {
    const result = await pool.query(
      'SELECT * FROM departments WHERE firm_id = $1 ORDER BY name ASC',
      [firmId]
    );
    return result.rows;
  }

  /**
   * Get active departments for a firm
   */
  async getActive(firmId: string): Promise<Department[]> {
    const result = await pool.query(
      'SELECT * FROM departments WHERE firm_id = $1 AND active = true ORDER BY name ASC',
      [firmId]
    );
    return result.rows;
  }

  /**
   * Get department by ID
   */
  async getById(departmentId: string): Promise<Department | null> {
    const result = await pool.query(
      'SELECT * FROM departments WHERE id = $1',
      [departmentId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get department by code
   */
  async getByCode(firmId: string, code: string): Promise<Department | null> {
    const result = await pool.query(
      'SELECT * FROM departments WHERE firm_id = $1 AND code = $2',
      [firmId, code]
    );
    return result.rows[0] || null;
  }

  /**
   * Create department
   */
  async create(data: CreateDepartmentDTO): Promise<Department> {
    const result = await pool.query(
      `INSERT INTO departments (firm_id, name, code, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.firm_id, data.name, data.code, data.description]
    );
    return result.rows[0];
  }

  /**
   * Update department
   */
  async update(departmentId: string, data: UpdateDepartmentDTO): Promise<Department | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.getById(departmentId);
    }

    values.push(departmentId);

    const result = await pool.query(
      `UPDATE departments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete department (soft delete)
   */
  async delete(departmentId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE departments SET active = false WHERE id = $1',
      [departmentId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Get department statistics
   */
  async getStats(departmentId: string): Promise<any> {
    const result = await pool.query(
      `SELECT
        d.id,
        d.name,
        d.code,
        (SELECT COUNT(*) FROM user_departments WHERE department_id = $1) as attorney_count,
        (SELECT COUNT(*) FROM companies WHERE department_id = $1) as client_count,
        (SELECT COUNT(*) FROM deals WHERE department_id = $1 AND pipeline_type = 'legal') as matter_count
      FROM departments d
      WHERE d.id = $1`,
      [departmentId]
    );
    return result.rows[0];
  }

  /**
   * Get directors for department
   */
  async getDirectors(departmentId: string): Promise<any[]> {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.job_title, ud.is_director
       FROM users u
       JOIN user_departments ud ON u.id = ud.user_id
       WHERE ud.department_id = $1 AND ud.is_director = true
       ORDER BY u.name ASC`,
      [departmentId]
    );
    return result.rows;
  }

  /**
   * Assign user to department
   */
  async assignUser(departmentId: string, userId: string, isDirector: boolean = false): Promise<void> {
    await pool.query(
      `INSERT INTO user_departments (user_id, department_id, is_director)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, department_id) DO UPDATE SET is_director = $3`,
      [userId, departmentId, isDirector]
    );
  }

  /**
   * Remove user from department
   */
  async removeUser(departmentId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM user_departments WHERE department_id = $1 AND user_id = $2',
      [departmentId, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export default new DepartmentService();
