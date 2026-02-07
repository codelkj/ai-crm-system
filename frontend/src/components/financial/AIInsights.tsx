/**
 * AI Insights Component
 * Displays AI categorization statistics and spending insights
 */

import React from 'react';
import Card from '../common/Card';
import { Transaction, Category } from '../../services/financial.service';

interface AIInsightsProps {
  transactions: Transaction[];
  categories: Category[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ transactions, categories }) => {
  // Calculate AI statistics
  const aiCategorized = transactions.filter((t) => t.ai_confidence && t.ai_confidence > 0);
  const manualCategorized = transactions.filter((t) => !t.ai_confidence && t.category_id);
  const uncategorized = transactions.filter((t) => !t.category_id);

  const avgConfidence =
    aiCategorized.length > 0
      ? aiCategorized.reduce((sum, t) => sum + (t.ai_confidence || 0), 0) / aiCategorized.length
      : 0;

  const highConfidence = aiCategorized.filter((t) => (t.ai_confidence || 0) >= 0.9).length;
  const mediumConfidence = aiCategorized.filter(
    (t) => (t.ai_confidence || 0) >= 0.8 && (t.ai_confidence || 0) < 0.9
  ).length;
  const lowConfidence = aiCategorized.filter((t) => (t.ai_confidence || 0) < 0.8).length;

  // Top spending categories
  const categorySpending: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'debit' && t.category_id)
    .forEach((t) => {
      const categoryName = categories.find((c) => c.id === t.category_id)?.name || 'Unknown';
      categorySpending[categoryName] = (categorySpending[categoryName] || 0) + t.amount;
    });

  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <Card title="🤖 AI Insights">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Categorization Stats */}
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#555' }}>
            Categorization Status
          </h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatCard
              label="AI Categorized"
              value={aiCategorized.length}
              percentage={(aiCategorized.length / transactions.length) * 100}
              color="#2196f3"
              icon="🤖"
            />
            <StatCard
              label="Manual"
              value={manualCategorized.length}
              percentage={(manualCategorized.length / transactions.length) * 100}
              color="#ff9800"
              icon="✏️"
            />
            <StatCard
              label="Uncategorized"
              value={uncategorized.length}
              percentage={(uncategorized.length / transactions.length) * 100}
              color="#f44336"
              icon="❓"
            />
          </div>
        </div>

        {/* AI Confidence Breakdown */}
        {aiCategorized.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#555' }}>
              AI Confidence Distribution
            </h4>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '8px',
                height: '32px',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  flex: highConfidence,
                  background: '#4caf50',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
                title={`High confidence (≥90%): ${highConfidence} transactions`}
              >
                {highConfidence > 0 && highConfidence}
              </div>
              <div
                style={{
                  flex: mediumConfidence,
                  background: '#ff9800',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
                title={`Medium confidence (80-90%): ${mediumConfidence} transactions`}
              >
                {mediumConfidence > 0 && mediumConfidence}
              </div>
              <div
                style={{
                  flex: lowConfidence,
                  background: '#f44336',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
                title={`Low confidence (<80%): ${lowConfidence} transactions`}
              >
                {lowConfidence > 0 && lowConfidence}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              Average AI Confidence: <strong>{(avgConfidence * 100).toFixed(1)}%</strong>
            </div>
          </div>
        )}

        {/* Top Spending Categories */}
        {topCategories.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#555' }}>
              Top Spending Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topCategories.map(([category, amount]) => (
                <div
                  key={category}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: '13px', color: '#555' }}>{category}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#e94560' }}>
                    ${amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, percentage, color, icon }) => (
  <div
    style={{
      flex: 1,
      minWidth: '150px',
      padding: '16px',
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: '12px',
    }}
  >
    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
    <div style={{ fontSize: '24px', fontWeight: 700, color: color, marginBottom: '4px' }}>
      {value}
    </div>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>{label}</div>
    <div style={{ fontSize: '12px', fontWeight: 600, color: color }}>{percentage.toFixed(1)}%</div>
  </div>
);

export default AIInsights;
