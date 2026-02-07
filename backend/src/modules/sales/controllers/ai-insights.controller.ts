/**
 * Sales AI Insights Controller
 */

import { Request, Response, NextFunction } from 'express';
import { SalesAIInsightsService } from '../services/ai-insights.service';
import { asyncHandler } from '../../../shared/utils/async-handler';

export class SalesAIInsightsController {
  /**
   * GET /api/v1/sales/ai-insights/pipeline
   * Get AI insights about sales pipeline
   */
  static analyzePipeline = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as any).user.id;

      const insights = await SalesAIInsightsService.analyzePipeline(userId);

      res.status(200).json({
        data: insights
      });
    }
  );

  /**
   * GET /api/v1/sales/ai-insights/deal/:dealId/probability
   * Predict deal close probability
   */
  static predictDealProbability = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { dealId } = req.params;
      const userId = (req as any).user.id;

      const prediction = await SalesAIInsightsService.predictDealCloseProbability(dealId, userId);

      res.status(200).json({
        data: prediction
      });
    }
  );
}
