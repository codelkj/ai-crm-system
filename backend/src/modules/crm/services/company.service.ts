/**
 * Company Service
 */

import { Company, CreateCompanyDTO } from '../types/crm.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { database as pool } from '../../../config';

export class CompanyService {
  /**
   * Get all companies with pagination
   */
  static async getAll(page = 1, limit = 20): Promise<{ data: Company[]; meta: any }> {
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM companies');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM companies
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      data: result.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get company by ID
   */
  static async getById(id: string): Promise<Company> {
    const result = await pool.query(
      'SELECT * FROM companies WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
    }

    return result.rows[0];
  }

  /**
   * Create new company
   */
  static async create(data: CreateCompanyDTO): Promise<Company> {
    const result = await pool.query(
      `INSERT INTO companies (name, industry, website, phone, address, city, state, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.name,
        data.industry || null,
        data.website || null,
        data.phone || null,
        data.address || null,
        data.city || null,
        data.state || null,
        data.country || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update company
   */
  static async update(id: string, data: Partial<CreateCompanyDTO>): Promise<Company> {
    // First check if company exists
    await this.getById(id);

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    if (fields.length === 0) {
      throw new AppError(400, 'No fields to update', 'NO_UPDATE_FIELDS');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE companies
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Delete company
   */
  static async delete(id: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM companies WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
    }
  }

  /**
   * Search companies by name
   */
  static async search(query: string, page = 1, limit = 20): Promise<{ data: Company[]; meta: any }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM companies WHERE name ILIKE $1',
      [searchPattern]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM companies
       WHERE name ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchPattern, limit, offset]
    );

    return {
      data: result.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
