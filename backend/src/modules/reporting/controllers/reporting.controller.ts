/**
 * LegalNexus Reporting Controller
 */

import { Request, Response } from 'express';
import reportingService from '../services/reporting.service';

class ReportingController {
  /**
   * Get Fee Earner Rankings
   * GET /api/v1/reporting/fee-earners
   */
  async getFeeEarnerRankings(req: Request, res: Response) {
    try {
      const firmId = req.user?.firm_id;
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      if (!firmId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const rankings = await reportingService.getFeeEarnerRankings(firmId, period);

      res.json({
        success: true,
        data: rankings,
        meta: {
          period,
          total_attorneys: rankings.length,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Fee earner rankings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate fee earner rankings'
      });
    }
  }

  /**
   * Get Practice Area Analytics
   * GET /api/v1/reporting/practice-areas
   */
  async getPracticeAreaAnalytics(req: Request, res: Response) {
    try {
      const firmId = req.user?.firm_id;
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      if (!firmId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const analytics = await reportingService.getPracticeAreaAnalytics(firmId, period);

      res.json({
        success: true,
        data: analytics,
        meta: {
          period,
          total_departments: analytics.length,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Practice area analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate practice area analytics'
      });
    }
  }

  /**
   * Get 50-Seat Load Index
   * GET /api/v1/reporting/workload
   */
  async getWorkloadMetrics(req: Request, res: Response) {
    try {
      const firmId = req.user?.firm_id;

      if (!firmId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const metrics = await reportingService.getWorkloadMetrics(firmId);

      const summary = {
        total_attorneys: metrics.length,
        green: metrics.filter(m => m.capacity_status === 'green').length,
        amber: metrics.filter(m => m.capacity_status === 'amber').length,
        red: metrics.filter(m => m.capacity_status === 'red').length,
        avg_utilization: metrics.length > 0 ? metrics.reduce((sum, m) => sum + m.utilization_percentage, 0) / metrics.length : 0
      };

      res.json({
        success: true,
        data: metrics,
        summary,
        meta: {
          generated_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Workload metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate workload metrics'
      });
    }
  }

  /**
   * Get Billing Inertia
   * GET /api/v1/reporting/billing-inertia
   */
  async getBillingInertia(req: Request, res: Response) {
    try {
      const firmId = req.user?.firm_id;

      if (!firmId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const inertia = await reportingService.getBillingInertia(firmId);

      const summary = {
        total_attorneys_affected: inertia.length,
        total_unbilled_hours: inertia.reduce((sum, i) => sum + i.unbilled_hours, 0),
        total_unbilled_amount: inertia.reduce((sum, i) => sum + i.unbilled_amount, 0),
        high_risk: inertia.filter(i => i.inertia_score >= 75).length
      };

      res.json({
        success: true,
        data: inertia,
        summary,
        meta: {
          generated_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Billing inertia error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to detect billing inertia'
      });
    }
  }

  /**
   * Get Practice Velocity
   * GET /api/v1/reporting/practice-velocity
   */
  async getPracticeVelocity(req: Request, res: Response) {
    try {
      const firmId = req.user?.firm_id;
      const matterId = req.query.matter_id as string | undefined;

      if (!firmId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const velocity = await reportingService.getPracticeVelocity(firmId, matterId);

      res.json({
        success: true,
        data: velocity,
        meta: {
          generated_at: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Practice velocity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate practice velocity'
      });
    }
  }

  /**
   * Get Executive Summary (Soul Logic)
   * GET /api/v1/reporting/executive-summary?period=month|quarter|year
   */
  async getExecutiveSummary(req: Request, res: Response) {
    try {
      const firmId = req.user?.firm_id;
      const period = (req.query.period as 'month' | 'quarter' | 'year') || 'month';

      if (!firmId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const summary = await reportingService.getExecutiveSummary(firmId, period);

      res.json({
        success: true,
        data: summary,
        meta: {
          period,
          generated_at: new Date().toISOString(),
          soul_logic_enabled: true
        }
      });
    } catch (error: any) {
      console.error('Executive summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate executive summary'
      });
    }
  }
}

export default new ReportingController();
