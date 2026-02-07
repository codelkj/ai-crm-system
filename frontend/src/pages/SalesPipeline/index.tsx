/**
 * Sales Pipeline Page
 */

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchKanbanBoard } from '../../store/slices/salesSlice';
import Layout from '../../components/common/Layout';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import KanbanBoard from '../../components/sales/KanbanBoard';
import SalesAIInsights from '../../components/sales/SalesAIInsights';
import DealForm from './DealForm';
import { salesService } from '../../services/sales.service';
import './SalesPipeline.css';

const SalesPipeline: React.FC = () => {
  const dispatch = useAppDispatch();
  const { kanbanBoard, loading } = useAppSelector((state) => state.sales);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchKanbanBoard());
  }, [dispatch]);

  const handleDragEnd = async (dealId: string, newStageId: string) => {
    try {
      await salesService.moveToStage(dealId, newStageId);
      dispatch(fetchKanbanBoard());
    } catch (error) {
      console.error('Failed to move deal:', error);
    }
  };

  const handleSuccess = () => {
    dispatch(fetchKanbanBoard());
    setShowForm(false);
  };

  return (
    <Layout>
      <div className="sales-pipeline-page">
        <div className="page-header">
          <div>
            <h1>Sales Pipeline</h1>
            {kanbanBoard && (
              <div className="pipeline-stats">
                <span className="stat">
                  {kanbanBoard.dealCount} deals
                </span>
                <span className="stat">
                  Total value: ${kanbanBoard.totalValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <Button onClick={() => setShowForm(true)}>Add Deal</Button>
        </div>

        {/* AI Insights */}
        <SalesAIInsights />

        {loading ? (
          <Loading message="Loading pipeline..." />
        ) : kanbanBoard ? (
          <KanbanBoard
            stages={kanbanBoard.stages}
            onDragEnd={handleDragEnd}
          />
        ) : (
          <div className="empty-state">No pipeline data available</div>
        )}

        {showForm && (
          <DealForm
            deal={null}
            onClose={() => setShowForm(false)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default SalesPipeline;
