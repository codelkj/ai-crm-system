/**
 * FICA Compliance Checker Component
 * AI-powered compliance gap detection
 */

import React, { useState, useEffect } from 'react';
import { ficaComplianceService, FICAAnalysis } from '../../services/ai.service';
import './FICAComplianceChecker.css';

interface FICAComplianceCheckerProps {
  clientId: string;
  clientName: string;
  onRefresh?: () => void;
}

const FICAComplianceChecker: React.FC<FICAComplianceCheckerProps> = ({
  clientId,
  clientName,
  onRefresh
}) => {
  const [analysis, setAnalysis] = useState<FICAAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [clientId]);

  const loadAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ficaComplianceService.detectGaps(clientId);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load FICA analysis');
      console.error('FICA analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'green';
      case 'in_progress': return 'orange';
      case 'not_started': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'in_progress': return 'In Progress';
      case 'not_started': return 'Not Started';
      default: return 'Unknown';
    }
  };

  const getGapStatusIcon = (status: string) => {
    switch (status) {
      case 'missing': return '❌';
      case 'expired': return '⏰';
      case 'pending_verification': return '⏳';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="fica-checker-card">
        <div className="fica-checker-header">
          <h3>🔒 FICA Compliance</h3>
        </div>
        <div className="fica-checker-body">
          <div className="loading-spinner">Analyzing compliance...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fica-checker-card">
        <div className="fica-checker-header">
          <h3>🔒 FICA Compliance</h3>
        </div>
        <div className="fica-checker-body">
          <div className="error-message">{error}</div>
          <button onClick={loadAnalysis} className="btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="fica-checker-card">
      <div className="fica-checker-header">
        <h3>🔒 FICA Compliance</h3>
        <button onClick={loadAnalysis} className="btn-refresh" title="Refresh">
          🔄
        </button>
      </div>

      <div className="fica-checker-body">
        {/* Compliance Status */}
        <div className="compliance-status">
          <div className="status-circle-wrapper">
            <div className="status-circle" style={{
              background: `conic-gradient(${getStatusColor(analysis.complianceStatus)} ${analysis.completionPercentage}%, #e0e0e0 0)`
            }}>
              <div className="status-circle-inner">
                <div className="status-percentage">{analysis.completionPercentage}%</div>
              </div>
            </div>
          </div>
          <div className="status-details">
            <div className="status-label">
              Status: <span className={`status-badge status-${analysis.complianceStatus}`}>
                {getStatusLabel(analysis.complianceStatus)}
              </span>
            </div>
            <div className="status-meta">
              {analysis.missingDocuments.length} missing • {analysis.expiringSoon.length} expiring soon
            </div>
          </div>
        </div>

        {/* Missing Documents */}
        {analysis.missingDocuments.length > 0 && (
          <div className="fica-section">
            <h4>Missing Documents ({analysis.missingDocuments.length})</h4>
            <ul className="document-list">
              {analysis.missingDocuments.map((doc, index) => (
                <li key={index} className={`document-item status-${doc.status}`}>
                  <span className="doc-icon">{getGapStatusIcon(doc.status)}</span>
                  <span className="doc-name">{doc.documentName}</span>
                  {doc.daysOverdue && doc.daysOverdue > 0 && (
                    <span className="doc-overdue">{doc.daysOverdue} days overdue</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Expiring Soon */}
        {analysis.expiringSoon.length > 0 && (
          <div className="fica-section">
            <h4>Expiring Soon ({analysis.expiringSoon.length})</h4>
            <ul className="document-list">
              {analysis.expiringSoon.map((doc, index) => (
                <li key={index} className="document-item status-warning">
                  <span className="doc-icon">⚠️</span>
                  <span className="doc-name">{doc.documentName}</span>
                  {doc.daysOverdue && (
                    <span className="doc-expires">Expires in {Math.abs(doc.daysOverdue)} days</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="fica-section">
            <h4>🤖 AI Recommendations</h4>
            <ul className="recommendation-list">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Complete Status */}
        {analysis.complianceStatus === 'complete' && (
          <div className="fica-section success-message">
            <div className="success-icon">✅</div>
            <div className="success-text">
              <strong>All FICA documents are complete and verified!</strong>
              <p>This client is fully compliant.</p>
            </div>
          </div>
        )}

        <div className="fica-footer">
          <small>Last checked: {new Date(analysis.lastChecked).toLocaleString()}</small>
        </div>
      </div>
    </div>
  );
};

export default FICAComplianceChecker;
