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
      }));

      setChartData(formattedData);
    } catch (err: any) {
      console.error('Projection error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to generate projection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Cash Flow Projection"
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
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          No projection data available. Generate a projection to see the chart.
        </div>
      )}
    </Card>
  );
};

export default ProjectionChart;
