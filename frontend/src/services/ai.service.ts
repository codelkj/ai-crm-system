/**
 * AI Insights Service
 * Frontend API client for all AI-powered features
 */

import api from './api';

// =====================================================
// TYPES
// =====================================================

export interface IntakeClassification {
  department: string;
  departmentId?: string;
  matterType: string;
  suggestedDirector?: string;
  suggestedDirectorId?: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedValue?: number;
  confidence: number;
  reasoning: string;
}

export interface FICAGap {
  documentCode: string;
  documentName: string;
  status: 'missing' | 'expired' | 'pending_verification';
  required: boolean;
  expiryDate?: string;
  daysOverdue?: number;
}

export interface FICAAnalysis {
  clientId: string;
  clientName: string;
  clientType: string;
  complianceStatus: 'complete' | 'in_progress' | 'not_started';
  completionPercentage: number;
  missingDocuments: FICAGap[];
  expiringSoon: FICAGap[];
  recommendations: string[];
  aiInsights?: string;
  lastChecked: Date;
}

export interface DocumentSummary {
  documentId: string;
  summary: string;
  keyPoints: string[];
  entities: {
    people?: string[];
    organizations?: string[];
    dates?: string[];
    amounts?: string[];
  };
  wordCount: number;
  confidence: number;
  processingTime: number;
}

export interface ContractAnalysis {
  documentId: string;
  parties: Array<{ name: string; role: string }>;
  keyTerms: {
    effectiveDate?: string;
    terminationDate?: string;
    renewalTerms?: string;
    paymentTerms?: string;
    noticePeriod?: string;
  };
  obligations: Array<{
    party: string;
    obligation: string;
    deadline?: string;
  }>;
  risks: Array<{
    severity: 'low' | 'medium' | 'high';
    description: string;
    category: string;
  }>;
  unusualClauses: string[];
  recommendations: string[];
  overallRiskScore: number;
  confidence: number;
  analyzedAt: Date;
}

// =====================================================
// INTAKE CLASSIFICATION SERVICE
// =====================================================

export const intakeClassificationService = {
  /**
   * Classify a legal inquiry using AI
   */
  classify: async (notes: string, clientType?: string): Promise<IntakeClassification> => {
    const response = await api.post('/ai/intake/classify', { notes, clientType });
    return response.data.data;
  },

  /**
   * Apply classification to a matter
   */
  applyToMatter: async (matterId: string, classification: IntakeClassification) => {
    const response = await api.post(`/ai/intake/apply/${matterId}`, classification);
    return response.data;
  },

  /**
   * Get classification history
   */
  getHistory: async (limit: number = 50) => {
    const response = await api.get('/ai/intake/history', { params: { limit } });
    return response.data.data;
  }
};

// =====================================================
// FICA COMPLIANCE SERVICE
// =====================================================

export const ficaComplianceService = {
  /**
   * Detect FICA gaps for a client
   */
  detectGaps: async (clientId: string): Promise<FICAAnalysis> => {
    const response = await api.get(`/ai/fica/gaps/${clientId}`);
    return response.data.data;
  },

  /**
   * Get firm-wide FICA compliance summary
   */
  getComplianceSummary: async () => {
    const response = await api.get('/ai/fica/compliance-summary');
    return response.data.data;
  },

  /**
   * Batch analyze FICA compliance for multiple clients
   */
  batchAnalyze: async (clientIds: string[]) => {
    const response = await api.post('/ai/fica/batch-analyze', { clientIds });
    return response.data.data;
  }
};

// =====================================================
// DOCUMENT SUMMARIZATION SERVICE
// =====================================================

export const documentSummarizationService = {
  /**
   * Get or generate document summary
   */
  summarize: async (documentId: string, regenerate: boolean = false): Promise<DocumentSummary> => {
    const response = await api.get(`/ai/documents/summarize/${documentId}`, {
      params: { regenerate }
    });
    return response.data.data;
  },

  /**
   * Batch summarize multiple documents
   */
  batchSummarize: async (documentIds: string[]) => {
    const response = await api.post('/ai/documents/batch-summarize', { documentIds });
    return response.data.data;
  },

  /**
   * Get document processing statistics
   */
  getStats: async () => {
    const response = await api.get('/ai/documents/processing-stats');
    return response.data.data;
  }
};

// =====================================================
// CONTRACT ANALYSIS SERVICE
// =====================================================

export const contractAnalysisService = {
  /**
   * Analyze a contract
   */
  analyze: async (documentId: string, regenerate: boolean = false): Promise<ContractAnalysis> => {
    const response = await api.get(`/ai/contracts/analyze/${documentId}`, {
      params: { regenerate }
    });
    return response.data.data;
  },

  /**
   * Batch analyze multiple contracts
   */
  batchAnalyze: async (documentIds: string[]) => {
    const response = await api.post('/ai/contracts/batch-analyze', { documentIds });
    return response.data.data;
  },

  /**
   * Get high-risk contracts
   */
  getHighRisk: async (threshold: number = 70) => {
    const response = await api.get('/ai/contracts/high-risk', {
      params: { threshold }
    });
    return response.data.data;
  },

  /**
   * Compare two contracts
   */
  compare: async (documentId1: string, documentId2: string) => {
    const response = await api.post('/ai/contracts/compare', {
      documentId1,
      documentId2
    });
    return response.data.data;
  }
};

// =====================================================
// GENERAL AI INSIGHTS SERVICE
// =====================================================

export const aiInsightsService = {
  /**
   * Get AI insights for an entity
   */
  getEntityInsights: async (entityType: string, entityId: string) => {
    const response = await api.get(`/ai/insights/${entityType}/${entityId}`);
    return response.data.data;
  },

  /**
   * Get recent AI insights
   */
  getRecent: async (limit: number = 50, type?: string) => {
    const response = await api.get('/ai/insights/recent', {
      params: { limit, type }
    });
    return response.data.data;
  }
};
