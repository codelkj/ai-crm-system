/**
 * AI Assistant Service
 * Handles communication with AI assistant backend
 */

import api from './api';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  suggestions: string[];
  timestamp: string;
}

export interface QuickInsightsResponse {
  insights: string[];
  context: string;
  timestamp: string;
}

export const aiAssistantService = {
  /**
   * Send message to AI assistant
   */
  chat: async (message: string, conversationHistory: Message[]): Promise<ChatResponse> => {
    const response = await api.post('/ai-assistant/chat', {
      message,
      conversation_history: conversationHistory
    });
    return response.data.data;
  },

  /**
   * Get quick insights
   */
  getQuickInsights: async (context?: 'sales' | 'financial' | 'crm'): Promise<QuickInsightsResponse> => {
    const response = await api.post('/ai-assistant/quick-insights', {
      context
    });
    return response.data.data;
  }
};
