/**
 * Matter Detail View Page
 * View matter details, team, budget, and activity
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { matterService, Matter, MatterAssignment } from '../../services/matter.service';
import { timeEntryService } from '../../services/time-tracking.service';
import './MatterView.css';

const MatterView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [assignments, setAssignments] = useState<MatterAssignment[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMatter();
      loadAssignments();
      loadRecentActivity();
    }
  }, [id]);

  const loadMatter = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await matterService.getById(id);
      setMatter(response.data);
    } catch (error) {
      console.error('Failed to load matter:', error);
      alert('Failed to load matter');
      navigate('/matters');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    if (!id) return;

    try {
      const response = await matterService.getAssignmentsByMatter(id, true);
      setAssignments(response.data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const loadRecentActivity = async () => {
    if (!id) return;

    try {
      // Load recent time entries for this matter
      const response = await timeEntryService.getAll({
        matter_id: id,
        limit: 10
      });
      setRecentActivity(response.data);
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const handleEdit = () => {
    navigate(`/matters/${id}/edit`);
  };

  const formatCurrency = (amount: number) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHealthStatusClass = (status: string) => {
    switch (status) {
      case 'critical': return 'health-critical';
      case 'warning': return 'health-warning';
      default: return 'health-healthy';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'on_hold': return 'badge-on-hold';
      case 'closed': return 'badge-closed';
      case 'archived': return 'badge-archived';
      default: return 'badge-active';
    }
  };

  if (loading || !matter) {
    return (
      <Layout>
        <div className="matter-view-loading">
          <div className="spinner"></div>
          <p>Loading matter...</p>
        </div>
      </Layout>
    );
  }

  const budgetUsedPercent = matter.budget_amount
    ? (Number(matter.actual_amount || 0) / Number(matter.budget_amount || 1)) * 100
    : 0;

  return (
    <Layout>
      <div className="matter-view">
        {/* Header */}
        <div className="matter-view-header">
          <div>
            <button className="btn-back" onClick={() => navigate('/matters')}>
              ← Back to Matters
            </button>
            <div className="matter-title-row">
              <h1>{matter.title}</h1>
              <span className={`status-badge ${getStatusBadgeClass(matter.matter_status)}`}>
                {matter.matter_status.replace('_', ' ')}
              </span>
            </div>
            <div className="matter-meta">
              <span className="matter-number">#{matter.matter_number}</span>
              {matter.matter_type && (
                <span className="matter-type">{matter.matter_type}</span>
              )}
              {matter.department_name && (
                <span className="matter-department">{matter.department_name}</span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={handleEdit}>
              Edit Matter
            </button>
          </div>
        </div>

        {/* Health Indicator */}
        <div className={`health-banner ${getHealthStatusClass(matter.health_status)}`}>
          <div className="health-icon">
            {matter.health_status === 'critical' && '⚠'}
            {matter.health_status === 'warning' && '⚡'}
            {matter.health_status === 'healthy' && '✓'}
          </div>
          <div className="health-text">
            <strong>
              {matter.health_status === 'critical' && 'Critical'}
              {matter.health_status === 'warning' && 'Warning'}
              {matter.health_status === 'healthy' && 'Healthy'}
            </strong>
            <span>
              {matter.health_status === 'critical' && 'Matter requires immediate attention'}
              {matter.health_status === 'warning' && 'Matter needs monitoring'}
              {matter.health_status === 'healthy' && 'Matter is on track'}
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">Client</div>
            <div className="metric-value">{matter.client_name || 'Unknown'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Lead Director</div>
            <div className="metric-value">{matter.lead_director_name || 'Unassigned'}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Opened Date</div>
            <div className="metric-value">
              {matter.opened_date ? formatDate(matter.opened_date) : 'N/A'}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Team Size</div>
            <div className="metric-value">{assignments.length}</div>
          </div>
        </div>

        {/* Budget Section */}
        <div className="section-card">
          <h2>Budget & Actuals</h2>
          <div className="budget-grid">
            <div className="budget-item">
              <label>Budget Amount:</label>
              <span className="budget-value">
                {matter.budget_amount ? formatCurrency(matter.budget_amount) : 'No budget set'}
              </span>
            </div>
            <div className="budget-item">
              <label>Actual Amount:</label>
              <span className="budget-value">{formatCurrency(matter.actual_amount)}</span>
            </div>
            <div className="budget-item">
              <label>Budget Hours:</label>
              <span className="budget-value">
                {matter.budget_hours ? `${matter.budget_hours}h` : 'No budget set'}
              </span>
            </div>
            <div className="budget-item">
              <label>Actual Hours:</label>
              <span className="budget-value">{Number(matter.actual_hours || 0).toFixed(2)}h</span>
            </div>
          </div>

          {matter.budget_amount && (
            <div className="budget-progress">
              <div className="progress-header">
                <span>Budget Utilization</span>
                <span className={budgetUsedPercent > 90 ? 'warning' : ''}>
                  {budgetUsedPercent.toFixed(2)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${budgetUsedPercent > 100 ? 'over-budget' : ''}`}
                  style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Team Assignments */}
        <div className="section-card">
          <h2>Team Assignments ({assignments.length})</h2>
          {assignments.length === 0 ? (
            <p className="empty-message">No team members assigned yet</p>
          ) : (
            <div className="assignments-grid">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <div className="assignment-user">
                    <div className="user-avatar">
                      {assignment.user_name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{assignment.user_name}</div>
                      <div className="user-email">{assignment.user_email}</div>
                    </div>
                  </div>
                  <div className="assignment-role">{assignment.role}</div>
                  <div className="assignment-date">
                    Since {formatDate(assignment.assigned_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {matter.description && (
          <div className="section-card">
            <h2>Description</h2>
            <p className="matter-description">{matter.description}</p>
          </div>
        )}

        {/* Recent Activity */}
        <div className="section-card">
          <h2>Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="empty-message">No recent activity</p>
          ) : (
            <div className="activity-list">
              {recentActivity.map((entry: any) => (
                <div key={entry.id} className="activity-item">
                  <div className="activity-date">{formatDate(entry.entry_date)}</div>
                  <div className="activity-content">
                    <div className="activity-user">{entry.user_name}</div>
                    <div className="activity-description">{entry.description}</div>
                  </div>
                  <div className="activity-duration">
                    {Math.floor(entry.duration_minutes / 60)}h{' '}
                    {entry.duration_minutes % 60}m
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MatterView;
