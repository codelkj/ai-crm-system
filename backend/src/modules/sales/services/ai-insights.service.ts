/**
 * Sales AI Insights Service
 * Provides AI-powered insights and predictions for sales pipeline
 */

import { pool } from '../../../config/database';
import { getOpenAIClient } from '../../../config/ai';

export class SalesAIInsightsService {
  /**
   * Analyze sales pipeline and provide insights
   */
  static async analyzePipeline(userId: string): Promise<any> {
    const openai = getOpenAIClient();

    // Gather pipeline data
    const pipelineData = await this.gatherPipelineData(userId);

    if (!openai) {
      return {
        insights: [
          `You have ${pipelineData.totalDeals} deals worth $${pipelineData.totalValue.toLocaleString()}`,
          `${pipelineData.dealsInClosing} deals in closing stage worth $${pipelineData.closingValue.toLocaleString()}`,
          `Average deal size: $${pipelineData.avgDealSize.toLocaleString()}`
        ],
        summary: 'AI insights unavailable - OpenAI API key not configured',
        predictions: []
      };
    }

    try {
      const prompt = `Analyze this sales pipeline data and provide actionable insights:

Total Deals: ${pipelineData.totalDeals}
Total Value: $${pipelineData.totalValue.toLocaleString()}
Deals by Stage: ${JSON.stringify(pipelineData.dealsByStage)}
Average Deal Size: $${pipelineData.avgDealSize.toLocaleString()}
Deals in Closing: ${pipelineData.dealsInClosing} ($${pipelineData.closingValue.toLocaleString()})
Recent Activity: ${pipelineData.recentActivity}

Provide:
1. Three specific, actionable insights (2-3 sentences each)
2. A brief summary of pipeline health (1 sentence)
3. Top 3 recommended actions`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a sales intelligence expert. Provide clear, actionable insights for sales teams.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      const response = completion.choices[0].message.content || '';

      // Parse response sections
      const sections = this.parseAIResponse(response);

      return {
        insights: sections.insights,
        summary: sections.summary,
        recommendations: sections.recommendations,
        data: pipelineData,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return {
        insights: ['Unable to generate AI insights at this time.'],
        summary: 'AI analysis unavailable',
        recommendations: [],
        data: pipelineData,
        error: error.message
      };
    }
  }

  /**
   * Predict deal close probability using AI
   */
  static async predictDealCloseProbability(dealId: string, userId: string): Promise<any> {
    const openai = getOpenAIClient();

    // Get deal details
    const dealResult = await pool.query(
      `SELECT d.*, ps.name as stage_name, ps.order as stage_order, ps.probability,
              c.name as company_name,
              (SELECT COUNT(*) FROM activities WHERE entity_type = 'deal' AND entity_id = d.id) as activity_count
       FROM deals d
       LEFT JOIN pipeline_stages ps ON d.stage_id = ps.id
       LEFT JOIN companies c ON d.company_id = c.id
       WHERE d.id = $1 AND d.created_by = $2`,
      [dealId, userId]
    );

    if (dealResult.rows.length === 0) {
      throw new Error('Deal not found');
    }

    const deal = dealResult.rows[0];

    // Calculate deal age in days
    const dealAge = Math.floor(
      (new Date().getTime() - new Date(deal.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get average deal close time
    const avgCloseTimeResult = await pool.query(
      `SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/86400) as avg_days
       FROM deals
       WHERE created_by = $1 AND stage_id IN (
         SELECT id FROM pipeline_stages WHERE name ILIKE '%won%' OR name ILIKE '%closed%'
       )`,
      [userId]
    );

    const avgCloseTime = avgCloseTimeResult.rows[0]?.avg_days || 30;

    if (!openai) {
      // Fallback: Simple rule-based prediction
      const stageProbability = deal.probability || 0.5;
      const ageFactor = dealAge > avgCloseTime ? 0.8 : 1.0;
      const activityFactor = deal.activity_count > 3 ? 1.1 : deal.activity_count > 0 ? 1.0 : 0.9;

      const probability = Math.min(0.95, stageProbability * ageFactor * activityFactor);

      return {
        dealId,
        probability: Math.round(probability * 100) / 100,
        confidence: 0.6,
        factors: [
          `Deal stage: ${deal.stage_name} (${Math.round(stageProbability * 100)}% base probability)`,
          `Deal age: ${dealAge} days (avg close time: ${Math.round(avgCloseTime)} days)`,
          `Activity level: ${deal.activity_count} activities recorded`
        ],
        recommendation: probability > 0.7
          ? 'High probability - prioritize closing activities'
          : probability > 0.4
            ? 'Medium probability - increase engagement'
            : 'Low probability - reassess fit or strategy'
      };
    }

    try {
      const prompt = `Predict the probability that this sales deal will close successfully:

Deal Details:
- Value: $${Number(deal.value).toLocaleString()}
- Stage: ${deal.stage_name} (${Math.round((deal.probability || 0.5) * 100)}% typical probability)
- Age: ${dealAge} days (average close time: ${Math.round(avgCloseTime)} days)
- Company: ${deal.company_name}
- Activities: ${deal.activity_count} interactions recorded
- Expected Close: ${deal.expected_close_date || 'Not set'}

Provide:
1. Probability score (0-1)
2. Confidence level (0-1)
3. Three key factors affecting probability
4. One recommended action`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a sales forecasting expert. Analyze deal data and predict close probability with reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 400
      });

      const response = completion.choices[0].message.content || '';

      // Parse AI response
      const probabilityMatch = response.match(/probability[:\s]+([0-9.]+)/i);
      const confidenceMatch = response.match(/confidence[:\s]+([0-9.]+)/i);

      const probability = probabilityMatch ? parseFloat(probabilityMatch[1]) : deal.probability || 0.5;
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;

      // Extract factors and recommendations
      const lines = response.split('\n').filter(l => l.trim());
      const factors = lines.filter(l => /^[0-9-•]/.test(l.trim())).slice(0, 3);
      const recommendation = lines.find(l => l.toLowerCase().includes('recommend')) || 'Continue engagement';

      return {
        dealId,
        probability: Math.round(probability * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        factors: factors.length > 0 ? factors : [response.substring(0, 200)],
        recommendation,
        aiAnalysis: response,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      return {
        dealId,
        probability: deal.probability || 0.5,
        confidence: 0.5,
        factors: ['AI prediction unavailable'],
        recommendation: 'Continue standard sales process',
        error: error.message
      };
    }
  }

  /**
   * Gather pipeline data for analysis
   */
  private static async gatherPipelineData(userId: string): Promise<any> {
    // Get deals summary
    const dealsResult = await pool.query(
      `SELECT
        COUNT(*) as total_deals,
        COALESCE(SUM(value), 0) as total_value,
        COALESCE(AVG(value), 0) as avg_value
       FROM deals
       WHERE created_by = $1`,
      [userId]
    );

    // Get deals by stage
    const stagesResult = await pool.query(
      `SELECT ps.name, COUNT(d.id) as count, COALESCE(SUM(d.value), 0) as value
       FROM pipeline_stages ps
       LEFT JOIN deals d ON d.stage_id = ps.id AND d.created_by = $1
       GROUP BY ps.name
       ORDER BY ps.order`,
      [userId]
    );

    // Get closing stage deals
    const closingResult = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as value
       FROM deals d
       JOIN pipeline_stages ps ON d.stage_id = ps.id
       WHERE d.created_by = $1
       AND (ps.name ILIKE '%closing%' OR ps.name ILIKE '%negotiation%' OR ps.probability >= 0.7)`,
      [userId]
    );

    // Get recent activity
    const activityResult = await pool.query(
      `SELECT COUNT(*) as count
       FROM activities
       WHERE created_by = $1
       AND entity_type = 'deal'
       AND created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [userId]
    );

    const deals = dealsResult.rows[0] || { total_deals: 0, total_value: 0, avg_value: 0 };
    const closing = closingResult.rows[0] || { count: 0, value: 0 };

    return {
      totalDeals: parseInt(deals.total_deals),
      totalValue: parseFloat(deals.total_value),
      avgDealSize: parseFloat(deals.avg_value),
      dealsByStage: stagesResult.rows.map(s => ({
        stage: s.name,
        count: parseInt(s.count),
        value: parseFloat(s.value)
      })),
      dealsInClosing: parseInt(closing.count),
      closingValue: parseFloat(closing.value),
      recentActivity: `${activityResult.rows[0]?.count || 0} activities in last 7 days`
    };
  }

  /**
   * Parse AI response into structured sections
   */
  private static parseAIResponse(response: string): any {
    const lines = response.split('\n').filter(l => l.trim());

    // Extract insights (numbered points)
    const insights = lines
      .filter(l => /^[0-9][\.\)]/.test(l.trim()))
      .map(l => l.replace(/^[0-9][\.\)]\s*/, '').trim())
      .slice(0, 3);

    // Extract summary (look for "summary" keyword or first non-numbered line)
    const summaryLine = lines.find(l => l.toLowerCase().includes('summary')) ||
      lines.find(l => !l.match(/^[0-9-•]/));
    const summary = summaryLine
      ? summaryLine.replace(/summary[:\s]*/i, '').trim()
      : 'Pipeline analysis complete';

    // Extract recommendations (lines with "recommend" or after "actions")
    const recommendIndex = lines.findIndex(l =>
      l.toLowerCase().includes('recommend') ||
      l.toLowerCase().includes('action')
    );
    const recommendations = recommendIndex >= 0
      ? lines.slice(recommendIndex + 1)
        .filter(l => /^[0-9-•]/.test(l.trim()))
        .map(l => l.replace(/^[0-9-•]\s*/, '').trim())
        .slice(0, 3)
      : [];

    return {
      insights: insights.length > 0 ? insights : [response.substring(0, 200)],
      summary,
      recommendations: recommendations.length > 0 ? recommendations : ['Continue current sales activities']
    };
  }
}
