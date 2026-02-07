/**
 * AI Assistant Routes
 */

import { Router } from 'express';
import { AssistantController } from '../controllers/assistant.controller';
import { body } from 'express-validator';
import { authenticate } from '../../../shared/middleware/authenticate';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * POST /api/v1/ai-assistant/chat
 * Send message to AI assistant
 */
router.post(
  '/chat',
  [
    body('message').notEmpty().withMessage('Message is required'),
    body('conversation_history').optional().isArray()
  ],
  AssistantController.chat
);

/**
 * POST /api/v1/ai-assistant/quick-insights
 * Get quick AI insights
 */
router.post(
  '/quick-insights',
  [
    body('context').optional().isIn(['sales', 'financial', 'crm'])
  ],
  AssistantController.getQuickInsights
);

export default router;
