/**
 * Contact Service
 */

import { Contact, CreateContactDTO } from '../types/crm.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { database as pool } from '../../../config';

export class ContactService {
  /**
   * Get all contacts with pagination and filtering
   */
  static async getAll(
    page = 1,
    limit = 20,
    companyId?: string,
    search?: string
  ): Promise<{ data: Contact[]; meta: any }> {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM contacts WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Filter by company
    if (companyId) {
      query += ` AND company_id = $${paramCount}`;
      countQuery += ` AND company_id = $${paramCount}`;
      params.push(companyId);
      paramCount++;
    }

    // Search filter
    if (search) {
      const searchPattern = `%${search}%`;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      countQuery += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(searchPattern);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    const result = await pool.query(query, [...params, limit, offset]);

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
   * Get contact by ID
   */
  static async getById(id: string): Promise<Contact> {
    const result = await pool.query(
      `SELECT c.*,
              co.name as company_name
       FROM contacts c
       LEFT JOIN companies co ON c.company_id = co.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Contact not found', 'CONTACT_NOT_FOUND');
    }

    return result.rows[0];
  }

  /**
   * Create new contact
   */
  static async create(data: CreateContactDTO): Promise<Contact> {
    // Verify company exists if provided
    if (data.company_id) {
      const companyCheck = await pool.query(
        'SELECT id FROM companies WHERE id = $1',
        [data.company_id]
      );
      if (companyCheck.rows.length === 0) {
        throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
      }
    }

    const result = await pool.query(
      `INSERT INTO contacts (
        company_id, first_name, last_name, email, phone, position, is_primary
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.company_id || null,
        data.first_name,
        data.last_name,
        data.email,
        data.phone || null,
        data.position || null,
        data.is_primary || false,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update contact
   */
  static async update(id: string, data: Partial<CreateContactDTO>): Promise<Contact> {
    // First check if contact exists
    await this.getById(id);

    // Verify company exists if updating
    if (data.company_id) {
      const companyCheck = await pool.query(
        'SELECT id FROM companies WHERE id = $1',
        [data.company_id]
      );
      if (companyCheck.rows.length === 0) {
        throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
      }
    }

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
      `UPDATE contacts
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Delete contact
   */
  static async delete(id: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Contact not found', 'CONTACT_NOT_FOUND');
    }
  }

  /**
   * Get contacts by company
   */
  static async getByCompanyId(companyId: string): Promise<Contact[]> {
    const result = await pool.query(
      `SELECT * FROM contacts
       WHERE company_id = $1
       ORDER BY is_primary DESC, created_at DESC`,
      [companyId]
    );

    return result.rows;
  }
}
