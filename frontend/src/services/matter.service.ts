/**
 * Matter Service
 * API client for legal matter management
 */

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/matters';

export interface Matter {
  id: string;
  firm_id: string;
  company_id: string;
  title: string;
  pipeline_type: 'legal';
  lightning_stage_id?: string;
  matter_number: string;
  matter_type?: string;
  department_id?: string;
  lead_director_id?: string;
  budget_hours?: number;
  budget_amount?: number;
  actual_hours: number;
  actual_amount: number;
  burn_rate: number;
  health_status: 'healthy' | 'warning' | 'critical';
  matter_status: 'active' | 'on_hold' | 'closed' | 'archived';
  value?: number;
  opened_date?: string;
  closed_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  client_name?: string;
  department_name?: string;
  lead_director_name?: string;
  stage_name?: string;
  stage_color?: string;
  team_size?: number;
  unbilled_entries_count?: number;
}

export interface CreateMatterDTO {
  company_id: string;
  title: string;
  matter_type?: string;
  department_id?: string;
  lead_director_id?: string;
  budget_hours?: number;
  budget_amount?: number;
  value?: number;
  description?: string;
  opened_date?: string;
}

export interface MatterFilters {
  client_id?: string;
  department_id?: string;
  lead_director_id?: string;
  lightning_stage_id?: string;
  matter_status?: string;
  health_status?: string;
  matter_type?: string;
  page?: number;
  limit?: number;
}

export interface LightningStage {
  id: string;
  firm_id: string;
  name: string;
  color?: string;
  stage_order: number;
  is_closed: boolean;
  closed_status?: 'won' | 'lost' | 'pass';
  description?: string;
  matter_count?: number;
  total_value?: number;
  avg_days_in_stage?: number;
}

export interface MatterAssignment {
  id: string;
  matter_id: string;
  user_id: string;
  role: string;
  assigned_date: string;
  removed_date?: string;
  is_active: boolean;
  user_name?: string;
  user_email?: string;
  job_title?: string;
}

class MatterService {
  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  /**
   * Get authorization headers
   */
  private getHeaders() {
    return {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    };
  }

  // =====================================================
  // MATTER OPERATIONS
  // =====================================================

  /**
   * Get all matters with filters
   */
  async getAll(filters?: MatterFilters) {
    const response = await axios.get(API_URL, {
      ...this.getHeaders(),
      params: filters
    });
    return response.data;
  }

  /**
   * Get matter by ID
   */
  async getById(id: string) {
    const response = await axios.get(`${API_URL}/${id}`, this.getHeaders());
    return response.data;
  }

  /**
   * Create new matter
   */
  async create(data: CreateMatterDTO) {
    const response = await axios.post(API_URL, data, this.getHeaders());
    return response.data;
  }

  /**
   * Update matter
   */
  async update(id: string, data: Partial<Matter>) {
    const response = await axios.put(`${API_URL}/${id}`, data, this.getHeaders());
    return response.data;
  }

  /**
   * Delete matter
   */
  async delete(id: string) {
    const response = await axios.delete(`${API_URL}/${id}`, this.getHeaders());
    return response.data;
  }

  /**
   * Move matter to different stage
   */
  async moveStage(id: string, stageId: string, notes?: string) {
    const response = await axios.post(
      `${API_URL}/${id}/move-stage`,
      { stage_id: stageId, notes },
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Get matter statistics
   */
  async getStats(departmentId?: string) {
    const response = await axios.get(`${API_URL}/stats`, {
      ...this.getHeaders(),
      params: { department_id: departmentId }
    });
    return response.data;
  }

  /**
   * Get matters by department
   */
  async getByDepartment() {
    const response = await axios.get(`${API_URL}/by-department`, this.getHeaders());
    return response.data;
  }

  /**
   * Get team workload
   */
  async getTeamWorkload(userId?: string) {
    const response = await axios.get(`${API_URL}/team-workload`, {
      ...this.getHeaders(),
      params: { user_id: userId }
    });
    return response.data;
  }

  // =====================================================
  // LIGHTNING PATH OPERATIONS
  // =====================================================

  /**
   * Get all Lightning Path stages
   */
  async getStages(includeStats: boolean = false) {
    const response = await axios.get(`${API_URL}/lightning-path/stages`, {
      ...this.getHeaders(),
      params: { include_stats: includeStats }
    });
    return response.data;
  }

  /**
   * Get Lightning Path pipeline statistics
   */
  async getPipelineStats() {
    const response = await axios.get(`${API_URL}/lightning-path/stats`, this.getHeaders());
    return response.data;
  }

  /**
   * Get Kanban board data (matters grouped by stage)
   */
  async getKanbanData() {
    const response = await axios.get(`${API_URL}/lightning-path/kanban`, this.getHeaders());
    return response.data;
  }

  /**
   * Move matter between stages (for Kanban)
   */
  async moveKanban(matterId: string, toStageId: string, notes?: string) {
    const response = await axios.post(
      `${API_URL}/lightning-path/move`,
      { matter_id: matterId, to_stage_id: toStageId, notes },
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Create new stage
   */
  async createStage(data: { name: string; color?: string; stage_order: number; description?: string }) {
    const response = await axios.post(
      `${API_URL}/lightning-path/stages`,
      data,
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Update stage
   */
  async updateStage(id: string, data: Partial<LightningStage>) {
    const response = await axios.put(
      `${API_URL}/lightning-path/stages/${id}`,
      data,
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Delete stage
   */
  async deleteStage(id: string) {
    const response = await axios.delete(
      `${API_URL}/lightning-path/stages/${id}`,
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Reorder stages
   */
  async reorderStages(stageOrders: Array<{ id: string; stage_order: number }>) {
    const response = await axios.post(
      `${API_URL}/lightning-path/stages/reorder`,
      { stage_orders: stageOrders },
      this.getHeaders()
    );
    return response.data;
  }

  // =====================================================
  // MATTER ASSIGNMENT OPERATIONS
  // =====================================================

  /**
   * Get assignments for a matter
   */
  async getAssignmentsByMatter(matterId: string, activeOnly: boolean = true) {
    const response = await axios.get(
      `${API_URL}/matter-assignments/matter/${matterId}`,
      {
        ...this.getHeaders(),
        params: { active_only: activeOnly }
      }
    );
    return response.data;
  }

  /**
   * Get assignments for a user
   */
  async getAssignmentsByUser(userId: string, activeOnly: boolean = true) {
    const response = await axios.get(
      `${API_URL}/matter-assignments/user/${userId}`,
      {
        ...this.getHeaders(),
        params: { active_only: activeOnly }
      }
    );
    return response.data;
  }

  /**
   * Assign user to matter
   */
  async assignUser(matterId: string, userId: string, role: string) {
    const response = await axios.post(
      `${API_URL}/matter-assignments`,
      { matter_id: matterId, user_id: userId, role },
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Bulk assign team to matter
   */
  async bulkAssignTeam(matterId: string, assignments: Array<{ user_id: string; role: string }>) {
    const response = await axios.post(
      `${API_URL}/matter-assignments/bulk`,
      { matter_id: matterId, assignments },
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Remove user from matter
   */
  async removeAssignment(assignmentId: string) {
    const response = await axios.delete(
      `${API_URL}/matter-assignments/${assignmentId}`,
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Transfer matter from one user to another
   */
  async transferMatter(matterId: string, fromUserId: string, toUserId: string) {
    const response = await axios.post(
      `${API_URL}/matter-assignments/transfer`,
      { matter_id: matterId, from_user_id: fromUserId, to_user_id: toUserId },
      this.getHeaders()
    );
    return response.data;
  }

  /**
   * Get team statistics
   */
  async getTeamStats() {
    const response = await axios.get(
      `${API_URL}/matter-assignments/team-stats`,
      this.getHeaders()
    );
    return response.data;
  }
}

export const matterService = new MatterService();
