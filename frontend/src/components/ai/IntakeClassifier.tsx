/**
 * Intake Classifier Widget
 * AI-powered legal inquiry classification
 */

import React, { useState } from 'react';
import { intakeClassificationService, IntakeClassification } from '../../services/ai.service';
import './IntakeClassifier.css';

interface IntakeClassifierProps {
  onClassificationComplete?: (classification: IntakeClassification) => void;
  initialNotes?: string;
  clientType?: string;
}

const IntakeClassifier: React.FC<IntakeClassifierProps> = ({
  onClassificationComplete,
  initialNotes = '',
  clientType
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [classification, setClassification] = useState<IntakeClassification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClassify = async () => {
    if (!notes.trim()) {
      setError('Please enter inquiry notes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await intakeClassificationService.classify(notes, clientType);
      setClassification(result);
      if (onClassificationComplete) {
        onClassificationComplete(result);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Classification failed');
      console.error('Classification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#dc3545';
      case 'medium': return '#ff9800';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ff9800';
    return '#dc3545';
  };

  return (
    <div className="intake-classifier-card">
      <div className="intake-classifier-header">
        <h3>🤖 AI Intake Classifier</h3>
        <span className="beta-badge">BETA</span>
      </div>

      <div className="intake-classifier-body">
        {/* Input Section */}
        <div className="input-section">
          <label htmlFor="inquiry-notes">Inquiry Details</label>
          <textarea
            id="inquiry-notes"
            className="inquiry-textarea"
            rows={6}
            placeholder="Describe the legal inquiry, case details, or client needs..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
          {clientType && (
            <div className="client-type-badge">
              Client Type: {clientType}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Classify Button */}
        <button
          className="btn-classify"
          onClick={handleClassify}
          disabled={loading || !notes.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Analyzing with AI...
            </>
          ) : (
            <>
              ✨ Classify Inquiry
            </>
          )}
        </button>

        {/* Classification Results */}
        {classification && !loading && (
          <div className="classification-results">
            <div className="results-header">
              <h4>Classification Results</h4>
              <div
                className="confidence-badge"
                style={{ background: getConfidenceColor(classification.confidence) }}
              >
                {Math.round(classification.confidence * 100)}% confident
              </div>
            </div>

            <div className="results-grid">
              {/* Department */}
              <div className="result-item">
                <div className="result-label">📂 Department</div>
                <div className="result-value">{classification.department}</div>
              </div>

              {/* Matter Type */}
              <div className="result-item">
                <div className="result-label">📋 Matter Type</div>
                <div className="result-value">{classification.matterType}</div>
              </div>

              {/* Urgency */}
              <div className="result-item">
                <div className="result-label">⏱️ Urgency</div>
                <div
                  className="result-value urgency-badge"
                  style={{ background: getUrgencyColor(classification.urgency) }}
                >
                  {classification.urgency.toUpperCase()}
                </div>
              </div>

              {/* Suggested Director */}
              {classification.suggestedDirector && (
                <div className="result-item">
                  <div className="result-label">👤 Suggested Director</div>
                  <div className="result-value">{classification.suggestedDirector}</div>
                </div>
              )}

              {/* Estimated Value */}
              {classification.estimatedValue && (
                <div className="result-item">
                  <div className="result-label">💰 Estimated Value</div>
                  <div className="result-value">
                    R {classification.estimatedValue.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* AI Reasoning */}
            <div className="reasoning-section">
              <div className="reasoning-label">🧠 AI Reasoning</div>
              <div className="reasoning-text">{classification.reasoning}</div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!classification && !loading && (
          <div className="help-text">
            <p>
              The AI will analyze your inquiry and suggest:
            </p>
            <ul>
              <li>Most appropriate department</li>
              <li>Specific matter type</li>
              <li>Urgency level</li>
              <li>Recommended director (if available)</li>
              <li>Estimated case value (if applicable)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntakeClassifier;
