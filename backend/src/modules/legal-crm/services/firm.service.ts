/**
 * Firm Service
 * Multi-tenancy core - manages law firm records
 */

import pool from '../../../config/database';

export interface Firm {
  id: string;
  name: string;
  registration_number?: string;
  vat_number?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  banking_details?: any;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFirmDTO {
  name: string;
  registration_number?: string;
  vat_number?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  banking_details?: any;
}

export interface UpdateFirmDTO extends Partial<CreateFirmDTO> {
  active?: boolean;
}

class FirmService {
  /**
   * Get all firms (admin only)
   */
  async getAll(): Promise<Firm[]> {
    const result = await pool.query(
      'SELECT * FROM firms ORDER BY name ASC'
    );
    return result.rows;
  }

  /**
   * Get firm by ID
   */
  async getById(firmId: string): Promise<Firm | null> {
    const result = await pool.query(
      'SELECT * FROM firms WHERE id = $1',
      [firmId]
    );
    return result.rows[0] || null;
  }

  /**
   * Create new firm
   */
  async create(data: CreateFirmDTO): Promise<Firm> {
    const result = await pool.query(
      `INSERT INTO firms (
        name, registration_number, vat_number, address, city, province,
        country, phone, email, logo_url, banking_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        data.name,
        data.registration_number,
        data.vat_number,
        data.address,
        data.city,
        data.province,
        data.country || 'South Africa',
        data.phone,
        data.email,
        data.logo_url,
        data.banking_details ? JSON.stringify(data.banking_details) : null
      ]
    );
    return result.rows[0];
  }

  /**
   * Update firm
   */
  async update(firmId: string, data: UpdateFirmDTO): Promise<Firm | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'banking_details' ? JSON.stringify(value) : value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.getById(firmId);
    }

    values.push(firmId);

    const result = await pool.query(
      `UPDATE firms SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  /**
   * Delete firm (soft delete - sets active = false)
   */
  async delete(firmId: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE firms SET active = false WHERE id = $1',
      [firmId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Hard delete firm (use with caution)
   */
  async hardDelete(firmId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM firms WHERE id = $1',
      [firmId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Get firm statistics
   */
  async getStats(firmId: string): Promise<any> {
    const result = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users WHERE firm_id = $1 AND is_deleted = false) as user_count,
        (SELECT COUNT(*) FROM companies WHERE firm_id = $1) as client_count,
        (SELECT COUNT(*) FROM deals WHERE firm_id = $1 AND pipeline_type = 'legal') as matter_count,
        (SELECT COUNT(*) FROM legal_documents WHERE firm_id = $1) as document_count
      `,
      [firmId]
    );
    return result.rows[0];
  }
}

export default new FirmService();
