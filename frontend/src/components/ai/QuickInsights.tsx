/**
 * Quick Insights Component
 * Displays AI-generated insights based on context
 */

import React, { useState, useEffect } from 'react';
import { aiAssistantService } from '../../services/ai-assistant.service';
import Card from '../common/Card';
import Button from '../common/Button';
import Loading from '../common/Loading';

interface QuickInsightsProps {
  context?: 'sales' | 'financial' | 'crm';
  title?: string;
}

const QuickInsights: React.FC<QuickInsightsProps> = ({
  context = 'crm',
  title = '🤖 AI Insights'
}) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, [context]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiAssistantService.getQuickInsights(context);
      setInsights(response.insights);
    } catch (err: any) {
      console.error('Failed to load insights:', err);
      setError(err.response?.data?.error?.message || 'Failed to load insights');
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={title}
      actions={
        <Button
          size="small"
          variant="secondary"
          onClick={loadInsights}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      }
    >
      {loading ? (
        <Loading message="Generating insights..." />
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#e94560' }}>
          {error}
          <div style={{ marginTop: '10px' }}>
            <Button size="small" onClick={loadInsights}>
              Try Again
            </Button>
          </div>
        </div>
      ) : insights.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {insights.map((insight, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                borderLeft: '4px solid #667eea',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333'
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{
                  fontWeight: 700,
                  color: '#667eea',
                  fontSize: '16px',
                  flexShrink: 0
                }}>
                  {index + 1}.
                </span>
                <span>{insight}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          No insights available. Click refresh to generate insights.
        </div>
      )}
    </Card>
  );
};

export default QuickInsights;
