/**
 * Kanban Board Component for Sales Pipeline
 */

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { PipelineStage, Deal } from '../../../services/sales.service';
import KanbanColumn from './Column';
import DealCard from './Card';
import './KanbanBoard.css';

interface KanbanBoardProps {
  stages: PipelineStage[];
  onDragEnd: (dealId: string, newStageId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ stages, onDragEnd }) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeDeal, setActiveDeal] = React.useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);

    // Find the deal being dragged
    for (const stage of stages) {
      const deal = stage.deals?.find((d) => d.id === event.active.id);
      if (deal) {
        setActiveDeal(deal);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const dealId = active.id as string;
      const newStageId = over.id as string;
      onDragEnd(dealId, newStageId);
    }

    setActiveId(null);
    setActiveDeal(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {stages.map((stage) => (
          <KanbanColumn key={stage.id} stage={stage} />
        ))}
      </div>

      <DragOverlay>
        {activeId && activeDeal ? (
          <div style={{ opacity: 0.8 }}>
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
