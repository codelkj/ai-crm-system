/**
 * AI Assistant Service
 * Provides intelligent assistance using OpenAI with CRM data context
 */

import pool from '../../../config/database';
import { getOpenAIClient } from '../../../config/ai';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class AssistantService {
  /**
   * Chat with AI assistant
   */
  static async chat(userId: string, userMessage: string, conversationHistory: Message[]): Promise<any> {
    const openai = getOpenAIClient();

    if (!openai) {
      return {
        response: "I'm currently unavailable. Please check that the OpenAI API key is configured.",
        suggestions: []
      };
    }

    // Gather context about user's data
    const context = await this.gatherUserContext(userId);

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context);

    // Prepare messages for OpenAI
    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 500
      });

      const assistantResponse = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';

      // Generate follow-up suggestions
      const suggestions = this.generateSuggestions(userMessage, context);

      return {
        response: assistantResponse,
        suggestions,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return {
        response: "I'm having trouble processing your request. Please try again.",
        suggestions: [],
        error: error.message
      };
    }
  }

  /**
   * Get quick AI insights
   */
  static async getQuickInsights(userId: string, context: string): Promise<any> {
    const openai = getOpenAIClient();

    if (!openai) {
      return {
        insights: ["AI insights are currently unavailable. Please configure OpenAI API key."]
      };
    }

    const userData = await this.gatherUserContext(userId);

    let prompt = '';
    if (context === 'sales') {
      prompt = `Based on this sales data: ${userData.dealsSummary}, provide 3 brief actionable insights (2-3 sentences each) about the sales pipeline.`;
    } else if (context === 'financial') {
      prompt = `Based on this financial data: ${userData.transactionsSummary}, provide 3 brief actionable insights (2-3 sentences each) about spending and cash flow.`;
    } else {
      prompt = `Based on this CRM data: ${userData.companiesSummary}, ${userData.contactsSummary}, provide 3 brief actionable insights (2-3 sentences each).`;
    }

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence assistant. Provide clear, actionable insights in a numbered list format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      });

      const response = completion.choices[0].message.content || '';

      // Parse insights from response
      const insights = response
        .split('\n')
        .filter(line => line.trim().match(/^\d+[\.\)]/))
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim());

      return {
        insights: insights.length > 0 ? insights : [response],
        context,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return {
        insights: ["Unable to generate insights at this time."],
        error: error.message
      };
    }
  }

  /**
   * Gather context about user's data
   */
  private static async gatherUserContext(userId: string): Promise<any> {
    try {
      // Get companies summary
      const companiesResult = await pool.query(
        `SELECT COUNT(*) as total
         FROM companies`
      );

      // Get contacts summary
      const contactsResult = await pool.query(
        `SELECT COUNT(*) as total FROM contacts`
      );

      // Get deals summary
      const dealsResult = await pool.query(
        `SELECT COUNT(*) as total,
                COALESCE(SUM(value), 0) as total_value,
                ps.name as stage
         FROM deals d
         LEFT JOIN pipeline_stages ps ON d.stage_id = ps.id
         GROUP BY ps.name`
      );

      // Get recent transactions
      const transactionsResult = await pool.query(
        `SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as total_expenses
         FROM transactions t
         WHERE t.date >= CURRENT_DATE - INTERVAL '30 days'`
      );

      // Get activities
      const activitiesResult = await pool.query(
        `SELECT COUNT(*) as total, type
         FROM activities
         WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
         GROUP BY type`
      );

      const companies = companiesResult.rows[0] || { total: 0 };
      const contacts = contactsResult.rows[0] || { total: 0 };
      const transactions = transactionsResult.rows[0] || { total: 0, total_income: 0, total_expenses: 0 };
      const deals = dealsResult.rows;
      const activities = activitiesResult.rows;

      return {
        companiesSummary: `${companies.total} companies`,
        contactsSummary: `${contacts.total} contacts`,
        dealsSummary: deals.length > 0
          ? deals.map(d => `${d.total} deals in ${d.stage} worth $${Number(d.total_value).toLocaleString()}`).join(', ')
          : '0 deals',
        transactionsSummary: `${transactions.total} transactions in last 30 days: $${Number(transactions.total_income).toLocaleString()} income, $${Number(transactions.total_expenses).toLocaleString()} expenses`,
        activitiesSummary: activities.length > 0
          ? activities.map(a => `${a.total} ${a.type} activities`).join(', ')
          : 'No recent activities'
      };
    } catch (error) {
      console.error('Error gathering context:', error);
      return {
        companiesSummary: 'N/A',
        contactsSummary: 'N/A',
        dealsSummary: 'N/A',
        transactionsSummary: 'N/A',
        activitiesSummary: 'N/A'
      };
    }
  }

  /**
   * Build system prompt with user context
   */
  private static buildSystemPrompt(context: any): string {
    return `You are an intelligent business assistant for a CRM and financial management system.

Current user's data summary:
- Companies: ${context.companiesSummary}
- Contacts: ${context.contactsSummary}
- Deals: ${context.dealsSummary}
- Transactions: ${context.transactionsSummary}
- Recent Activities: ${context.activitiesSummary}

Your role:
- Answer questions about the user's CRM data, sales pipeline, and financial transactions
- Provide insights and recommendations based on their data
- Help with tasks like finding top customers, analyzing spending, forecasting revenue
- Be concise, friendly, and actionable in your responses
- If data is not available, acknowledge it and suggest what the user can do

Guidelines:
- Keep responses under 100 words when possible
- Use bullet points for lists
- Include specific numbers from the data when relevant
- Suggest next actions when appropriate`;
  }

  /**
   * Generate follow-up suggestions based on conversation
   */
  private static generateSuggestions(userMessage: string, context: any): string[] {
    const suggestions: string[] = [];

    // Context-aware suggestions
    if (userMessage.toLowerCase().includes('revenue') || userMessage.toLowerCase().includes('sales')) {
      suggestions.push('Show me top performing deals');
      suggestions.push('What\'s my sales forecast?');
    } else if (userMessage.toLowerCase().includes('expense') || userMessage.toLowerCase().includes('spending')) {
      suggestions.push('Which category am I spending most on?');
      suggestions.push('Show my cash flow trends');
    } else if (userMessage.toLowerCase().includes('customer') || userMessage.toLowerCase().includes('contact')) {
      suggestions.push('Who are my most engaged customers?');
      suggestions.push('Show recent customer activities');
    } else {
      // Default suggestions
      suggestions.push('Show me key metrics');
      suggestions.push('What should I focus on today?');
      suggestions.push('Analyze my spending patterns');
    }

    return suggestions.slice(0, 3);
  }
}
