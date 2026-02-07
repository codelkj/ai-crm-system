/**
 * Projection Service
 * Generates cash flow projections based on historical transaction data with seasonal pattern detection
 */

import { database as pool } from '../../../config';
import { getOpenAIClient } from '../../../config/ai';

interface MonthlyData {
  month: number;
  year: number;
  income: number;
  expenses: number;
  transaction_count: number;
}

interface SeasonalPattern {
  month: string;
  avg_income: number;
  avg_expenses: number;
  avg_balance: number;
  pattern_strength: number;
  year_over_year_growth?: number;
}

export class ProjectionService {
  /**
   * Detect seasonal patterns in historical transaction data
   */
  static async detectSeasonalPatterns() {
    // Get historical data grouped by month
    const result = await pool.query(
      `SELECT
        EXTRACT(MONTH FROM date) as month,
        EXTRACT(YEAR FROM date) as year,
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as expenses,
        COUNT(*) as transaction_count
       FROM transactions
       WHERE date >= CURRENT_DATE - INTERVAL '24 months'
       GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
       ORDER BY year, month`
    );

    if (result.rows.length === 0) {
      return {
        has_patterns: false,
        patterns: [],
        insights: ['Not enough historical data to detect seasonal patterns. Upload more transactions.'],
      };
    }

    // Group by month to calculate averages
    const monthlyAverages = new Map<number, { income: number[], expenses: number[], count: number }>();

    result.rows.forEach((row: any) => {
      const month = parseInt(row.month);
      if (!monthlyAverages.has(month)) {
        monthlyAverages.set(month, { income: [], expenses: [], count: 0 });
      }
      const data = monthlyAverages.get(month)!;
      data.income.push(parseFloat(row.income));
      data.expenses.push(parseFloat(row.expenses));
      data.count++;
    });

    // Calculate statistics for each month
    const patterns: SeasonalPattern[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let month = 1; month <= 12; month++) {
      const data = monthlyAverages.get(month);
      if (!data) continue;

      const avgIncome = data.income.reduce((a, b) => a + b, 0) / data.count;
      const avgExpenses = data.expenses.reduce((a, b) => a + b, 0) / data.count;

      // Calculate standard deviation to measure pattern strength
      const incomeVariance = data.income.reduce((sum, val) => sum + Math.pow(val - avgIncome, 2), 0) / data.count;
      const expenseVariance = data.expenses.reduce((sum, val) => sum + Math.pow(val - avgExpenses, 2), 0) / data.count;
      const avgVariance = (incomeVariance + expenseVariance) / 2;

      // Lower variance = stronger pattern (inverse relationship)
      const patternStrength = Math.max(0, 100 - (Math.sqrt(avgVariance) / avgIncome * 100));

      // Calculate year-over-year growth if we have multiple years
      let yoyGrowth = undefined;
      if (data.count >= 2) {
        const firstYear = data.income[0] + data.expenses[0];
        const lastYear = data.income[data.count - 1] + data.expenses[data.count - 1];
        yoyGrowth = ((lastYear - firstYear) / firstYear) * 100;
      }

      patterns.push({
        month: monthNames[month - 1],
        avg_income: Math.round(avgIncome),
        avg_expenses: Math.round(avgExpenses),
        avg_balance: Math.round(avgIncome - avgExpenses),
        pattern_strength: Math.round(patternStrength),
        year_over_year_growth: yoyGrowth ? Math.round(yoyGrowth * 10) / 10 : undefined,
      });
    }

    // Generate AI insights about seasonal patterns
    const insights = await this.generateSeasonalInsights(patterns, result.rows);

    return {
      has_patterns: patterns.length > 0,
      patterns,
      insights,
      metadata: {
        data_points: result.rows.length,
        months_analyzed: patterns.length,
        historical_period_months: 24,
      },
    };
  }

  /**
   * Generate AI insights about seasonal patterns
   */
  private static async generateSeasonalInsights(patterns: SeasonalPattern[], historicalData: any[]): Promise<string[]> {
    try {
      const openai = getOpenAIClient();
      if (!openai) {
        return this.generateFallbackInsights(patterns);
      }

      const prompt = `Analyze these seasonal spending patterns and provide 3-4 key actionable insights:

${patterns.map(p => `${p.month}: Income $${p.avg_income.toLocaleString()}, Expenses $${p.avg_expenses.toLocaleString()}, Balance $${p.avg_balance.toLocaleString()}, Pattern Strength: ${p.pattern_strength}%${p.year_over_year_growth ? `, YoY Growth: ${p.year_over_year_growth}%` : ''}`).join('\n')}

Focus on:
1. Which months have highest/lowest expenses or income
2. Seasonal trends or patterns
3. Opportunities for budget optimization
4. Risk periods to watch out for

Return ONLY a JSON array of 3-4 short insight strings (max 100 chars each).`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst specializing in seasonal pattern detection. Provide concise, actionable insights in JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content || '[]';
      const insights = JSON.parse(content);

      return Array.isArray(insights) ? insights : this.generateFallbackInsights(patterns);
    } catch (error) {
      console.error('Error generating seasonal insights:', error);
      return this.generateFallbackInsights(patterns);
    }
  }

  /**
   * Generate fallback insights when AI is unavailable
   */
  private static generateFallbackInsights(patterns: SeasonalPattern[]): string[] {
    const insights: string[] = [];

    // Find highest expense month
    const highestExpense = patterns.reduce((max, p) => p.avg_expenses > max.avg_expenses ? p : max, patterns[0]);
    insights.push(`${highestExpense.month} typically has highest expenses ($${highestExpense.avg_expenses.toLocaleString()})`);

    // Find lowest expense month
    const lowestExpense = patterns.reduce((min, p) => p.avg_expenses < min.avg_expenses ? p : min, patterns[0]);
    insights.push(`${lowestExpense.month} typically has lowest expenses ($${lowestExpense.avg_expenses.toLocaleString()})`);

    // Find best balance month
    const bestBalance = patterns.reduce((max, p) => p.avg_balance > max.avg_balance ? p : max, patterns[0]);
    if (bestBalance.avg_balance > 0) {
      insights.push(`${bestBalance.month} shows strongest positive cash flow (+$${bestBalance.avg_balance.toLocaleString()})`);
    }

    return insights;
  }

  /**
   * Generate cash flow projection with seasonal adjustments
   */
  static async generateProjection(months: number = 6) {
    // Get transactions from the last 12 months for better seasonal accuracy
    const result = await pool.query(
      `SELECT
        EXTRACT(MONTH FROM date) as month,
        type,
        category_id,
        AVG(amount) as avg_amount,
        COUNT(*) as transaction_count
       FROM transactions
       WHERE date >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY EXTRACT(MONTH FROM date), type, category_id`
    );

    // Get seasonal patterns
    const seasonalData = await this.detectSeasonalPatterns();

    // Calculate average monthly income and expenses
    let avgMonthlyIncome = 0;
    let avgMonthlyExpenses = 0;

    result.rows.forEach((row) => {
      const monthlyAvg = parseFloat(row.avg_amount);
      if (row.type === 'credit') {
        avgMonthlyIncome += monthlyAvg;
      } else {
        avgMonthlyExpenses += monthlyAvg;
      }
    });

    // Get current balance (sum of all transactions)
    const balanceResult = await pool.query(
      `SELECT
        SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) as current_balance
       FROM transactions`
    );

    let currentBalance = parseFloat(balanceResult.rows[0]?.current_balance || '0');

    // Generate projections with seasonal adjustments
    const projectionData = [];
    const currentDate = new Date();

    for (let i = 1; i <= months; i++) {
      const projectionDate = new Date(currentDate);
      projectionDate.setMonth(projectionDate.getMonth() + i);

      const monthName = projectionDate.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const monthIndex = projectionDate.getMonth();

      // Apply seasonal adjustment if available
      let seasonalFactor = 1.0;
      if (seasonalData.has_patterns && seasonalData.patterns.length > monthIndex) {
        const pattern = seasonalData.patterns[monthIndex];
        const avgTotal = (pattern.avg_income + pattern.avg_expenses) / 2;
        const overallAvg = (avgMonthlyIncome + avgMonthlyExpenses) / 2;
        if (overallAvg > 0) {
          seasonalFactor = avgTotal / overallAvg;
        }
      }

      // Add some random variance (±5%) for realism, reduced from ±10%
      const variance = 0.95 + Math.random() * 0.1;
      const projectedIncome = Math.round(avgMonthlyIncome * seasonalFactor * variance);
      const projectedExpenses = Math.round(avgMonthlyExpenses * seasonalFactor * variance);

      currentBalance = currentBalance + projectedIncome - projectedExpenses;

      projectionData.push({
        month: monthName,
        projected_balance: Math.round(currentBalance),
        projected_income: projectedIncome,
        projected_expenses: projectedExpenses,
        seasonal_adjustment: Math.round((seasonalFactor - 1) * 100),
      });
    }

    return {
      projection_data: projectionData,
      start_date: currentDate.toISOString(),
      end_date: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + months,
        1
      ).toISOString(),
      seasonal_patterns: seasonalData,
      metadata: {
        months,
        avg_monthly_income: Math.round(avgMonthlyIncome),
        avg_monthly_expenses: Math.round(avgMonthlyExpenses),
        historical_period_days: 365,
        uses_seasonal_adjustment: seasonalData.has_patterns,
      },
    };
  }

  /**
   * Get all saved projections
   */
  static async getAll() {
    // For now, we'll just generate a new projection
    // In a full implementation, you'd save and retrieve projections from the database
    return [];
  }
}
