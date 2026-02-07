/**
 * Legal Documents Page
 */

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDocuments } from '../../store/slices/legalSlice';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import DocumentViewer from './DocumentViewer';
import { legalService, LegalDocument } from '../../services/legal.service';
import { format } from 'date-fns';
import './LegalDocuments.css';

const LegalDocuments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { documents, loading } = useAppSelector((state) => state.legal);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDocuments());
  }, [dispatch]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('document_type', 'contract');

    try {
      await legalService.uploadDocument(formData);
      dispatch(fetchDocuments());
      e.target.value = '';
    } catch (error: any) {
      setUploadError(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = (doc: LegalDocument) => {
    setSelectedDocument(doc);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#ffa500',
      processing: '#2196f3',
      completed: '#16c79a',
      failed: '#e94560',
    };

    return (
      <span
        style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 500,
          background: colors[status] || '#ccc',
          color: 'white',
        }}
      >
        {status}
      </span>
    );
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'document_type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (status: string) => getStatusBadge(status),
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (date: string) => format(new Date(date), 'MMM dd, yyyy'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: LegalDocument) => (
        <Button size="small" onClick={() => handleViewDocument(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="legal-documents-page">
        <div className="page-header">
          <h1>Legal Documents</h1>
          <div className="upload-section">
            <input
              type="file"
              id="file-upload"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              disabled={uploading}
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              loading={uploading}
            >
              Upload Document
            </Button>
          </div>
        </div>

        {uploadError && (
          <div className="error-banner">{uploadError}</div>
        )}

        <Card>
          {loading ? (
            <Loading message="Loading documents..." />
          ) : (
            <Table
              data={documents}
              columns={columns}
              emptyMessage="No documents found. Upload your first document to get started."
            />
          )}
        </Card>

        {selectedDocument && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </Layout>
  );
};

export default LegalDocuments;
