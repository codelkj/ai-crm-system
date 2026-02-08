/**
 * Lightning Path - Legal Intake Pipeline
 * Kanban board for managing legal matter intake
 */

import React, { useState, useEffect } from 'react';
import { matterService, LightningStage, Matter } from '../../services/matter.service';
import IntakeClassifier from '../../components/ai/IntakeClassifier';
import { IntakeClassification } from '../../services/ai.service';
import './LightningPath.css';

interface KanbanColumn {
  stage: LightningStage;
  matters: Matter[];
}

const LightningPath: React.FC = () => {
  const [kanbanData, setKanbanData] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draggedMatter, setDraggedMatter] = useState<Matter | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [showIntake, setShowIntake] = useState(false);

  useEffect(() => {
    loadKanbanData();
    loadStats();
  }, []);

  const loadKanbanData = async () => {
    try {
      setLoading(true);
      const response = await matterService.getKanbanData();
      setKanbanData(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load pipeline data');
      console.error('Error loading kanban data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await matterService.getPipelineStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleDragStart = (matter: Matter) => {
    setDraggedMatter(matter);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStageId: string) => {
    if (!draggedMatter || draggedMatter.lightning_stage_id === targetStageId) {
      setDraggedMatter(null);
      return;
    }

    try {
      await matterService.moveKanban(draggedMatter.id, targetStageId);
      await loadKanbanData();
      await loadStats();
      setDraggedMatter(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to move matter');
      setDraggedMatter(null);
    }
  };

  const getMatterHealthColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const handleClassificationComplete = (classification: IntakeClassification) => {
    console.log('Intake classification completed:', classification);
    setShowIntake(false);
    // Refresh kanban data
    loadKanbanData();
  };

  if (loading) {
    return (
      <div className="lightning-path-container">
        <div className="loading-spinner">Loading Lightning Path...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lightning-path-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="lightning-path-container">
      {/* Header */}
      <div className="lightning-path-header">
        <div className="header-title">
          <h1>⚡ Lightning Path</h1>
          <p>Legal Matter Intake Pipeline</p>
        </div>

        <div className="header-actions">
          <button
            className="btn-new-intake"
            onClick={() => setShowIntake(!showIntake)}
          >
            {showIntake ? '❌ Close Intake' : '✨ New Intake'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="pipeline-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.total_matters || 0}</div>
            <div className="stat-label">Total Matters</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">R {(stats.total_value || 0).toLocaleString()}</div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.avg_conversion_time || 0)} days</div>
            <div className="stat-label">Avg. Time</div>
          </div>
        </div>
      )}

      {/* AI Intake Classifier */}
      {showIntake && (
        <div className="intake-classifier-section">
          <IntakeClassifier onClassificationComplete={handleClassificationComplete} />
        </div>
      )}

      {/* Kanban Board */}
      <div className="kanban-board">
        {kanbanData.map((column) => (
          <div
            key={column.stage.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.stage.id)}
          >
            {/* Column Header */}
            <div
              className="column-header"
              style={{ borderTopColor: column.stage.color || '#6366f1' }}
            >
              <div className="column-title">
                <span className="stage-name">{column.stage.name}</span>
                <span className="matter-count">{column.matters.length}</span>
              </div>
              {column.stage.matter_count !== undefined && (
                <div className="column-meta">
                  <span className="meta-item">
                    R {(column.stage.total_value || 0).toLocaleString()}
                  </span>
                  {column.stage.avg_days_in_stage && (
                    <span className="meta-item">
                      {Math.round(column.stage.avg_days_in_stage)} days avg
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Matters */}
            <div className="column-matters">
              {column.matters.length === 0 ? (
                <div className="empty-column">
                  <p>No matters in this stage</p>
                </div>
              ) : (
                column.matters.map((matter) => (
                  <div
                    key={matter.id}
                    className="matter-card"
                    draggable
                    onDragStart={() => handleDragStart(matter)}
                  >
                    <div className="matter-card-header">
                      <div className="matter-number">{matter.matter_number}</div>
                      <div
                        className="health-indicator"
                        style={{ backgroundColor: getMatterHealthColor(matter.health_status) }}
                        title={matter.health_status}
                      />
                    </div>

                    <div className="matter-title">{matter.title}</div>

                    <div className="matter-client">
                      <span className="client-icon">👤</span>
                      {matter.client_name}
                    </div>

                    {matter.matter_type && (
                      <div className="matter-type">{matter.matter_type}</div>
                    )}

                    <div className="matter-meta">
                      {matter.value && (
                        <div className="meta-row">
                          <span className="meta-label">Value:</span>
                          <span className="meta-value">R {matter.value.toLocaleString()}</span>
                        </div>
                      )}

                      {matter.budget_hours && (
                        <div className="meta-row">
                          <span className="meta-label">Budget:</span>
                          <span className="meta-value">
                            {matter.actual_hours.toFixed(1)} / {matter.budget_hours} hrs
                          </span>
                        </div>
                      )}

                      {matter.lead_director_name && (
                        <div className="meta-row">
                          <span className="meta-label">Director:</span>
                          <span className="meta-value">{matter.lead_director_name}</span>
                        </div>
                      )}

                      {matter.team_size && matter.team_size > 0 && (
                        <div className="meta-row">
                          <span className="meta-label">Team:</span>
                          <span className="meta-value">{matter.team_size} members</span>
                        </div>
                      )}
                    </div>

                    <div className="matter-footer">
                      <span className="matter-date">
                        {new Date(matter.opened_date || matter.created_at).toLocaleDateString()}
                      </span>
                      {matter.burn_rate > 0 && (
                        <span className="burn-rate" style={{
                          color: matter.burn_rate >= 95 ? '#ef4444' : matter.burn_rate >= 80 ? '#f59e0b' : '#10b981'
                        }}>
                          {matter.burn_rate.toFixed(0)}% burn
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LightningPath;
