/**
 * Terms Table Component
 */

import React from 'react';
import { ExtractedTerm } from '../../services/legal.service';
import './TermsTable.css';

interface TermsTableProps {
  terms: Record<string, ExtractedTerm[]>;
}

const TermsTable: React.FC<TermsTableProps> = ({ terms }) => {
  const termTypes = Object.keys(terms);

  if (termTypes.length === 0) {
    return <div className="no-terms">No terms extracted yet.</div>;
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return '#16c79a';
    if (score >= 0.6) return '#ffa500';
    return '#e94560';
  };

  return (
    <div className="terms-table-container">
      {termTypes.map((termType) => (
        <div key={termType} className="term-type-section">
          <h4 className="term-type-title">
            {termType.replace(/_/g, ' ').toUpperCase()}
            <span className="term-count">({terms[termType].length})</span>
          </h4>

          <table className="terms-table">
            <thead>
              <tr>
                <th>Term Text</th>
                <th>Confidence</th>
                <th>Page</th>
              </tr>
            </thead>
            <tbody>
              {terms[termType].map((term) => (
                <tr key={term.id}>
                  <td className="term-text">{term.term_text}</td>
                  <td>
                    <div className="confidence-cell">
                      <div
                        className="confidence-bar"
                        style={{
                          width: `${term.confidence_score * 100}%`,
                          background: getConfidenceColor(term.confidence_score),
                        }}
                      ></div>
                      <span className="confidence-value">
                        {(term.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                  <td>{term.page_number || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TermsTable;
