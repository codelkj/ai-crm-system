/**
 * Document Summary Panel
 * Displays AI-generated document summaries
 */

import React, { useState, useEffect } from 'react';
import { documentSummarizationService, DocumentSummary } from '../../services/ai.service';
import './DocumentSummaryPanel.css';

interface DocumentSummaryPanelProps {
  documentId: string;
  documentName: string;
  onClose?: () => void;
}

const DocumentSummaryPanel: React.FC<DocumentSummaryPanelProps> = ({
  documentId,
  documentName,
  onClose
}) => {
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary();
  }, [documentId]);

  const loadSummary = async (regenerate: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const data = await documentSummarizationService.summarize(documentId, regenerate);
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load summary');
      console.error('Document summarization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    loadSummary(true);
  };

  if (loading) {
    return (
      <div className="summary-panel">
        <div className="summary-header">
          <h3>📄 Document Summary</h3>
          {onClose && (
            <button className="btn-close" onClick={onClose}>✕</button>
          )}
        </div>
        <div className="summary-body">
          <div className="loading-state">
            <div className="loading-spinner-large"></div>
            <p>AI is analyzing the document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-panel">
        <div className="summary-header">
          <h3>📄 Document Summary</h3>
          {onClose && (
            <button className="btn-close" onClick={onClose}>✕</button>
          )}
        </div>
        <div className="summary-body">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => loadSummary(false)}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="summary-panel">
      <div className="summary-header">
        <div className="header-content">
          <h3>📄 Document Summary</h3>
          <div className="document-name">{documentName}</div>
        </div>
        <div className="header-actions">
          <button className="btn-regenerate" onClick={handleRegenerate} title="Regenerate Summary">
            🔄 Regenerate
          </button>
          {onClose && (
            <button className="btn-close" onClick={onClose}>✕</button>
          )}
        </div>
      </div>

      <div className="summary-body">
        {/* Confidence Badge */}
        <div className="confidence-indicator">
          <span className="confidence-label">Confidence:</span>
          <div className="confidence-bar">
            <div
              className="confidence-fill"
              style={{
                width: `${summary.confidence * 100}%`,
                background: summary.confidence >= 0.8 ? '#28a745' : summary.confidence >= 0.6 ? '#ff9800' : '#dc3545'
              }}
            ></div>
          </div>
          <span className="confidence-value">{Math.round(summary.confidence * 100)}%</span>
        </div>

        {/* Main Summary */}
        <div className="summary-section">
          <h4>📝 Summary</h4>
          <p className="summary-text">{summary.summary}</p>
        </div>

        {/* Key Points */}
        {summary.keyPoints && summary.keyPoints.length > 0 && (
          <div className="summary-section">
            <h4>🔑 Key Points</h4>
            <ul className="key-points-list">
              {summary.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Entities */}
        {summary.entities && Object.keys(summary.entities).length > 0 && (
          <div className="summary-section">
            <h4>🏷️ Extracted Entities</h4>
            <div className="entities-grid">
              {summary.entities.people && summary.entities.people.length > 0 && (
                <div className="entity-group">
                  <div className="entity-label">👥 People</div>
                  <div className="entity-tags">
                    {summary.entities.people.map((person, index) => (
                      <span key={index} className="entity-tag">{person}</span>
                    ))}
                  </div>
                </div>
              )}

              {summary.entities.organizations && summary.entities.organizations.length > 0 && (
                <div className="entity-group">
                  <div className="entity-label">🏢 Organizations</div>
                  <div className="entity-tags">
                    {summary.entities.organizations.map((org, index) => (
                      <span key={index} className="entity-tag">{org}</span>
                    ))}
                  </div>
                </div>
              )}

              {summary.entities.dates && summary.entities.dates.length > 0 && (
                <div className="entity-group">
                  <div className="entity-label">📅 Dates</div>
                  <div className="entity-tags">
                    {summary.entities.dates.map((date, index) => (
                      <span key={index} className="entity-tag">{date}</span>
                    ))}
                  </div>
                </div>
              )}

              {summary.entities.amounts && summary.entities.amounts.length > 0 && (
                <div className="entity-group">
                  <div className="entity-label">💰 Amounts</div>
                  <div className="entity-tags">
                    {summary.entities.amounts.map((amount, index) => (
                      <span key={index} className="entity-tag">{amount}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="summary-footer">
          <div className="stat-item">
            <span className="stat-label">Word Count:</span>
            <span className="stat-value">{summary.wordCount.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Processing Time:</span>
            <span className="stat-value">{(summary.processingTime / 1000).toFixed(2)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSummaryPanel;
