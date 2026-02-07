/**
 * Projection Controller
 * Handles cash flow projection generation and seasonal pattern detection
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../../shared/middleware/error-handler';
import { ProjectionService } from '../services/projection.service';

export class ProjectionController {
  /**
   * Generate cash flow projection with seasonal adjustments
   */
  static generateProjection = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const months = parseInt(req.body.months as string) || 6;

      const projection = await ProjectionService.generateProjection(months);

      res.status(200).json({
        data: projection,
      });
    }
  );

  /**
   * Detect seasonal patterns in transaction data
   */
  static detectSeasonalPatterns = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const patterns = await ProjectionService.detectSeasonalPatterns();

      res.status(200).json({
        data: patterns,
      });
    }
  );

  /**
   * Get all projections
   */
  static getAll = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const projections = await ProjectionService.getAll();

      res.status(200).json({
        data: projections,
      });
    }
  );
}
