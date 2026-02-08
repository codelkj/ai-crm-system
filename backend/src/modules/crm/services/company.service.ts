/**
 * Company Service
 */

import { Company, CreateCompanyDTO } from '../types/crm.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { database as pool } from '../../../config';

export class CompanyService {
  /**
   * Get all companies with pagination (firm-isolated)
   */
  static async getAll(firmId: string, page = 1, limit = 20): Promise<{ data: Company[]; meta: any }> {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM companies WHERE firm_id = $1',
      [firmId]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.*,
        u.name as primary_director_name,
        d.name as department_name
       FROM companies c
       LEFT JOIN users u ON c.primary_director_id = u.id
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.firm_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [firmId, limit, offset]
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
   * Get company by ID (with legal fields)
   */
  static async getById(id: string): Promise<Company> {
    const result = await pool.query(
      `SELECT c.*,
        u.name as primary_director_name,
        d.name as department_name,
        d.code as department_code
       FROM companies c
       LEFT JOIN users u ON c.primary_director_id = u.id
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
    }

    return result.rows[0];
  }

  /**
   * Create new company (with legal client fields)
   */
  static async create(data: CreateCompanyDTO & { firm_id: string }): Promise<Company> {
    const result = await pool.query(
      `INSERT INTO companies (
        firm_id, name, industry, website, phone, address, city, state, country,
        client_type, legal_entity_type, registration_number, tax_number,
        primary_director_id, department_id, risk_rating, fica_status,
        billing_email, preferred_billing_date, credit_limit, payment_terms
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
       RETURNING *`,
      [
        data.firm_id,
        data.name,
        data.industry || null,
        data.website || null,
        data.phone || null,
        data.address || null,
        data.city || null,
        data.state || null,
        data.country || null,
        (data as any).client_type || 'company',
        (data as any).legal_entity_type || null,
        (data as any).registration_number || null,
        (data as any).tax_number || null,
        (data as any).primary_director_id || null,
        (data as any).department_id || null,
        (data as any).risk_rating || 'low',
        (data as any).fica_status || 'not_started',
        (data as any).billing_email || null,
        (data as any).preferred_billing_date || null,
        (data as any).credit_limit || null,
        (data as any).payment_terms || 30,
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
   * Search companies by name (firm-isolated)
   */
  static async search(firmId: string, query: string, page = 1, limit = 20): Promise<{ data: Company[]; meta: any }> {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM companies WHERE firm_id = $1 AND name ILIKE $2',
      [firmId, searchPattern]
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.*,
        u.name as primary_director_name,
        d.name as department_name
       FROM companies c
       LEFT JOIN users u ON c.primary_director_id = u.id
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.firm_id = $1 AND c.name ILIKE $2
       ORDER BY c.created_at DESC
       LIMIT $3 OFFSET $4`,
      [firmId, searchPattern, limit, offset]
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
