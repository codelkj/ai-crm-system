/**
 * Document Service
 */

import { v4 as uuidv4 } from 'uuid';
import {
  LegalDocument,
  CreateDocumentDTO,
  DocumentProcessingStatus,
  DocumentWithTerms,
} from '../types/legal.types';
import { AppError } from '../../../shared/middleware/error-handler';
import { CompanyService } from '../../crm/services/company.service';
import { DealService } from '../../sales/services/deal.service';
import { AIExtractorService } from './ai-extractor.service';
import { TermsService } from './terms.service';
import { getStoragePath } from '../../../config/storage';

// Mock documents database
const mockDocuments: LegalDocument[] = [];

// Initialize documents with mock data
let initialized = false;
async function initializeDocuments() {
  if (initialized) return;

  try {
    const companies = await CompanyService.getAll(1, 10);
    const deals = await DealService.getAll(1, 20);

    if (companies.data.length >= 3 && deals.data.length >= 5) {
      // Document 1: Master Services Agreement
      const doc1 = {
        id: uuidv4(),
        title: 'Master Services Agreement - Acme Corp',
        document_type: 'Service Agreement',
        file_path: getStoragePath('legal', 'msa-acme-2024.pdf'),
        file_size: 245678,
        mime_type: 'application/pdf',
        company_id: companies.data[0].id, // Acme Corporation
        deal_id: deals.data[0].id, // Enterprise Software License
        processing_status: DocumentProcessingStatus.COMPLETED,
        summary:
          'Comprehensive Master Services Agreement between Acme Corporation and TechStart Inc. Covers general terms for software development and consulting services, including payment terms, IP rights, and service level commitments.',
        uploaded_by: 'admin@example.com',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15'),
      };
      mockDocuments.push(doc1);

      // Document 2: Software License Agreement
      const doc2 = {
        id: uuidv4(),
        title: 'Enterprise Software License Agreement',
        document_type: 'License Agreement',
        file_path: getStoragePath('legal', 'license-agreement-2024.pdf'),
        file_size: 189432,
        mime_type: 'application/pdf',
        company_id: companies.data[1].id, // TechStart Inc
        deal_id: deals.data[1].id, // Cloud Migration Project
        processing_status: DocumentProcessingStatus.COMPLETED,
        summary:
          'Software license agreement granting TechStart Inc enterprise-wide usage rights. Includes maintenance and support terms, user limitations, and annual renewal provisions.',
        uploaded_by: 'admin@example.com',
        created_at: new Date('2024-01-20'),
        updated_at: new Date('2024-01-20'),
      };
      mockDocuments.push(doc2);

      // Document 3: Consulting Services Contract
      const doc3 = {
        id: uuidv4(),
        title: 'Consulting Services Contract - Global Solutions',
        document_type: 'Consulting Agreement',
        file_path: getStoragePath('legal', 'consulting-contract-2024.pdf'),
        file_size: 156890,
        mime_type: 'application/pdf',
        company_id: companies.data[2].id, // Global Solutions LLC
        deal_id: deals.data[2].id, // Consulting Services Package
        processing_status: DocumentProcessingStatus.COMPLETED,
        summary:
          'Professional consulting services agreement for digital transformation project. Defines scope of work, deliverables, payment milestones, and project timeline.',
        uploaded_by: 'admin@example.com',
        created_at: new Date('2024-02-01'),
        updated_at: new Date('2024-02-01'),
      };
      mockDocuments.push(doc3);

      // Document 4: Non-Disclosure Agreement
      const doc4 = {
        id: uuidv4(),
        title: 'Mutual Non-Disclosure Agreement',
        document_type: 'NDA',
        file_path: getStoragePath('legal', 'nda-mutual-2024.pdf'),
        file_size: 98765,
        mime_type: 'application/pdf',
        company_id: companies.data[0].id, // Acme Corporation
        deal_id: undefined,
        processing_status: DocumentProcessingStatus.COMPLETED,
        summary:
          'Bilateral confidentiality agreement protecting proprietary information exchanged during business discussions. Five-year confidentiality term with standard exceptions.',
        uploaded_by: 'admin@example.com',
        created_at: new Date('2024-01-10'),
        updated_at: new Date('2024-01-10'),
      };
      mockDocuments.push(doc4);

      // Document 5: Data Processing Agreement
      const doc5 = {
        id: uuidv4(),
        title: 'Data Processing Agreement - GDPR Compliant',
        document_type: 'DPA',
        file_path: getStoragePath('legal', 'dpa-gdpr-2024.pdf'),
        file_size: 213456,
        mime_type: 'application/pdf',
        company_id: companies.data[1].id, // TechStart Inc
        deal_id: deals.data[4].id, // Annual Support Contract
        processing_status: DocumentProcessingStatus.COMPLETED,
        summary:
          'GDPR-compliant Data Processing Agreement establishing data controller and processor responsibilities. Covers data security measures, breach notification, and sub-processing arrangements.',
        uploaded_by: 'admin@example.com',
        created_at: new Date('2024-01-25'),
        updated_at: new Date('2024-01-25'),
      };
      mockDocuments.push(doc5);

      // Document 6: Employment Agreement (pending processing)
      const doc6 = {
        id: uuidv4(),
        title: 'Executive Employment Agreement',
        document_type: 'Employment Contract',
        file_path: getStoragePath('legal', 'employment-exec-2024.pdf'),
        file_size: 178234,
        mime_type: 'application/pdf',
        company_id: companies.data[2].id, // Global Solutions LLC
        deal_id: undefined,
        processing_status: DocumentProcessingStatus.PENDING,
        summary: undefined,
        uploaded_by: 'admin@example.com',
        created_at: new Date('2024-02-10'),
        updated_at: new Date('2024-02-10'),
      };
      mockDocuments.push(doc6);

      // Pre-process completed documents to generate terms
      for (const doc of mockDocuments) {
        if (doc.processing_status === DocumentProcessingStatus.COMPLETED) {
          const extraction = await AIExtractorService.extractTerms(
            doc.id,
            doc.title,
            doc.document_type
          );
          await TermsService.createBulk(extraction.terms);
        }
      }
    }

    initialized = true;
  } catch (error) {
    console.error('Error initializing legal documents:', error);
  }
}

export class DocumentService {
  /**
   * Get all documents with pagination and filtering
   */
  static async getAll(
    page = 1,
    limit = 20,
    company_id?: string,
    deal_id?: string,
    status?: DocumentProcessingStatus
  ) {
    await initializeDocuments();
    let filtered = [...mockDocuments];

    // Filter by company
    if (company_id) {
      filtered = filtered.filter((d) => d.company_id === company_id);
    }

    // Filter by deal
    if (deal_id) {
      filtered = filtered.filter((d) => d.deal_id === deal_id);
    }

    // Filter by status
    if (status) {
      filtered = filtered.filter((d) => d.processing_status === status);
    }

    // Sort by created_at descending
    filtered.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = filtered.slice(start, end);

    return {
      data: paginated,
      meta: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  }

  /**
   * Get document by ID
   */
  static async getById(id: string): Promise<LegalDocument> {
    await initializeDocuments();
    const document = mockDocuments.find((d) => d.id === id);
    if (!document) {
      throw new AppError(404, 'Document not found', 'DOCUMENT_NOT_FOUND');
    }
    return document;
  }

  /**
   * Get document with extracted terms
   */
  static async getByIdWithTerms(id: string): Promise<DocumentWithTerms> {
    const document = await this.getById(id);
    const terms = await TermsService.getByDocumentId(id);

    return {
      ...document,
      terms,
    };
  }

  /**
   * Create new document (without file upload)
   */
  static async create(
    data: CreateDocumentDTO,
    filePath: string,
    fileSize: number,
    mimeType: string,
    uploadedBy: string
  ): Promise<LegalDocument> {
    await initializeDocuments();

    // Verify company exists if provided
    if (data.company_id) {
      await CompanyService.getById(data.company_id);
    }

    // Verify deal exists if provided
    if (data.deal_id) {
      await DealService.getById(data.deal_id);
    }

    const newDocument: LegalDocument = {
      id: uuidv4(),
      title: data.title,
      document_type: data.document_type,
      file_path: filePath,
      file_size: fileSize,
      mime_type: mimeType,
      company_id: data.company_id,
      deal_id: data.deal_id,
      processing_status: DocumentProcessingStatus.PENDING,
      summary: undefined,
      uploaded_by: uploadedBy,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockDocuments.push(newDocument);
    return newDocument;
  }

  /**
   * Delete document
   */
  static async delete(id: string): Promise<void> {
    await initializeDocuments();
    const index = mockDocuments.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new AppError(404, 'Document not found', 'DOCUMENT_NOT_FOUND');
    }

    const document = mockDocuments[index];

    // Delete associated terms
    await TermsService.deleteByDocumentId(id);

    // Delete file from storage (in production)
    // await deleteFile(document.file_path);

    // Remove from mock database
    mockDocuments.splice(index, 1);
  }

  /**
   * Process document with AI extraction
   */
  static async processDocument(id: string): Promise<LegalDocument> {
    await initializeDocuments();
    const index = mockDocuments.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new AppError(404, 'Document not found', 'DOCUMENT_NOT_FOUND');
    }

    const document = mockDocuments[index];

    try {
      // Update status to processing
      mockDocuments[index].processing_status = DocumentProcessingStatus.PROCESSING;
      mockDocuments[index].updated_at = new Date();

      // Mock AI extraction
      const extraction = await AIExtractorService.extractTerms(
        document.id,
        document.title,
        document.document_type
      );

      // Delete existing terms (if reprocessing)
      await TermsService.deleteByDocumentId(document.id);

      // Create new terms
      await TermsService.createBulk(extraction.terms);

      // Update document with summary and completed status
      mockDocuments[index].summary = extraction.summary;
      mockDocuments[index].processing_status = DocumentProcessingStatus.COMPLETED;
      mockDocuments[index].updated_at = new Date();

      return mockDocuments[index];
    } catch (error) {
      // Update status to failed
      mockDocuments[index].processing_status = DocumentProcessingStatus.FAILED;
      mockDocuments[index].updated_at = new Date();

      throw new AppError(500, 'Document processing failed', 'PROCESSING_FAILED');
    }
  }

  /**
   * Get processing statistics
   */
  static async getProcessingStats() {
    await initializeDocuments();

    const stats = {
      total: mockDocuments.length,
      pending: mockDocuments.filter((d) => d.processing_status === DocumentProcessingStatus.PENDING)
        .length,
      processing: mockDocuments.filter(
        (d) => d.processing_status === DocumentProcessingStatus.PROCESSING
      ).length,
      completed: mockDocuments.filter(
        (d) => d.processing_status === DocumentProcessingStatus.COMPLETED
      ).length,
      failed: mockDocuments.filter((d) => d.processing_status === DocumentProcessingStatus.FAILED)
        .length,
    };

    return stats;
  }
}
