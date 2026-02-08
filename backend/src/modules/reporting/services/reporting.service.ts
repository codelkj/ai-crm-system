/**
 * LegalNexus Reporting Service
 * Fee earner rankings, practice analytics, workload tracking
 */

import pool from '../../../config/database';

interface FeeEarnerRanking {
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

interface PracticeAreaAnalytics {
  department_id: string;
  department_name: string;
  total_revenue: number;
  total_hours: number;
  matters_count: number;
  avg_matter_value: number;
  utilization_rate: number;
}

interface WorkloadMetrics {
  user_id: string;
  name: string;
  total_hours_logged: number;
  available_hours: number;
  utilization_percentage: number;
  capacity_status: 'green' | 'amber' | 'red';
  matters_assigned: number;
}

interface BillingInertia {
  user_id: string;
  name: string;
  unbilled_hours: number;
  unbilled_amount: number;
  oldest_unbilled_date: string;
  days_overdue: number;
  inertia_score: number;
}

class ReportingService {
  /**
   * Get Fee Earner Rankings
   */
  async getFeeEarnerRankings(firmId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const periodDays = period === 'month' ? 30 : period === 'quarter' ? 90 : 365;

    const query = `
      WITH revenue_data AS (
        SELECT
          u.id as user_id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          u.email,
          COALESCE(u.role, 'Attorney') as role,
          COALESCE(u.job_title, 'Attorney') as department,
          ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0), 2) as total_revenue,
          ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as total_hours,
          ROUND(u.hourly_rate, 2) as billable_rate,
          COUNT(DISTINCT te.matter_id) as matters_count
        FROM users u
        LEFT JOIN time_entries te ON u.id = te.user_id
          AND te.created_at >= NOW() - INTERVAL '${periodDays} days'
          AND te.billable = true
        WHERE u.firm_id = $1
          AND u.is_attorney = true
        GROUP BY u.id, u.first_name, u.last_name, u.email, u.role, u.job_title, u.hourly_rate
      )
      SELECT
        *,
        RANK() OVER (ORDER BY total_revenue DESC) as rank
      FROM revenue_data
      ORDER BY total_revenue DESC;
    `;

    const result = await pool.query(query, [firmId]);
    return result.rows as FeeEarnerRanking[];
  }

  /**
   * Get Practice Area Analytics
   */
  async getPracticeAreaAnalytics(firmId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const periodDays = period === 'month' ? 30 : period === 'quarter' ? 90 : 365;

    const query = `
      SELECT
        COALESCE(u.job_title, 'General Practice') as department_name,
        COALESCE(u.job_title, 'General Practice') as department_id,
        ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0), 2) as total_revenue,
        ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as total_hours,
        COUNT(DISTINCT te.matter_id) as matters_count,
        ROUND(CASE
          WHEN COUNT(DISTINCT te.matter_id) > 0
          THEN COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0) / COUNT(DISTINCT te.matter_id)
          ELSE 0
        END, 2) as avg_matter_value,
        ROUND(CASE
          WHEN COUNT(DISTINCT u.id) > 0
          THEN (COALESCE(SUM(te.duration_minutes / 60.0), 0) / COUNT(DISTINCT u.id)) / 160.0 * 100
          ELSE 0
        END, 2) as utilization_rate
      FROM users u
      LEFT JOIN time_entries te ON u.id = te.user_id
        AND te.created_at >= NOW() - INTERVAL '${periodDays} days'
        AND te.billable = true
      WHERE u.firm_id = $1
        AND u.is_attorney = true
      GROUP BY u.job_title
      ORDER BY total_revenue DESC;
    `;

    const result = await pool.query(query, [firmId]);
    return result.rows as PracticeAreaAnalytics[];
  }

  /**
   * Get 50-Seat Load Index (Resource Utilization)
   */
  async getWorkloadMetrics(firmId: string) {
    // Assume 160 hours per month available per attorney
    const monthlyAvailableHours = 160;

    const query = `
      WITH monthly_hours AS (
        SELECT
          u.id as user_id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as total_hours_logged,
          COUNT(DISTINCT te.matter_id) as matters_assigned
        FROM users u
        LEFT JOIN time_entries te ON u.id = te.user_id
          AND te.entry_date >= DATE_TRUNC('month', CURRENT_DATE)
        WHERE u.firm_id = $1
          AND u.is_attorney = true
        GROUP BY u.id, u.first_name, u.last_name
      )
      SELECT
        user_id,
        name,
        total_hours_logged,
        $2::numeric as available_hours,
        ROUND((total_hours_logged / $2::numeric) * 100, 2) as utilization_percentage,
        CASE
          WHEN (total_hours_logged / $2::numeric) * 100 >= 95 THEN 'red'
          WHEN (total_hours_logged / $2::numeric) * 100 >= 80 THEN 'amber'
          ELSE 'green'
        END as capacity_status,
        matters_assigned
      FROM monthly_hours
      ORDER BY utilization_percentage DESC;
    `;

    const result = await pool.query(query, [firmId, monthlyAvailableHours]);
    return result.rows as WorkloadMetrics[];
  }

  /**
   * Detect Billing Inertia (Unbilled Time)
   */
  async getBillingInertia(firmId: string) {
    const query = `
      SELECT
        u.id as user_id,
        CONCAT(u.first_name, ' ', u.last_name) as name,
        COUNT(te.id) as unbilled_entries,
        ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as unbilled_hours,
        ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0), 2) as unbilled_amount,
        MIN(te.entry_date)::text as oldest_unbilled_date,
        EXTRACT(DAY FROM NOW() - MIN(te.entry_date))::integer as days_overdue,
        CASE
          WHEN EXTRACT(DAY FROM NOW() - MIN(te.entry_date)) >= 60 THEN 100
          WHEN EXTRACT(DAY FROM NOW() - MIN(te.entry_date)) >= 30 THEN 75
          WHEN EXTRACT(DAY FROM NOW() - MIN(te.entry_date)) >= 14 THEN 50
          ELSE 25
        END as inertia_score
      FROM users u
      INNER JOIN time_entries te ON u.id = te.user_id
      WHERE u.firm_id = $1
        AND te.billable = true
        AND te.billed = false
      GROUP BY u.id, u.first_name, u.last_name
      HAVING EXTRACT(DAY FROM NOW() - MIN(te.entry_date)) >= 14
      ORDER BY inertia_score DESC, unbilled_amount DESC;
    `;

    const result = await pool.query(query, [firmId]);
    return result.rows as BillingInertia[];
  }

  /**
   * Get Practice Velocity (Burn Rate)
   */
  async getPracticeVelocity(firmId: string, matterId?: string) {
    const query = `
      SELECT
        m.id as matter_id,
        m.matter_number,
        m.title,
        m.budget_hours,
        ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as actual_hours,
        m.value as estimated_revenue,
        ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0), 2) as actual_cost,
        CASE
          WHEN m.budget_hours > 0
          THEN ROUND((COALESCE(SUM(te.duration_minutes / 60.0), 0) / m.budget_hours) * 100, 2)
          ELSE 0
        END as burn_rate,
        CASE
          WHEN COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0) > 0
          THEN m.value - COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0)
          ELSE m.value
        END as projected_profit,
        CASE
          WHEN COALESCE(SUM(te.duration_minutes / 60.0), 0) / NULLIF(m.budget_hours, 0) >= 0.95 THEN 'red'
          WHEN COALESCE(SUM(te.duration_minutes / 60.0), 0) / NULLIF(m.budget_hours, 0) >= 0.80 THEN 'amber'
          ELSE 'green'
        END as health_status
      FROM deals m
      LEFT JOIN time_entries te ON m.id = te.matter_id
      LEFT JOIN users u ON te.user_id = u.id
      WHERE m.firm_id = $1
        ${matterId ? 'AND m.id = $2' : ''}
      GROUP BY m.id, m.matter_number, m.title, m.budget_hours, m.value
      ORDER BY burn_rate DESC;
    `;

    const params = matterId ? [firmId, matterId] : [firmId];
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Get Executive Summary (Soul Logic)
   */
  async getExecutiveSummary(firmId: string, period: 'month' | 'quarter' | 'year' = 'month') {
    const [feeEarners, practiceAreas, workload, inertia] = await Promise.all([
      this.getFeeEarnerRankings(firmId, period),
      this.getPracticeAreaAnalytics(firmId, period),
      this.getWorkloadMetrics(firmId),
      this.getBillingInertia(firmId)
    ]);

    const totalRevenue = feeEarners.reduce((sum, fe) => sum + parseFloat(fe.total_revenue || 0), 0);
    const totalHours = feeEarners.reduce((sum, fe) => sum + parseFloat(fe.total_hours || 0), 0);
    const avgUtilization = workload.length > 0 ? workload.reduce((sum, w) => sum + parseFloat(w.utilization_percentage || 0), 0) / workload.length : 0;
    const unbilledRevenue = inertia.reduce((sum, i) => sum + parseFloat(i.unbilled_amount || 0), 0);

    // Soul Logic: Energy Drains
    const energyDrains = [];
    if (inertia.length > 5) {
      energyDrains.push({
        type: 'billing_inertia',
        severity: 'high',
        message: `${inertia.length} attorneys have unbilled time. R${unbilledRevenue.toLocaleString()} at risk.`
      });
    }
    if (avgUtilization < 60) {
      energyDrains.push({
        type: 'low_utilization',
        severity: 'medium',
        message: `Average utilization at ${avgUtilization.toFixed(1)}%. Capacity underutilized.`
      });
    }

    const overworked = workload.filter(w => w.capacity_status === 'red');
    if (overworked.length > 0) {
      energyDrains.push({
        type: 'overwork_risk',
        severity: 'high',
        message: `${overworked.length} attorneys at >95% capacity. Burnout risk.`
      });
    }

    return {
      summary: {
        total_revenue: totalRevenue,
        total_hours: totalHours,
        avg_utilization: avgUtilization,
        unbilled_revenue: unbilledRevenue,
        active_attorneys: feeEarners.length,
        practice_areas: practiceAreas.length
      },
      top_earners: feeEarners.slice(0, 5),
      energy_drains: energyDrains,
      soul_logic_score: Math.max(0, 100 - (energyDrains.length * 15))
    };
  }
}

export default new ReportingService();
