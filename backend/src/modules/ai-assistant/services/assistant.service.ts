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
   * Gather context about user's data (LegalNexus)
   */
  private static async gatherUserContext(userId: string): Promise<any> {
    try {
      // Get user's firm_id
      const userResult = await pool.query('SELECT firm_id FROM users WHERE id = $1', [userId]);
      const firmId = userResult.rows[0]?.firm_id;

      if (!firmId) {
        throw new Error('User firm not found');
      }

      // Get matters summary
      const mattersResult = await pool.query(
        `SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE health_status = 'red') as critical,
          ROUND(AVG(CAST(burn_rate AS NUMERIC)), 2) as avg_burn_rate
         FROM deals
         WHERE firm_id = $1 AND matter_status = 'active'`,
        [firmId]
      );

      // Get billing inertia (unbilled time) - aggregate and top offenders
      const inertiaResult = await pool.query(
        `SELECT
          COUNT(DISTINCT user_id) as attorneys_with_unbilled,
          ROUND(SUM(duration_minutes / 60.0), 2) as total_unbilled_hours,
          ROUND(SUM(amount), 2) as total_unbilled_amount
         FROM time_entries
         WHERE firm_id = $1 AND billable = true AND billed = false`,
        [firmId]
      );

      // Get top 5 attorneys with oldest unbilled time
      const topInertiaResult = await pool.query(
        `SELECT
          u.id as user_id,
          CONCAT(u.first_name, ' ', u.last_name) as name,
          ROUND(COALESCE(SUM(te.duration_minutes / 60.0), 0), 2) as unbilled_hours,
          ROUND(COALESCE(SUM((te.duration_minutes / 60.0) * u.hourly_rate), 0), 2) as unbilled_amount,
          MIN(te.entry_date)::text as oldest_unbilled_date,
          EXTRACT(DAY FROM NOW() - MIN(te.entry_date))::integer as days_overdue
        FROM users u
        INNER JOIN time_entries te ON u.id = te.user_id
        WHERE u.firm_id = $1
          AND te.billable = true
          AND te.billed = false
        GROUP BY u.id, u.first_name, u.last_name, u.hourly_rate
        HAVING EXTRACT(DAY FROM NOW() - MIN(te.entry_date)) >= 14
        ORDER BY MIN(te.entry_date) ASC
        LIMIT 5`,
        [firmId]
      );

      // Get attorney workload (current month)
      const workloadResult = await pool.query(
        `SELECT
          COUNT(*) as total_attorneys,
          ROUND(AVG(hours), 2) as avg_hours_logged
         FROM (
           SELECT u.id, SUM(te.duration_minutes / 60.0) as hours
           FROM users u
           LEFT JOIN time_entries te ON u.id = te.user_id
             AND te.entry_date >= DATE_TRUNC('month', CURRENT_DATE)
           WHERE u.firm_id = $1 AND u.is_attorney = true
           GROUP BY u.id
         ) attorney_hours`,
        [firmId]
      );

      // Get revenue summary (last 30 days)
      const revenueResult = await pool.query(
        `SELECT
          ROUND(SUM(te.amount), 2) as total_revenue,
          ROUND(SUM(te.duration_minutes / 60.0), 2) as total_hours
         FROM time_entries te
         WHERE te.firm_id = $1
           AND te.billable = true
           AND te.entry_date >= CURRENT_DATE - INTERVAL '30 days'`,
        [firmId]
      );

      const matters = mattersResult.rows[0] || { total: 0, critical: 0, avg_burn_rate: 0 };
      const inertia = inertiaResult.rows[0] || { attorneys_with_unbilled: 0, total_unbilled_hours: 0, total_unbilled_amount: 0 };
      const workload = workloadResult.rows[0] || { total_attorneys: 0, avg_hours_logged: 0 };
      const revenue = revenueResult.rows[0] || { total_revenue: 0, total_hours: 0 };
      const topInertia = topInertiaResult.rows || [];

      // Format top inertia attorneys for context
      const inertiaDetails = topInertia.length > 0
        ? topInertia.map(a => `${a.name}: ${a.unbilled_hours}hrs (R${Number(a.unbilled_amount).toLocaleString()}), oldest entry ${a.days_overdue} days ago`).join('; ')
        : 'No overdue unbilled time';

      return {
        mattersSummary: `${matters.total} active matters (${matters.critical} critical), ${matters.avg_burn_rate}% avg burn rate`,
        inertiaSummary: `${inertia.attorneys_with_unbilled} attorneys with unbilled time: ${inertia.total_unbilled_hours} hours (R${Number(inertia.total_unbilled_amount || 0).toLocaleString()} at risk)`,
        inertiaDetails: `Top attorneys with oldest unbilled time: ${inertiaDetails}`,
        workloadSummary: `${workload.total_attorneys} attorneys, averaging ${workload.avg_hours_logged} hours logged this month`,
        revenueSummary: `Last 30 days: R${Number(revenue.total_revenue || 0).toLocaleString()} revenue from ${revenue.total_hours} billable hours`,
        firmId
      };
    } catch (error) {
      console.error('Error gathering context:', error);
      return {
        mattersSummary: 'Data unavailable',
        inertiaSummary: 'Data unavailable',
        workloadSummary: 'Data unavailable',
        revenueSummary: 'Data unavailable'
      };
    }
  }

  /**
   * Build system prompt with user context
   */
  private static buildSystemPrompt(context: any): string {
    return `You are Nexus, an AI-powered legal practice intelligence system for law firms.

Current firm's data summary:
- Matters: ${context.mattersSummary}
- Billing Inertia: ${context.inertiaSummary}
- Billing Inertia Details: ${context.inertiaDetails}
- Attorney Workload: ${context.workloadSummary}
- Revenue: ${context.revenueSummary}

Your role:
- Analyze matter health, burn rates, and budget utilization
- Identify billing inertia and revenue at risk from unbilled time
- Monitor attorney capacity and workload distribution
- Provide data-driven insights on practice performance
- Recommend actions to improve matter profitability and attorney utilization

Guidelines:
- Keep responses under 100 words when possible
- Use bullet points for lists
- Include specific metrics and numbers from the data
- Focus on actionable recommendations with measurable impact
- Be professional and data-driven in all responses`;
  }

  /**
   * Generate follow-up suggestions based on conversation
   */
  private static generateSuggestions(userMessage: string, context: any): string[] {
    const suggestions: string[] = [];

    // Context-aware suggestions
    if (userMessage.toLowerCase().includes('matter') || userMessage.toLowerCase().includes('burn')) {
      suggestions.push('Which matters are at critical burn rate?');
      suggestions.push('Show matter health summary');
    } else if (userMessage.toLowerCase().includes('billing') || userMessage.toLowerCase().includes('unbilled')) {
      suggestions.push('Analyze billing inertia and revenue at risk');
      suggestions.push('Who has the oldest unbilled time?');
    } else if (userMessage.toLowerCase().includes('attorney') || userMessage.toLowerCase().includes('workload')) {
      suggestions.push('Show attorney utilization and capacity');
      suggestions.push('Which attorneys are overworked?');
    } else if (userMessage.toLowerCase().includes('revenue') || userMessage.toLowerCase().includes('performance')) {
      suggestions.push('Show top fee earners this month');
      suggestions.push('Analyze practice area performance');
    } else {
      // Default suggestions
      suggestions.push('Analyze billing inertia and unbilled time');
      suggestions.push('Review matter health and burn rates');
      suggestions.push('Show attorney workload distribution');
    }

    return suggestions.slice(0, 3);
  }
}
