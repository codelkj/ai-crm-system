/**
 * Activity Service
 */

import { Activity, CreateActivityDTO } from '../types/crm.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { database as pool } from '../../../config';

export class ActivityService {
  /**
   * Get all activities with pagination and filtering
   */
  static async getAll(
    page = 1,
    limit = 20,
    contactId?: string,
    companyId?: string,
    dealId?: string
  ): Promise<{ data: Activity[]; meta: any }> {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM activities WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM activities WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    // Filter by contact
    if (contactId) {
      query += ` AND contact_id = $${paramCount}`;
      countQuery += ` AND contact_id = $${paramCount}`;
      params.push(contactId);
      paramCount++;
    }

    // Filter by company
    if (companyId) {
      query += ` AND company_id = $${paramCount}`;
      countQuery += ` AND company_id = $${paramCount}`;
      params.push(companyId);
      paramCount++;
    }

    // Filter by deal
    if (dealId) {
      query += ` AND deal_id = $${paramCount}`;
      countQuery += ` AND deal_id = $${paramCount}`;
      params.push(dealId);
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
   * Get activity by ID
   */
  static async getById(id: string): Promise<Activity> {
    const result = await pool.query(
      'SELECT * FROM activities WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Activity not found', 'ACTIVITY_NOT_FOUND');
    }

    return result.rows[0];
  }

  /**
   * Create new activity
   */
  static async create(data: CreateActivityDTO): Promise<Activity> {
    // Verify related entities exist
    if (data.contact_id) {
      const contactCheck = await pool.query(
        'SELECT id FROM contacts WHERE id = $1',
        [data.contact_id]
      );
      if (contactCheck.rows.length === 0) {
        throw new AppError(404, 'Contact not found', 'CONTACT_NOT_FOUND');
      }
    }

    if (data.company_id) {
      const companyCheck = await pool.query(
        'SELECT id FROM companies WHERE id = $1',
        [data.company_id]
      );
      if (companyCheck.rows.length === 0) {
        throw new AppError(404, 'Company not found', 'COMPANY_NOT_FOUND');
      }
    }

    if (data.deal_id) {
      const dealCheck = await pool.query(
        'SELECT id FROM deals WHERE id = $1',
        [data.deal_id]
      );
      if (dealCheck.rows.length === 0) {
        throw new AppError(404, 'Deal not found', 'DEAL_NOT_FOUND');
      }
    }

    const result = await pool.query(
      `INSERT INTO activities (
        contact_id, company_id, deal_id, type, subject, description, due_date
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.contact_id || null,
        data.company_id || null,
        data.deal_id || null,
        data.type,
        data.subject,
        data.description || null,
        data.due_date || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Update activity
   */
  static async update(id: string, data: Partial<CreateActivityDTO>): Promise<Activity> {
    // First check if activity exists
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

    values.push(id);

    const result = await pool.query(
      `UPDATE activities
       SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  /**
   * Delete activity
   */
  static async delete(id: string): Promise<void> {
    const result = await pool.query(
      'DELETE FROM activities WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Activity not found', 'ACTIVITY_NOT_FOUND');
    }
  }

  /**
   * Mark activity as completed
   */
  static async markAsCompleted(id: string): Promise<Activity> {
    const result = await pool.query(
      `UPDATE activities
       SET completed_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Activity not found', 'ACTIVITY_NOT_FOUND');
    }

    return result.rows[0];
  }
}
