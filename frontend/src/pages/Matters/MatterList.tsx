/**
 * Matter List Page
 * View and manage all legal matters
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matterService, Matter } from '../../services/matter.service';
import './Matters.css';

const MatterList: React.FC = () => {
  const navigate = useNavigate();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<any>(null);

  // Filters
  const [filters, setFilters] = useState({
    matter_status: 'active',
    health_status: '',
    department_id: '',
    page: 1,
    limit: 20
  });

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadMatters();
    loadStats();
  }, [filters]);

  const loadMatters = async () => {
    try {
      setLoading(true);
      const response = await matterService.getAll(filters);
      setMatters(response.data);
      setPagination(response.pagination);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load matters');
      console.error('Error loading matters:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await matterService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getMatterStatusBadge = (status: string) => {
    const colors: any = {
      active: { bg: '#10b981', text: 'white' },
      on_hold: { bg: '#f59e0b', text: 'white' },
      closed: { bg: '#6b7280', text: 'white' },
      archived: { bg: '#e5e7eb', text: '#374151' }
    };
    const color = colors[status] || colors.active;
    return (
      <span style={{
        background: color.bg,
        color: color.text,
        padding: '0.25rem 0.625rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'capitalize'
      }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (error) {
    return (
      <div className="matters-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="matters-container">
      {/* Header */}
      <div className="matters-header">
        <div>
          <h1>📁 Legal Matters</h1>
          <p>Manage all legal matters and cases</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/matters/new')}
        >
          + New Matter
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.active_matters || 0}</div>
            <div className="stat-label">Active Matters</div>
          </div>
          <div className="stat-card critical">
            <div className="stat-value">{stats.critical_matters || 0}</div>
            <div className="stat-label">Critical</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{stats.warning_matters || 0}</div>
            <div className="stat-label">Warning</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">R {(stats.total_budget || 0).toLocaleString()}</div>
            <div className="stat-label">Total Budget</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">R {(stats.total_actual || 0).toLocaleString()}</div>
            <div className="stat-label">Total Actual</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.avg_burn_rate || 0)}%</div>
            <div className="stat-label">Avg. Burn Rate</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <select
          value={filters.matter_status}
          onChange={(e) => setFilters({ ...filters, matter_status: e.target.value, page: 1 })}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={filters.health_status}
          onChange={(e) => setFilters({ ...filters, health_status: e.target.value, page: 1 })}
          className="filter-select"
        >
          <option value="">All Health Statuses</option>
          <option value="healthy">Healthy</option>
          <option value="warning">Warning</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Matters Table */}
      {loading ? (
        <div className="loading-spinner">Loading matters...</div>
      ) : matters.length === 0 ? (
        <div className="empty-state">
          <p>No matters found</p>
          <button className="btn-secondary" onClick={() => navigate('/matters/new')}>
            Create your first matter
          </button>
        </div>
      ) : (
        <>
          <div className="matters-table">
            <table>
              <thead>
                <tr>
                  <th>Matter #</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Director</th>
                  <th>Budget</th>
                  <th>Burn Rate</th>
                  <th>Health</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {matters.map((matter) => (
                  <tr
                    key={matter.id}
                    onClick={() => navigate(`/matters/${matter.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td><strong>{matter.matter_number}</strong></td>
                    <td>{matter.title}</td>
                    <td>{matter.client_name}</td>
                    <td>
                      {matter.matter_type && (
                        <span className="type-badge">{matter.matter_type}</span>
                      )}
                    </td>
                    <td>{matter.lead_director_name || '-'}</td>
                    <td>
                      {matter.budget_hours ? (
                        <span>
                          {Number(matter.actual_hours || 0).toFixed(2)} / {matter.budget_hours} hrs
                          <br />
                          <small style={{ color: '#6b7280' }}>
                            R {Number(matter.actual_amount || 0).toLocaleString()} / R {Number(matter.budget_amount || 0).toLocaleString()}
                          </small>
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <span style={{
                        color: getHealthStatusColor(matter.health_status),
                        fontWeight: '600'
                      }}>
                        {Number(matter.burn_rate || 0).toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: getHealthStatusColor(matter.health_status)
                          }}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{matter.health_status}</span>
                      </div>
                    </td>
                    <td>{getMatterStatusBadge(matter.matter_status)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-secondary-small"
                        onClick={() => navigate(`/matters/${matter.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                className="btn-secondary"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MatterList;
