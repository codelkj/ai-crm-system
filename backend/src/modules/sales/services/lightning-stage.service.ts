/**
 * Lightning Stage Service
 * Manages Lightning Path stages for legal intake pipeline
 */

import pool from '../../../config/database';
import AuditLogService from '../../legal-crm/services/audit-log.service';

export interface LightningStage {
  id: string;
  firm_id: string;
  name: string;
  color?: string;
  stage_order: number;
  is_closed: boolean;
  closed_status?: 'won' | 'lost' | 'pass';
  description?: string;
  created_at: string;
  updated_at: string;
  // From view
  matter_count?: number;
  total_value?: number;
  avg_days_in_stage?: number;
}

export interface CreateStageDTO {
  name: string;
  color?: string;
  stage_order: number;
  is_closed?: boolean;
  closed_status?: 'won' | 'lost' | 'pass';
  description?: string;
}

export interface UpdateStageDTO {
  name?: string;
  color?: string;
  stage_order?: number;
  is_closed?: boolean;
  closed_status?: 'won' | 'lost' | 'pass';
  description?: string;
}

export class LightningStageService {
  /**
   * Get all stages for firm
   */
  async getAll(firmId: string, includeStats: boolean = false): Promise<LightningStage[]> {
    if (includeStats) {
      const result = await pool.query(
        `SELECT * FROM lightning_path_pipeline WHERE firm_id = $1 ORDER BY stage_order`,
        [firmId]
      );
      return result.rows;
    }

    const result = await pool.query(
      `SELECT * FROM lightning_stages WHERE firm_id = $1 ORDER BY stage_order`,
      [firmId]
    );
    return result.rows;
  }

  /**
   * Get stage by ID
   */
  async getById(id: string, firmId: string): Promise<LightningStage | null> {
    const result = await pool.query(
      `SELECT * FROM lightning_stages WHERE id = $1 AND firm_id = $2`,
      [id, firmId]
    );

    return result.rows[0] || null;
  }

  /**
   * Create new stage
   */
  async create(
    firmId: string,
    userId: string,
    data: CreateStageDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<LightningStage> {
    const result = await pool.query(
      `INSERT INTO lightning_stages (
        firm_id, name, color, stage_order, is_closed, closed_status, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        firmId,
        data.name,
        data.color,
        data.stage_order,
        data.is_closed || false,
        data.closed_status,
        data.description
      ]
    );

    const stage = result.rows[0];

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'CREATE',
      entity_type: 'lightning_stage',
      entity_id: stage.id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return stage;
  }

  /**
   * Update stage
   */
  async update(
    id: string,
    firmId: string,
    userId: string,
    data: UpdateStageDTO,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<LightningStage> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Stage not found');
    }

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }

    if (data.color !== undefined) {
      updates.push(`color = $${paramIndex++}`);
      params.push(data.color);
    }

    if (data.stage_order !== undefined) {
      updates.push(`stage_order = $${paramIndex++}`);
      params.push(data.stage_order);
    }

    if (data.is_closed !== undefined) {
      updates.push(`is_closed = $${paramIndex++}`);
      params.push(data.is_closed);
    }

    if (data.closed_status !== undefined) {
      updates.push(`closed_status = $${paramIndex++}`);
      params.push(data.closed_status);
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(data.description);
    }

    if (updates.length === 0) {
      return existing;
    }

    const result = await pool.query(
      `UPDATE lightning_stages SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND firm_id = $${paramIndex + 1}
      RETURNING *`,
      [...params, id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'lightning_stage',
      entity_id: id,
      changes: { old: existing, new: result.rows[0] },
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });

    return result.rows[0];
  }

  /**
   * Delete stage (only if no matters in it)
   */
  async delete(
    id: string,
    firmId: string,
    userId: string,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getById(id, firmId);
    if (!existing) {
      throw new Error('Stage not found');
    }

    // Check if any matters are in this stage
    const matterCheck = await pool.query(
      `SELECT COUNT(*) as count FROM deals WHERE lightning_stage_id = $1 AND pipeline_type = 'legal'`,
      [id]
    );

    if (parseInt(matterCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete stage with matters in it');
    }

    await pool.query(
      `DELETE FROM lightning_stages WHERE id = $1 AND firm_id = $2`,
      [id, firmId]
    );

    // Audit log
    await AuditLogService.log({
      firm_id: firmId,
      user_id: userId,
      action: 'DELETE',
      entity_type: 'lightning_stage',
      entity_id: id,
      ip_address: requestMetadata?.ip,
      user_agent: requestMetadata?.userAgent
    });
  }

  /**
   * Reorder stages
   */
  async reorder(
    firmId: string,
    userId: string,
    stageOrders: Array<{ id: string; stage_order: number }>,
    requestMetadata?: { ip?: string; userAgent?: string }
  ): Promise<LightningStage[]> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      for (const { id, stage_order } of stageOrders) {
        await client.query(
          `UPDATE lightning_stages SET stage_order = $1 WHERE id = $2 AND firm_id = $3`,
          [stage_order, id, firmId]
        );
      }

      await client.query('COMMIT');

      // Audit log
      await AuditLogService.log({
        firm_id: firmId,
        user_id: userId,
        action: 'UPDATE',
        entity_type: 'lightning_stage',
        changes: { reordered_stages: stageOrders },
        ip_address: requestMetadata?.ip,
        user_agent: requestMetadata?.userAgent
      });

      return await this.getAll(firmId);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get pipeline statistics
   */
  async getPipelineStats(firmId: string) {
    const result = await pool.query(
      `SELECT * FROM lightning_path_pipeline WHERE firm_id = $1 ORDER BY stage_order`,
      [firmId]
    );

    const stages = result.rows;

    const totalMatters = stages.reduce((sum, s) => sum + (parseInt(s.matter_count) || 0), 0);
    const totalValue = stages.reduce((sum, s) => sum + (parseFloat(s.total_value) || 0), 0);

    return {
      stages,
      total_matters: totalMatters,
      total_value: totalValue,
      avg_conversion_time: stages.reduce((sum, s) => sum + (parseFloat(s.avg_days_in_stage) || 0), 0) / stages.length
    };
  }
}

export const lightningStageService = new LightningStageService();
