/**
 * Cash Flow Projection Chart Component
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { financialService } from '../../services/financial.service';

const ProjectionChart: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [months, setMonths] = useState(6);
  const [metadata, setMetadata] = useState<any>(null);
  const [usesSeasonal, setUsesSeasonal] = useState(false);

  useEffect(() => {
    generateProjection();
  }, [months]);

  const generateProjection = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await financialService.generateProjection({ months });
      const projectionData = response.projection_data;

      // Format data for recharts
      const formattedData = projectionData.map((item: any) => ({
        month: item.month,
        projected: item.projected_balance,
        income: item.projected_income,
        expenses: item.projected_expenses,
        seasonal_adj: item.seasonal_adjustment || 0,
      }));

      setChartData(formattedData);
      setMetadata(response.metadata);
      setUsesSeasonal(response.metadata?.uses_seasonal_adjustment || false);
    } catch (err: any) {
      console.error('Projection error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to generate projection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>Cash Flow Projection</span>
          {usesSeasonal && (
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
              title="Projections include seasonal spending pattern adjustments"
            >
              🔮 AI Seasonal
            </span>
          )}
        </div>
      }
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <select
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value={3}>3 Months</option>
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
          </select>
          <Button size="small" onClick={generateProjection}>
            Refresh
          </Button>
        </div>
      }
    >
      {loading ? (
        <Loading message="Generating projection..." />
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#e94560' }}>
          {error}
        </div>
      ) : chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#0f3460"
                strokeWidth={2}
                name="Projected Balance"
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#16c79a"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#e94560"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>

          {metadata && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#666',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <strong>Based on:</strong> {metadata.historical_period_days} days of history
              </div>
              <div>
                <strong>Avg Monthly Income:</strong> ${metadata.avg_monthly_income?.toLocaleString() || 0}
              </div>
              <div>
                <strong>Avg Monthly Expenses:</strong> ${metadata.avg_monthly_expenses?.toLocaleString() || 0}
              </div>
              {metadata.uses_seasonal_adjustment && (
                <div style={{ color: '#667eea', fontWeight: 600 }}>
                  ✨ Seasonal patterns detected
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          No projection data available. Generate a projection to see the chart.
        </div>
      )}
    </Card>
  );
};

export default ProjectionChart;
