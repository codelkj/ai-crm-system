/**
 * LegalNexus Reporting Service
 */

import api from './api';

export interface FeeEarnerRanking {
  user_id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  total_revenue: number;
  total_hours: number;
  billable_rate: number;
  matters_count: number;
  rank: number;
}

export interface PracticeAreaAnalytics {
  department_id: string;
  department_name: string;
  total_revenue: number;
  total_hours: number;
  matters_count: number;
  avg_matter_value: number;
  utilization_rate: number;
}

export interface WorkloadMetrics {
  user_id: string;
  name: string;
  total_hours_logged: number;
  available_hours: number;
  utilization_percentage: number;
  capacity_status: 'green' | 'amber' | 'red';
  matters_assigned: number;
}

export interface BillingInertia {
  user_id: string;
  name: string;
  unbilled_hours: number;
  unbilled_amount: number;
  oldest_unbilled_date: string;
  days_overdue: number;
  inertia_score: number;
}

export interface ExecutiveSummary {
  summary: {
    total_revenue: number;
    total_hours: number;
    avg_utilization: number;
    unbilled_revenue: number;
    active_attorneys: number;
    practice_areas: number;
  };
  top_earners: FeeEarnerRanking[];
  energy_drains: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  soul_logic_score: number;
}

class ReportingService {
  async getFeeEarnerRankings(period: 'month' | 'quarter' | 'year' = 'month') {
    const response = await api.get(`/reporting/fee-earners?period=${period}`);
    return response.data;
  }

  async getPracticeAreaAnalytics(period: 'month' | 'quarter' | 'year' = 'month') {
    const response = await api.get(`/reporting/practice-areas?period=${period}`);
    return response.data;
  }

  async getWorkloadMetrics() {
    const response = await api.get('/reporting/workload');
    return response.data;
  }

  async getBillingInertia() {
    const response = await api.get('/reporting/billing-inertia');
    return response.data;
  }

  async getPracticeVelocity(matterId?: string) {
    const url = matterId
      ? `/reporting/practice-velocity?matter_id=${matterId}`
      : '/reporting/practice-velocity';
    const response = await api.get(url);
    return response.data;
  }

  async getExecutiveSummary(period: 'month' | 'quarter' | 'year' = 'month') {
    const response = await api.get(`/reporting/executive-summary?period=${period}`);
    return response.data;
  }
}

export default new ReportingService();
