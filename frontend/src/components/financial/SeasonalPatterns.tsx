/**
 * Seasonal Patterns Component
 * Displays AI-detected seasonal spending and income patterns
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { financialService } from '../../services/financial.service';
import './SeasonalPatterns.css';

interface SeasonalPattern {
  month: string;
  avg_income: number;
  avg_expenses: number;
  avg_balance: number;
  pattern_strength: number;
  year_over_year_growth?: number;
}

interface SeasonalData {
  has_patterns: boolean;
  patterns: SeasonalPattern[];
  insights: string[];
  metadata: {
    data_points: number;
    months_analyzed: number;
    historical_period_months: number;
  };
}

const SeasonalPatterns: React.FC = () => {
  const [data, setData] = useState<SeasonalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'balance' | 'income-expense'>('balance');

  useEffect(() => {
    loadPatterns();
  }, []);

  const loadPatterns = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await financialService.getSeasonalPatterns();
      setData(response);
    } catch (err: any) {
      console.error('Seasonal patterns error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to load seasonal patterns');
    } finally {
      setLoading(false);
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return '#16c79a';
    if (balance < 0) return '#e94560';
    return '#999';
  };

  const getPatternStrengthLabel = (strength: number) => {
    if (strength >= 80) return 'Very Strong';
    if (strength >= 60) return 'Strong';
    if (strength >= 40) return 'Moderate';
    return 'Weak';
  };

  const renderChart = () => {
    if (!data || !data.has_patterns) return null;

    const chartData = data.patterns.map((p) => ({
      ...p,
      balance: p.avg_balance,
    }));

    if (viewMode === 'balance') {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{ background: '#fff', border: '1px solid #ddd' }}
            />
            <Legend />
            <Bar dataKey="balance" name="Average Balance" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBalanceColor(entry.balance)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ background: '#fff', border: '1px solid #ddd' }}
          />
          <Legend />
          <Bar dataKey="avg_income" name="Average Income" fill="#16c79a" radius={[8, 8, 0, 0]} />
          <Bar dataKey="avg_expenses" name="Average Expenses" fill="#e94560" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card
      title="🔮 Seasonal Spending Patterns"
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="balance">Balance View</option>
            <option value="income-expense">Income vs Expenses</option>
          </select>
          <Button size="small" onClick={loadPatterns}>
            Refresh
          </Button>
        </div>
      }
    >
      {loading ? (
        <Loading message="Analyzing seasonal patterns..." />
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#e94560' }}>
          {error}
        </div>
      ) : !data || !data.has_patterns ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>Not enough historical data to detect seasonal patterns.</p>
          <p style={{ fontSize: '14px', marginTop: '10px' }}>
            Upload more transactions (at least 12 months) to see seasonal insights.
          </p>
        </div>
      ) : (
        <div className="seasonal-patterns-container">
          {/* AI Insights */}
          {data.insights && data.insights.length > 0 && (
            <div className="insights-section">
              <h4 style={{ marginBottom: '12px', color: '#0f3460', fontSize: '14px', fontWeight: 600 }}>
                💡 AI Insights
              </h4>
              <div className="insights-grid">
                {data.insights.map((insight, idx) => (
                  <div key={idx} className="insight-card">
                    <span className="insight-icon">✨</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart */}
          <div style={{ marginTop: '24px' }}>
            {renderChart()}
          </div>

          {/* Pattern Strength Indicators */}
          <div className="pattern-strength-section">
            <h4 style={{ marginBottom: '12px', color: '#0f3460', fontSize: '14px', fontWeight: 600 }}>
              📊 Pattern Reliability
            </h4>
            <div className="pattern-grid">
              {data.patterns.slice(0, 4).map((pattern) => (
                <div key={pattern.month} className="pattern-card">
                  <div className="pattern-month">{pattern.month}</div>
                  <div className="pattern-strength">
                    <div className="strength-bar">
                      <div
                        className="strength-fill"
                        style={{
                          width: `${pattern.pattern_strength}%`,
                          backgroundColor:
                            pattern.pattern_strength >= 60
                              ? '#16c79a'
                              : pattern.pattern_strength >= 40
                              ? '#f39c12'
                              : '#e94560',
                        }}
                      />
                    </div>
                    <span className="strength-label">
                      {getPatternStrengthLabel(pattern.pattern_strength)}
                    </span>
                  </div>
                  {pattern.year_over_year_growth !== undefined && (
                    <div className="yoy-growth">
                      {pattern.year_over_year_growth > 0 ? '↑' : '↓'} {Math.abs(pattern.year_over_year_growth)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          {data.metadata && (
            <div className="metadata-section">
              <small style={{ color: '#999' }}>
                Analyzed {data.metadata.data_points} data points across {data.metadata.months_analyzed} months
              </small>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SeasonalPatterns;
