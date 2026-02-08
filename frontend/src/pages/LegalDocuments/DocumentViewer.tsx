/**
 * Document Viewer Component
 */

import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import TermsTable from './TermsTable';
import ContractAnalysisDashboard from '../../components/ai/ContractAnalysisDashboard';
import DocumentSummaryPanel from '../../components/ai/DocumentSummaryPanel';
import { LegalDocument, ExtractedTerm, legalService } from '../../services/legal.service';
import './DocumentViewer.css';

interface DocumentViewerProps {
  document: LegalDocument;
  onClose: () => void;
}

type TabType = 'details' | 'terms' | 'analysis' | 'summary';

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const [terms, setTerms] = useState<Record<string, ExtractedTerm[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('details');

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await legalService.getGroupedTerms(document.id);
        setTerms(response.data || {});
      } catch (error) {
        console.error('Failed to fetch terms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [document.id]);

  return (
    <Modal isOpen={true} onClose={onClose} title={document.title} size="large">
      <div className="document-viewer">
        {/* Tab Navigation */}
        <div className="document-tabs">
          <button
            className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            📋 Details
          </button>
          <button
            className={`tab-button ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            📊 Terms
          </button>
          <button
            className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            🤖 AI Analysis
          </button>
          <button
            className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            📄 AI Summary
          </button>
        </div>

        {/* Tab Content */}
        <div className="document-tab-content">
          {activeTab === 'details' && (
            <>
              <div className="document-info">
                <div className="info-row">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{document.document_type}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className="info-value">{document.status}</span>
                </div>
                {document.company && (
                  <div className="info-row">
                    <span className="info-label">Company:</span>
                    <span className="info-value">{document.company.name}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">File:</span>
                  <span className="info-value">{document.file_path}</span>
                </div>
              </div>

              {document.extracted_text && (
                <div className="extracted-text-section">
                  <h3>Extracted Text</h3>
                  <div className="extracted-text">
                    {document.extracted_text.substring(0, 500)}
                    {document.extracted_text.length > 500 && '...'}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'terms' && (
            <div className="terms-section">
              <h3>Extracted Terms</h3>
              {loading ? (
                <Loading message="Loading terms..." />
              ) : (
                <TermsTable terms={terms} />
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <ContractAnalysisDashboard
              documentId={document.id}
              documentName={document.title}
            />
          )}

          {activeTab === 'summary' && (
            <DocumentSummaryPanel
              documentId={document.id}
              documentName={document.title}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewer;
