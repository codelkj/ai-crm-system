/**
 * Contract Analysis Dashboard
 * Comprehensive AI-powered contract analysis display
 */

import React, { useState, useEffect } from 'react';
import { contractAnalysisService, ContractAnalysis } from '../../services/ai.service';
import './ContractAnalysisDashboard.css';

interface ContractAnalysisDashboardProps {
  documentId: string;
  documentName: string;
}

const ContractAnalysisDashboard: React.FC<ContractAnalysisDashboardProps> = ({
  documentId,
  documentName
}) => {
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [documentId]);

  const loadAnalysis = async (regenerate: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const data = await contractAnalysisService.analyze(documentId, regenerate);
      setAnalysis(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze contract');
      console.error('Contract analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return '#dc3545';
    if (score >= 40) return '#ff9800';
    return '#28a745';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Medium Risk';
    return 'Low Risk';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="contract-dashboard">
        <div className="dashboard-header">
          <h2>📑 Contract Analysis</h2>
        </div>
        <div className="dashboard-body">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>AI is analyzing the contract...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contract-dashboard">
        <div className="dashboard-header">
          <h2>📑 Contract Analysis</h2>
        </div>
        <div className="dashboard-body">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => loadAnalysis(false)}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="contract-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h2>📑 Contract Analysis</h2>
          <p className="document-subtitle">{documentName}</p>
        </div>
        <button className="btn-regenerate" onClick={() => loadAnalysis(true)}>
          🔄 Regenerate
        </button>
      </div>

      <div className="dashboard-body">
        {/* Risk Score Card */}
        <div className="risk-score-card">
          <div className="risk-score-circle" style={{
            background: `conic-gradient(${getRiskColor(analysis.overallRiskScore)} ${analysis.overallRiskScore}%, #e0e0e0 0)`
          }}>
            <div className="risk-score-inner">
              <div className="risk-score-value">{analysis.overallRiskScore}</div>
              <div className="risk-score-label">{getRiskLabel(analysis.overallRiskScore)}</div>
            </div>
          </div>
          <div className="confidence-badge">
            {Math.round(analysis.confidence * 100)}% Confidence
          </div>
        </div>

        {/* Parties */}
        {analysis.parties && analysis.parties.length > 0 && (
          <div className="analysis-section">
            <h3>👥 Parties</h3>
            <div className="parties-grid">
              {analysis.parties.map((party, index) => (
                <div key={index} className="party-card">
                  <div className="party-name">{party.name}</div>
                  <div className="party-role">{party.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Terms */}
        {analysis.keyTerms && Object.keys(analysis.keyTerms).length > 0 && (
          <div className="analysis-section">
            <h3>📋 Key Terms</h3>
            <div className="terms-grid">
              {analysis.keyTerms.effectiveDate && (
                <div className="term-item">
                  <div className="term-label">Effective Date</div>
                  <div className="term-value">{analysis.keyTerms.effectiveDate}</div>
                </div>
              )}
              {analysis.keyTerms.terminationDate && (
                <div className="term-item">
                  <div className="term-label">Termination Date</div>
                  <div className="term-value">{analysis.keyTerms.terminationDate}</div>
                </div>
              )}
              {analysis.keyTerms.paymentTerms && (
                <div className="term-item">
                  <div className="term-label">Payment Terms</div>
                  <div className="term-value">{analysis.keyTerms.paymentTerms}</div>
                </div>
              )}
              {analysis.keyTerms.renewalTerms && (
                <div className="term-item">
                  <div className="term-label">Renewal Terms</div>
                  <div className="term-value">{analysis.keyTerms.renewalTerms}</div>
                </div>
              )}
              {analysis.keyTerms.noticePeriod && (
                <div className="term-item">
                  <div className="term-label">Notice Period</div>
                  <div className="term-value">{analysis.keyTerms.noticePeriod}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Obligations */}
        {analysis.obligations && analysis.obligations.length > 0 && (
          <div className="analysis-section">
            <h3>📌 Key Obligations</h3>
            <div className="obligations-list">
              {analysis.obligations.map((obligation, index) => (
                <div key={index} className="obligation-card">
                  <div className="obligation-party">{obligation.party}</div>
                  <div className="obligation-text">{obligation.obligation}</div>
                  {obligation.deadline && (
                    <div className="obligation-deadline">⏰ {obligation.deadline}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {analysis.risks && analysis.risks.length > 0 && (
          <div className="analysis-section">
            <h3>⚠️ Identified Risks</h3>
            <div className="risks-list">
              {analysis.risks.map((risk, index) => (
                <div key={index} className={`risk-card severity-${risk.severity}`}>
                  <div className="risk-header">
                    <span className="risk-severity-icon">{getSeverityIcon(risk.severity)}</span>
                    <span className="risk-severity">{risk.severity.toUpperCase()}</span>
                    <span className="risk-category">{risk.category}</span>
                  </div>
                  <div className="risk-description">{risk.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unusual Clauses */}
        {analysis.unusualClauses && analysis.unusualClauses.length > 0 && (
          <div className="analysis-section">
            <h3>🚩 Unusual Clauses</h3>
            <ul className="unusual-clauses-list">
              {analysis.unusualClauses.map((clause, index) => (
                <li key={index}>{clause}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="analysis-section">
            <h3>💡 Recommendations</h3>
            <ul className="recommendations-list">
              {analysis.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="dashboard-footer">
          <small>Analyzed: {new Date(analysis.analyzedAt).toLocaleString()}</small>
        </div>
      </div>
    </div>
  );
};

export default ContractAnalysisDashboard;
