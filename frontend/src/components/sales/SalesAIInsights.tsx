/**
 * Sales AI Insights Component
 * Displays AI-powered insights about the sales pipeline
 */

import React, { useState, useEffect } from 'react';
import { salesService } from '../../services/sales.service';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

const SalesAIInsights: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await salesService.getPipelineInsights();
      setInsights(data);
    } catch (err: any) {
      console.error('Failed to load sales insights:', err);
      setError(err.response?.data?.error?.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !insights) {
    return (
      <Card title="🤖 AI Sales Insights">
        <Loading message="Analyzing sales pipeline..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="🤖 AI Sales Insights">
        <div style={{ padding: '20px', textAlign: 'center', color: '#e94560' }}>
          {error}
          <div style={{ marginTop: '10px' }}>
            <Button size="small" onClick={loadInsights}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <Card
      title="🤖 AI Sales Insights"
      actions={
        <Button size="small" variant="secondary" onClick={loadInsights} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Summary */}
        {insights.summary && (
          <div
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 500,
              lineHeight: '1.5'
            }}
          >
            {insights.summary}
          </div>
        )}

        {/* Pipeline Stats */}
        {insights.data && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <StatBox
              label="Total Deals"
              value={insights.data.totalDeals}
              color="#2196f3"
            />
            <StatBox
              label="Total Value"
              value={`$${insights.data.totalValue.toLocaleString()}`}
              color="#16c79a"
            />
            <StatBox
              label="Avg Deal Size"
              value={`$${Math.round(insights.data.avgDealSize).toLocaleString()}`}
              color="#ff9800"
            />
            <StatBox
              label="In Closing"
              value={`${insights.data.dealsInClosing} ($${insights.data.closingValue.toLocaleString()})`}
              color="#e91e63"
            />
          </div>
        )}

        {/* Insights */}
        {insights.insights && insights.insights.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#555' }}>
              Key Insights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {insights.insights.map((insight: string, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '14px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#333'
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: '#667eea', flexShrink: 0 }}>
                      {index + 1}.
                    </span>
                    <span>{insight}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#555' }}>
              Recommended Actions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {insights.recommendations.map((rec: string, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 14px',
                    background: '#e8f5e9',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#2e7d32',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>✓</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

interface StatBoxProps {
  label: string;
  value: string | number;
  color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color }) => (
  <div
    style={{
      flex: 1,
      minWidth: '140px',
      padding: '14px',
      background: 'white',
      border: `2px solid ${color}`,
      borderRadius: '10px',
      textAlign: 'center'
    }}
  >
    <div style={{ fontSize: '20px', fontWeight: 700, color, marginBottom: '4px' }}>
      {value}
    </div>
    <div style={{ fontSize: '12px', color: '#666' }}>{label}</div>
  </div>
);

export default SalesAIInsights;
