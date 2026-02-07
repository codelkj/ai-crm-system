/**
 * AI Assistant Controller
 * Handles chat interactions with AI assistant
 */

import { Request, Response, NextFunction } from 'express';
import { AssistantService } from '../services/assistant.service';
import { asyncHandler } from '../../../shared/utils/async-handler';

export class AssistantController {
  /**
   * POST /api/v1/ai-assistant/chat
   * Send message to AI assistant and get response
   */
  static chat = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { message, conversation_history } = req.body;
      const userId = (req as any).user.id;

      const response = await AssistantService.chat(userId, message, conversation_history || []);

      res.status(200).json({
        data: response
      });
    }
  );

  /**
   * POST /api/v1/ai-assistant/quick-insights
   * Get quick AI insights about user's data
   */
  static getQuickInsights = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as any).user.id;
      const { context } = req.body; // e.g., 'sales', 'financial', 'crm'

      const insights = await AssistantService.getQuickInsights(userId, context);

      res.status(200).json({
        data: insights
      });
    }
  );
}
