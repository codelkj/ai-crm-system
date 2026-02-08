/**
 * Routing Service
 * Department routing and director assignment logic
 */

import pool from '../../../config/database';

interface RoutingConditions {
  client_type?: string;
  matter_type?: string;
  value_min?: number;
  value_max?: number;
  department_code?: string;
  [key: string]: any;
}

interface RoutingRule {
  id: string;
  name: string;
  department_id: string;
  priority: number;
  conditions: RoutingConditions;
  assign_to_user_id?: string;
  round_robin: boolean;
  active: boolean;
}

class RoutingService {
  /**
   * Assign a director to a client or matter based on routing rules
   */
  async assignDirector(firmId: string, data: {
    clientId?: string;
    matterType?: string;
    estimatedValue?: number;
    departmentId?: string;
  }): Promise<{
    userId: string;
    userName: string;
    departmentId: string;
    departmentName: string;
    method: 'manual' | 'rule' | 'round_robin' | 'department_director';
  }> {
    try {
      // 1. Get client info if provided
      let client = null;
      if (data.clientId) {
        const clientResult = await pool.query(`
          SELECT id, primary_director_id, client_type, department_id
          FROM companies
          WHERE id = $1 AND firm_id = $2
        `, [data.clientId, firmId]);

        if (clientResult.rows.length > 0) {
          client = clientResult.rows[0];

          // If client has manual assignment, use that
          if (client.primary_director_id) {
            const directorResult = await pool.query(`
              SELECT u.id, u.first_name || ' ' || u.last_name AS name,
                     d.id AS department_id, d.name AS department_name
              FROM users u
              LEFT JOIN user_departments ud ON ud.user_id = u.id AND ud.is_director = true
              LEFT JOIN departments d ON d.id = ud.department_id
              WHERE u.id = $1
              LIMIT 1
            `, [client.primary_director_id]);

            if (directorResult.rows.length > 0) {
              const director = directorResult.rows[0];
              return {
                userId: director.id,
                userName: director.name,
                departmentId: director.department_id || client.department_id,
                departmentName: director.department_name || '',
                method: 'manual'
              };
            }
          }
        }
      }

      // 2. Apply routing rules
      const rules = await this.getActiveRules(firmId);

      for (const rule of rules) {
        if (this.matchesConditions(client, data, rule.conditions)) {
          if (rule.round_robin) {
            // Round-robin assignment
            const nextUser = await this.getNextRoundRobinUser(rule.department_id);
            if (nextUser) {
              return {
                ...nextUser,
                method: 'round_robin'
              };
            }
          } else if (rule.assign_to_user_id) {
            // Fixed user assignment
            const userResult = await pool.query(`
              SELECT u.id, u.first_name || ' ' || u.last_name AS name,
                     d.id AS department_id, d.name AS department_name
              FROM users u
              LEFT JOIN user_departments ud ON ud.user_id = u.id
              LEFT JOIN departments d ON d.id = ud.department_id
              WHERE u.id = $1
              LIMIT 1
            `, [rule.assign_to_user_id]);

            if (userResult.rows.length > 0) {
              const user = userResult.rows[0];
              return {
                userId: user.id,
                userName: user.name,
                departmentId: user.department_id || rule.department_id,
                departmentName: user.department_name || '',
                method: 'rule'
              };
            }
          }
        }
      }

      // 3. Fallback: Get department director
      const departmentId = data.departmentId || client?.department_id;
      if (departmentId) {
        const director = await this.getDepartmentDirector(departmentId);
        if (director) {
          return {
            ...director,
            method: 'department_director'
          };
        }
      }

      throw new Error('No suitable director found for assignment');

    } catch (error) {
      console.error('Director assignment error:', error);
      throw error;
    }
  }

  /**
   * Get active routing rules for a firm
   */
  private async getActiveRules(firmId: string): Promise<RoutingRule[]> {
    const result = await pool.query(`
      SELECT id, name, department_id, priority, conditions,
             assign_to_user_id, round_robin, active
      FROM routing_rules
      WHERE firm_id = $1 AND active = true
      ORDER BY priority DESC
    `, [firmId]);

    return result.rows;
  }

  /**
   * Check if conditions match
   */
  private matchesConditions(
    client: any,
    data: any,
    conditions: RoutingConditions
  ): boolean {
    // Client type matching
    if (conditions.client_type && client?.client_type !== conditions.client_type) {
      return false;
    }

    // Matter type matching
    if (conditions.matter_type && data.matterType !== conditions.matter_type) {
      return false;
    }

    // Value range matching
    if (conditions.value_min && (data.estimatedValue || 0) < conditions.value_min) {
      return false;
    }

    if (conditions.value_max && (data.estimatedValue || 0) > conditions.value_max) {
      return false;
    }

    // Department matching
    if (conditions.department_code) {
      // This would require looking up department by code
      return true; // Simplified for now
    }

    return true;
  }

  /**
   * Get next user in round-robin rotation
   */
  private async getNextRoundRobinUser(departmentId: string): Promise<{
    userId: string;
    userName: string;
    departmentId: string;
    departmentName: string;
  } | null> {
    try {
      const result = await pool.query(`
        SELECT get_next_round_robin_user($1) AS user_id
      `, [departmentId]);

      const userId = result.rows[0]?.user_id;
      if (!userId) return null;

      // Get user details
      const userResult = await pool.query(`
        SELECT u.id, u.first_name || ' ' || u.last_name AS name,
               d.id AS department_id, d.name AS department_name
        FROM users u
        LEFT JOIN user_departments ud ON ud.user_id = u.id
        LEFT JOIN departments d ON d.id = ud.department_id
        WHERE u.id = $1
        LIMIT 1
      `, [userId]);

      if (userResult.rows.length === 0) return null;

      const user = userResult.rows[0];
      return {
        userId: user.id,
        userName: user.name,
        departmentId: user.department_id || departmentId,
        departmentName: user.department_name || ''
      };

    } catch (error) {
      console.error('Round-robin assignment error:', error);
      return null;
    }
  }

  /**
   * Get department director
   */
  private async getDepartmentDirector(departmentId: string): Promise<{
    userId: string;
    userName: string;
    departmentId: string;
    departmentName: string;
  } | null> {
    const result = await pool.query(`
      SELECT u.id, u.first_name || ' ' || u.last_name AS name,
             d.id AS department_id, d.name AS department_name
      FROM users u
      JOIN user_departments ud ON ud.user_id = u.id
      JOIN departments d ON d.id = ud.department_id
      WHERE ud.department_id = $1
      AND ud.is_director = true
      AND u.is_active = true
      ORDER BY u.created_at ASC
      LIMIT 1
    `, [departmentId]);

    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    return {
      userId: user.id,
      userName: user.name,
      departmentId: user.department_id,
      departmentName: user.department_name
    };
  }

  /**
   * Create routing rule
   */
  async createRule(firmId: string, userId: string, data: {
    name: string;
    departmentId: string;
    priority?: number;
    conditions: RoutingConditions;
    assignToUserId?: string;
    roundRobin?: boolean;
  }) {
    const result = await pool.query(`
      INSERT INTO routing_rules (
        firm_id, name, department_id, priority, conditions,
        assign_to_user_id, round_robin, active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8)
      RETURNING *
    `, [
      firmId,
      data.name,
      data.departmentId,
      data.priority || 0,
      JSON.stringify(data.conditions),
      data.assignToUserId,
      data.roundRobin || false,
      userId
    ]);

    return result.rows[0];
  }

  /**
   * Get all routing rules
   */
  async getRules(firmId: string) {
    const result = await pool.query(`
      SELECT
        rr.*,
        d.name AS department_name,
        u.first_name || ' ' || u.last_name AS assigned_user_name
      FROM routing_rules rr
      JOIN departments d ON d.id = rr.department_id
      LEFT JOIN users u ON u.id = rr.assign_to_user_id
      WHERE rr.firm_id = $1
      ORDER BY rr.priority DESC, rr.created_at DESC
    `, [firmId]);

    return result.rows;
  }

  /**
   * Update routing rule
   */
  async updateRule(ruleId: string, data: Partial<{
    name: string;
    priority: number;
    conditions: RoutingConditions;
    assignToUserId: string;
    roundRobin: boolean;
    active: boolean;
  }>) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(data.priority);
    }
    if (data.conditions !== undefined) {
      updates.push(`conditions = $${paramIndex++}`);
      values.push(JSON.stringify(data.conditions));
    }
    if (data.assignToUserId !== undefined) {
      updates.push(`assign_to_user_id = $${paramIndex++}`);
      values.push(data.assignToUserId);
    }
    if (data.roundRobin !== undefined) {
      updates.push(`round_robin = $${paramIndex++}`);
      values.push(data.roundRobin);
    }
    if (data.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(data.active);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(ruleId);

    const result = await pool.query(`
      UPDATE routing_rules
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    return result.rows[0];
  }

  /**
   * Delete routing rule
   */
  async deleteRule(ruleId: string) {
    await pool.query('DELETE FROM routing_rules WHERE id = $1', [ruleId]);
  }

  /**
   * Get routing statistics
   */
  async getStats(firmId: string) {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_rules,
        COUNT(CASE WHEN active = true THEN 1 END) as active_rules,
        COUNT(CASE WHEN round_robin = true THEN 1 END) as round_robin_rules,
        (SELECT COUNT(*) FROM routing_round_robin_state WHERE department_id IN (
          SELECT id FROM departments WHERE firm_id = $1
        )) as departments_with_rotation
      FROM routing_rules
      WHERE firm_id = $1
    `, [firmId]);

    return result.rows[0];
  }
}

export default new RoutingService();
