/**
 * Kanban Column Component
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PipelineStage } from '../../../services/sales.service';
import DealCard from './Card';
import './Column.css';

interface KanbanColumnProps {
  stage: PipelineStage;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ stage }) => {
  const { setNodeRef } = useDroppable({
    id: stage.id,
  });

  const deals = stage.deals || [];
  const dealIds = deals.map((deal) => deal.id);
  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);

  return (
    <div className="kanban-column">
      <div className="column-header" style={{ borderTopColor: stage.color || '#0f3460' }}>
        <div className="column-title">{stage.name}</div>
        <div className="column-stats">
          <span className="deal-count">{deals.length} deals</span>
          <span className="total-value">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      <div ref={setNodeRef} className="column-content">
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="empty-column">Drop deals here</div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
