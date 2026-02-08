/**
 * LegalNexus Reporting Dashboard
 * Fee Earner Rankings, Practice Analytics, Soul Logic
 */

import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import Loading from '../../components/common/Loading';
import reportingService, {
  FeeEarnerRanking,
  PracticeAreaAnalytics,
  WorkloadMetrics,
  BillingInertia,
  ExecutiveSummary
} from '../../services/reporting.service';
import './ReportingDashboard.css';

type TabType = 'overview' | 'fee-earners' | 'practice-areas' | 'workload' | 'inertia';
type PeriodType = 'month' | 'quarter' | 'year';

const ReportingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [loading, setLoading] = useState(true);

  const [executiveSummary, setExecutiveSummary] = useState<ExecutiveSummary | null>(null);
  const [feeEarners, setFeeEarners] = useState<FeeEarnerRanking[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeAreaAnalytics[]>([]);
  const [workload, setWorkload] = useState<WorkloadMetrics[]>([]);
  const [inertia, setInertia] = useState<BillingInertia[]>([]);

  useEffect(() => {
    loadData();
  }, [period, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const summaryData = await reportingService.getExecutiveSummary(period);
        setExecutiveSummary(summaryData.data);
      } else if (activeTab === 'fee-earners') {
        const feeData = await reportingService.getFeeEarnerRankings(period);
        setFeeEarners(feeData.data);
      } else if (activeTab === 'practice-areas') {
        const practiceData = await reportingService.getPracticeAreaAnalytics(period);
        setPracticeAreas(practiceData.data);
      } else if (activeTab === 'workload') {
        const workloadData = await reportingService.getWorkloadMetrics();
        setWorkload(workloadData.data);
      } else if (activeTab === 'inertia') {
        const inertiaData = await reportingService.getBillingInertia();
        setInertia(inertiaData.data);
      }
    } catch (error) {
      console.error('Failed to load reporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSoulLogicColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ff9800';
    return '#dc3545';
  };

  const getCapacityColor = (status: string) => {
    switch (status) {
      case 'green': return '#28a745';
      case 'amber': return '#ff9800';
      case 'red': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <Layout>
      <div className="legalnexus-reporting">
        {/* Header */}
        <div className="reporting-header">
          <div className="header-content">
            <h1>⚡ LegalNexus Reporting</h1>
            <p className="subtitle">Legal Operating System Analytics & Soul Logic</p>
          </div>
          <div className="period-selector">
            <button
              className={period === 'month' ? 'active' : ''}
              onClick={() => setPeriod('month')}
            >
              Month
            </button>
            <button
              className={period === 'quarter' ? 'active' : ''}
              onClick={() => setPeriod('quarter')}
            >
              Quarter
            </button>
            <button
              className={period === 'year' ? 'active' : ''}
              onClick={() => setPeriod('year')}
            >
              Year
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="reporting-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab ${activeTab === 'fee-earners' ? 'active' : ''}`}
            onClick={() => setActiveTab('fee-earners')}
          >
            👤 Fee Earners
          </button>
          <button
            className={`tab ${activeTab === 'practice-areas' ? 'active' : ''}`}
            onClick={() => setActiveTab('practice-areas')}
          >
            🏛️ Practice Areas
          </button>
          <button
            className={`tab ${activeTab === 'workload' ? 'active' : ''}`}
            onClick={() => setActiveTab('workload')}
          >
            📈 50-Seat Load Index
          </button>
          <button
            className={`tab ${activeTab === 'inertia' ? 'active' : ''}`}
            onClick={() => setActiveTab('inertia')}
          >
            ⚠️ Billing Inertia
          </button>
        </div>

        {/* Content */}
        <div className="reporting-content">
          {loading ? (
            <Loading message="Loading analytics..." />
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && executiveSummary && (
                <div className="overview-tab">
                  {/* Soul Logic Score */}
                  <div className="soul-logic-card">
                    <h2>🧠 Soul Logic Score</h2>
                    <div className="soul-score-circle">
                      <div
                        className="score-ring"
                        style={{
                          background: `conic-gradient(${getSoulLogicColor(executiveSummary.soul_logic_score)} ${executiveSummary.soul_logic_score}%, #e0e0e0 0)`
                        }}
                      >
                        <div className="score-inner">
                          <div className="score-value">{executiveSummary.soul_logic_score}</div>
                          <div className="score-label">Firm Energy</div>
                        </div>
                      </div>
                    </div>
                    <p className="soul-description">
                      Measuring operational flow, delivery momentum, and attorney well-being
                    </p>
                  </div>

                  {/* Summary Metrics */}
                  <div className="summary-grid">
                    <div className="metric-card">
                      <div className="metric-icon">💰</div>
                      <div className="metric-value">
                        R {Number(executiveSummary.summary.total_revenue || 0).toLocaleString()}
                      </div>
                      <div className="metric-label">Total Revenue (30d)</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon">⏱️</div>
                      <div className="metric-value">
                        {Number(executiveSummary.summary.total_hours || 0).toLocaleString()} hrs
                      </div>
                      <div className="metric-label">Billable Hours</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon">📊</div>
                      <div className="metric-value">
                        {Number(executiveSummary.summary.avg_utilization || 0).toFixed(2)}%
                      </div>
                      <div className="metric-label">Avg Utilization</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-icon">⚠️</div>
                      <div className="metric-value">
                        R {Number(executiveSummary.summary.unbilled_revenue || 0).toLocaleString()}
                      </div>
                      <div className="metric-label">Unbilled Revenue</div>
                    </div>
                  </div>

                  {/* Energy Drains (Soul Logic) */}
                  {executiveSummary.energy_drains.length > 0 && (
                    <div className="energy-drains-card">
                      <h3>⚡ Energy Drains Detected</h3>
                      <div className="drains-list">
                        {executiveSummary.energy_drains.map((drain, index) => (
                          <div key={index} className={`drain-item severity-${drain.severity}`}>
                            <div className="drain-icon">
                              {drain.severity === 'high' ? '🔴' : drain.severity === 'medium' ? '🟡' : '🟢'}
                            </div>
                            <div className="drain-content">
                              <div className="drain-type">{drain.type.replace(/_/g, ' ')}</div>
                              <div className="drain-message">{drain.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Earners */}
                  <div className="top-earners-card">
                    <h3>🏆 Top 5 Fee Earners</h3>
                    <div className="earners-list">
                      {executiveSummary.top_earners.map((earner, index) => (
                        <div key={earner.user_id} className="earner-item">
                          <div className="earner-rank">#{index + 1}</div>
                          <div className="earner-info">
                            <div className="earner-name">{earner.name}</div>
                            <div className="earner-role">{earner.role} • {earner.department}</div>
                          </div>
                          <div className="earner-stats">
                            <div className="earner-revenue">R {Number(earner.total_revenue || 0).toLocaleString()}</div>
                            <div className="earner-hours">{earner.total_hours || 0} hrs</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Fee Earners Tab */}
              {activeTab === 'fee-earners' && (
                <div className="fee-earners-tab">
                  <div className="tab-header">
                    <h2>👤 Fee Earner Rankings</h2>
                    <p>Revenue generated by attorneys ({period})</p>
                  </div>
                  <div className="table-container">
                    <table className="fee-earners-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Attorney</th>
                          <th>Role</th>
                          <th>Department</th>
                          <th>Revenue</th>
                          <th>Hours</th>
                          <th>Rate</th>
                          <th>Matters</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeEarners.map((earner) => (
                          <tr key={earner.user_id}>
                            <td className="rank-cell">
                              <span className={`rank-badge rank-${earner.rank || 0}`}>
                                #{earner.rank || 0}
                              </span>
                            </td>
                            <td className="name-cell">
                              <div className="attorney-name">{earner.name}</div>
                              <div className="attorney-email">{earner.email}</div>
                            </td>
                            <td>{earner.role}</td>
                            <td>{earner.department}</td>
                            <td className="revenue-cell">R {Number(earner.total_revenue || 0).toLocaleString()}</td>
                            <td>{earner.total_hours || 0} hrs</td>
                            <td>R {earner.billable_rate || 0}/hr</td>
                            <td>{earner.matters_count || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Practice Areas Tab */}
              {activeTab === 'practice-areas' && (
                <div className="practice-areas-tab">
                  <div className="tab-header">
                    <h2>🏛️ Practice Area Analytics</h2>
                    <p>Performance by department ({period})</p>
                  </div>
                  {practiceAreas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      <p>No practice area data available for this period.</p>
                    </div>
                  ) : (
                    <div className="areas-grid">
                      {practiceAreas.map((area) => (
                      <div key={area.department_id} className="area-card">
                        <h3>{area.department_name}</h3>
                        <div className="area-stats">
                          <div className="stat">
                            <span className="stat-label">Revenue</span>
                            <span className="stat-value">R {Number(area.total_revenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Hours</span>
                            <span className="stat-value">{area.total_hours || 0} hrs</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Matters</span>
                            <span className="stat-value">{area.matters_count || 0}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Avg Value</span>
                            <span className="stat-value">R {Number(area.avg_matter_value || 0).toFixed(2)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Utilization</span>
                            <span className="stat-value">{Number(area.utilization_rate || 0).toFixed(2)}%</span>
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Workload Tab (50-Seat Load Index) */}
              {activeTab === 'workload' && (
                <div className="workload-tab">
                  <div className="tab-header">
                    <h2>📈 50-Seat Load Index</h2>
                    <p>Resource utilization and capacity tracking</p>
                  </div>
                  <div className="capacity-legend">
                    <span className="legend-item">
                      <span className="dot green"></span> Green (0-79%): Available capacity
                    </span>
                    <span className="legend-item">
                      <span className="dot amber"></span> Amber (80-94%): Near capacity
                    </span>
                    <span className="legend-item">
                      <span className="dot red"></span> Red (95%+): At/over capacity
                    </span>
                  </div>
                  {workload.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                      <p>No workload data available.</p>
                    </div>
                  ) : (
                    <div className="workload-grid">
                      {workload.map((attorney) => (
                      <div
                        key={attorney.user_id}
                        className={`workload-card capacity-${attorney.capacity_status}`}
                      >
                        <div className="workload-header">
                          <div className="attorney-name">{attorney.name}</div>
                          <div
                            className="capacity-indicator"
                            style={{ backgroundColor: getCapacityColor(attorney.capacity_status) }}
                          >
                            {Number(attorney.utilization_percentage || 0).toFixed(2)}%
                          </div>
                        </div>
                        <div className="workload-stats">
                          <div className="stat-row">
                            <span>Hours Logged:</span>
                            <span>{attorney.total_hours_logged || 0} / {attorney.available_hours || 0}</span>
                          </div>
                          <div className="stat-row">
                            <span>Matters Assigned:</span>
                            <span>{attorney.matters_assigned || 0}</span>
                          </div>
                        </div>
                        <div className="utilization-bar">
                          <div
                            className="utilization-fill"
                            style={{
                              width: `${Math.min(attorney.utilization_percentage, 100)}%`,
                              backgroundColor: getCapacityColor(attorney.capacity_status)
                            }}
                          ></div>
                        </div>
                      </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Billing Inertia Tab */}
              {activeTab === 'inertia' && (
                <div className="inertia-tab">
                  <div className="tab-header">
                    <h2>⚠️ Billing Inertia Detection</h2>
                    <p>Unbilled time and revenue at risk</p>
                  </div>
                  {inertia.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">✅</div>
                      <h3>No Billing Inertia Detected</h3>
                      <p>All attorneys are up to date with billing</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="inertia-table">
                        <thead>
                          <tr>
                            <th>Attorney</th>
                            <th>Unbilled Hours</th>
                            <th>Unbilled Amount</th>
                            <th>Oldest Entry</th>
                            <th>Days Overdue</th>
                            <th>Inertia Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inertia.map((item) => (
                            <tr key={item.user_id} className={`inertia-row score-${(item.inertia_score || 0) >= 75 ? 'high' : (item.inertia_score || 0) >= 50 ? 'medium' : 'low'}`}>
                              <td className="attorney-name">{item.name}</td>
                              <td>{item.unbilled_hours || 0} hrs</td>
                              <td className="amount-cell">R {Number(item.unbilled_amount || 0).toLocaleString()}</td>
                              <td>{item.oldest_unbilled_date ? new Date(item.oldest_unbilled_date).toLocaleDateString() : '-'}</td>
                              <td>{item.days_overdue || 0} days</td>
                              <td>
                                <span className={`inertia-badge score-${(item.inertia_score || 0) >= 75 ? 'high' : (item.inertia_score || 0) >= 50 ? 'medium' : 'low'}`}>
                                  {item.inertia_score || 0}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportingDashboard;
