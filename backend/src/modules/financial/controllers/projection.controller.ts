/**
 * Projection Controller
 * Handles cash flow projection generation
 */

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../../shared/middleware/error-handler';
import { ProjectionService } from '../services/projection.service';

export class ProjectionController {
  /**
   * Generate cash flow projection
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
