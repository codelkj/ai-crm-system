/**
 * Document Viewer Component
 */

import React, { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import TermsTable from './TermsTable';
import { LegalDocument, ExtractedTerm, legalService } from '../../services/legal.service';
import './DocumentViewer.css';

interface DocumentViewerProps {
  document: LegalDocument;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, onClose }) => {
  const [terms, setTerms] = useState<Record<string, ExtractedTerm[]>>({});
  const [loading, setLoading] = useState(true);

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

        <div className="terms-section">
          <h3>Extracted Terms</h3>
          {loading ? (
            <Loading message="Loading terms..." />
          ) : (
            <TermsTable terms={terms} />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewer;
