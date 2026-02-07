/**
 * Legal Module Types
 */

export enum DocumentProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface LegalDocument {
  id: string;
  title: string;
  document_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  company_id?: string;
  deal_id?: string;
  processing_status: DocumentProcessingStatus;
  summary?: string;
  uploaded_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExtractedTerm {
  id: string;
  document_id: string;
  term_type: 'party' | 'date' | 'obligation' | 'amount' | 'clause';
  term_key: string;
  term_value: string;
  confidence: number;
  page_number?: number;
  created_at: Date;
}

export interface CreateDocumentDTO {
  title: string;
  document_type: string;
  company_id?: string;
  deal_id?: string;
}

export interface UploadDocumentDTO extends CreateDocumentDTO {
  file: Express.Multer.File;
}

export interface DocumentWithTerms extends LegalDocument {
  terms: ExtractedTerm[];
}

export interface SearchTermsQuery {
  document_id?: string;
  term_type?: string;
  search?: string;
}
