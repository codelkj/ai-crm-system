/**
 * Cash Flow Projection Service
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CashFlowProjection,
  ProjectionParams,
  TransactionType,
} from '../types/financial.types';
import transactionService from './transaction.service';

interface MonthlyAggregate {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

class ProjectionService {
  private projections: CashFlowProjection[] = [];

  async generate(params?: ProjectionParams): Promise<CashFlowProjection[]> {
    const projectionMonths = params?.months || 6;
    const historicalMonths = params?.historical_months || 3;

    // Get historical transactions
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - historicalMonths);

    const transactions = await transactionService.getAll({
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

    // Aggregate by month
    const monthlyData = this.aggregateByMonth(transactions);

    // Calculate averages and trends
    const avgIncome = this.calculateAverage(
      monthlyData.map((m) => m.income)
    );
    const avgExpenses = this.calculateAverage(
      monthlyData.map((m) => m.expenses)
    );

    const incomeGrowthRate = this.calculateGrowthRate(
      monthlyData.map((m) => m.income)
    );
    const expenseGrowthRate = this.calculateGrowthRate(
      monthlyData.map((m) => m.expenses)
    );

    // Calculate variance for confidence
    const incomeVariance = this.calculateVariance(
      monthlyData.map((m) => m.income)
    );
    const expenseVariance = this.calculateVariance(
      monthlyData.map((m) => m.expenses)
    );

    // Generate projections
    this.projections = [];
    const now = new Date();

    for (let i = 1; i <= projectionMonths; i++) {
      const projectionDate = new Date(now);
      projectionDate.setMonth(projectionDate.getMonth() + i);
      projectionDate.setDate(1);

      // Apply growth rate to projections
      const projectedIncome = avgIncome * Math.pow(1 + incomeGrowthRate, i);
      const projectedExpenses =
        avgExpenses * Math.pow(1 + expenseGrowthRate, i);

      // Calculate confidence based on historical consistency
      const incomeConfidence = this.calculateConfidence(incomeVariance, avgIncome);
      const expenseConfidence = this.calculateConfidence(
        expenseVariance,
        avgExpenses
      );
      const confidence = (incomeConfidence + expenseConfidence) / 2;

      const projection: CashFlowProjection = {
        id: uuidv4(),
        projection_date: projectionDate,
        projected_income: Math.round(projectedIncome * 100) / 100,
        projected_expenses: Math.round(projectedExpenses * 100) / 100,
        net_cash_flow:
          Math.round((projectedIncome - projectedExpenses) * 100) / 100,
        confidence: Math.round(confidence * 100) / 100,
        reasoning: this.generateReasoning(
          i,
          avgIncome,
          avgExpenses,
          incomeGrowthRate,
          expenseGrowthRate,
          historicalMonths
        ),
        created_at: new Date(),
      };

      this.projections.push(projection);
    }

    return this.projections;
  }

  async getAll(): Promise<CashFlowProjection[]> {
    return this.projections;
  }

  private aggregateByMonth(
    transactions: Array<{
      type: TransactionType;
      amount: number;
      transaction_date: Date;
    }>
  ): MonthlyAggregate[] {
    const monthMap = new Map<string, MonthlyAggregate>();

    for (const transaction of transactions) {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          month: monthKey,
          income: 0,
          expenses: 0,
          net: 0,
        });
      }

      const aggregate = monthMap.get(monthKey)!;

      if (transaction.type === 'income') {
        aggregate.income += transaction.amount;
      } else {
        aggregate.expenses += transaction.amount;
      }
      aggregate.net = aggregate.income - aggregate.expenses;
    }

    return Array.from(monthMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;

    // Simple linear growth rate
    let totalGrowth = 0;
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        totalGrowth += (values[i] - values[i - 1]) / values[i - 1];
      }
    }

    return totalGrowth / (values.length - 1);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const avg = this.calculateAverage(values);
    const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
    return this.calculateAverage(squaredDiffs);
  }

  private calculateConfidence(variance: number, average: number): number {
    if (average === 0) return 0.5;

    // Coefficient of variation
    const cv = Math.sqrt(variance) / average;

    // Convert to confidence score (lower variance = higher confidence)
    // cv < 0.1 = very consistent (0.95 confidence)
    // cv > 0.5 = very inconsistent (0.5 confidence)
    const confidence = Math.max(0.5, Math.min(0.95, 1 - cv));

    return confidence;
  }

  private generateReasoning(
    monthsOut: number,
    _avgIncome: number,
    _avgExpenses: number,
    incomeGrowth: number,
    expenseGrowth: number,
    historicalMonths: number
  ): string {
    const growthPercent = Math.round(incomeGrowth * 100);
    const expenseGrowthPercent = Math.round(expenseGrowth * 100);

    let reasoning = `Based on ${historicalMonths}-month historical average. `;

    if (Math.abs(growthPercent) > 1) {
      reasoning += `Income trending ${
        growthPercent > 0 ? 'up' : 'down'
      } by ${Math.abs(growthPercent)}% monthly. `;
    } else {
      reasoning += `Income relatively stable. `;
    }

    if (Math.abs(expenseGrowthPercent) > 1) {
      reasoning += `Expenses trending ${
        expenseGrowthPercent > 0 ? 'up' : 'down'
      } by ${Math.abs(expenseGrowthPercent)}% monthly. `;
    } else {
      reasoning += `Expenses relatively stable. `;
    }

    if (monthsOut > 3) {
      reasoning += `Long-term projection - confidence decreases with time.`;
    }

    return reasoning;
  }
}

export default new ProjectionService();
