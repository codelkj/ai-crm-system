/**
 * Cash Flow Projection Controller
 */

import { Request, Response } from 'express';
import projectionService from '../services/projection.service';
import { ProjectionParams } from '../types/financial.types';

class ProjectionController {
  async generate(req: Request, res: Response): Promise<void> {
    try {
      const params: ProjectionParams = {
        months: req.body.months
          ? parseInt(req.body.months)
          : req.query.months
          ? parseInt(req.query.months as string)
          : 6,
        historical_months: req.body.historical_months
          ? parseInt(req.body.historical_months)
          : req.query.historical_months
          ? parseInt(req.query.historical_months as string)
          : 3,
      };

      const projections = await projectionService.generate(params);

      // Calculate summary
      const summary = {
        total_projected_income: projections.reduce(
          (sum, p) => sum + p.projected_income,
          0
        ),
        total_projected_expenses: projections.reduce(
          (sum, p) => sum + p.projected_expenses,
          0
        ),
        total_net_cash_flow: projections.reduce(
          (sum, p) => sum + p.net_cash_flow,
          0
        ),
        average_confidence:
          projections.reduce((sum, p) => sum + p.confidence, 0) /
          projections.length,
      };

      res.json({
        success: true,
        data: projections,
        count: projections.length,
        summary,
        params,
        message: 'Cash flow projections generated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate projections',
      });
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const projections = await projectionService.getAll();

      if (projections.length === 0) {
        res.json({
          success: true,
          data: [],
          count: 0,
          message:
            'No projections available. Generate projections using POST /projections/generate',
        });
        return;
      }

      res.json({
        success: true,
        data: projections,
        count: projections.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch projections',
      });
    }
  }
}

export default new ProjectionController();
