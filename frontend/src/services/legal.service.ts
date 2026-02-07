/**
 * Legal API Service
 */

import api from './api';

export interface LegalDocument {
  id: string;
  title: string;
  document_type: string;
  file_path: string;
  company_id?: string;
  contact_id?: string;
  status: string;
  extracted_text?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
  company?: any;
  contact?: any;
}

export interface ExtractedTerm {
  id: string;
  document_id: string;
  term_type: string;
  term_text: string;
  confidence_score: number;
  page_number?: number;
  metadata?: any;
  created_at: string;
}

export const legalService = {
  // Documents
  getDocuments: async (params?: any) => {
    const response = await api.get('/legal/documents', { params });
    return response.data.data;
  },

  getDocument: async (id: string) => {
    const response = await api.get(`/legal/documents/${id}`);
    return response.data.data;
  },

  uploadDocument: async (formData: FormData) => {
    const response = await api.post('/legal/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  createDocument: async (data: Partial<LegalDocument>) => {
    const response = await api.post('/legal/documents/create', data);
    return response.data.data;
  },

  deleteDocument: async (id: string) => {
    const response = await api.delete(`/legal/documents/${id}`);
    return response.data.data;
  },

  reprocessDocument: async (id: string) => {
    const response = await api.post(`/legal/documents/${id}/reprocess`);
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/legal/documents/stats');
    return response.data.data;
  },

  // Terms
  getTermsByDocument: async (documentId: string) => {
    const response = await api.get(`/legal/documents/${documentId}/terms`);
    return response.data.data;
  },

  getGroupedTerms: async (documentId: string) => {
    const response = await api.get(`/legal/documents/${documentId}/terms/grouped`);
    return response.data.data;
  },

  searchTerms: async (params: any) => {
    const response = await api.get('/legal/terms/search', { params });
    return response.data.data;
  },

  getTermStatistics: async () => {
    const response = await api.get('/legal/terms/statistics');
    return response.data.data;
  },

  getLowConfidenceTerms: async (threshold?: number) => {
    const response = await api.get('/legal/terms/low-confidence', {
      params: { threshold },
    });
    return response.data.data;
  },
};
