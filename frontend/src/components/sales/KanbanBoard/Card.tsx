/**
 * Deal Card Component for Kanban Board
 */

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Deal } from '../../../services/sales.service';
import './Card.css';
import { format } from 'date-fns';

interface DealCardProps {
  deal: Deal;
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`deal-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="deal-title">{deal.title}</div>

      {deal.company && (
        <div className="deal-company">{deal.company.name}</div>
      )}

      {deal.description && (
        <div className="deal-description">{deal.description}</div>
      )}

      <div className="deal-footer">
        <div className="deal-value">${Number(deal.value).toLocaleString()}</div>
        {deal.probability && (
          <div className="deal-probability">{deal.probability}%</div>
        )}
      </div>

      {deal.expected_close_date && (
        <div className="deal-date">
          Close: {format(new Date(deal.expected_close_date), 'MMM dd, yyyy')}
        </div>
      )}
    </div>
  );
};

export default DealCard;
