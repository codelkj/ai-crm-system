/**
 * Terms Service
 */

import { v4 as uuidv4 } from 'uuid';
import { ExtractedTerm, SearchTermsQuery } from '../types/legal.types';
import { AppError } from '../../../shared/middleware/error-handler';

// Mock extracted terms database
const mockTerms: ExtractedTerm[] = [];

export class TermsService {
  /**
   * Get all terms for a specific document
   */
  static async getByDocumentId(documentId: string): Promise<ExtractedTerm[]> {
    const terms = mockTerms.filter((t) => t.document_id === documentId);

    // Sort by term_type and confidence
    return terms.sort((a, b) => {
      if (a.term_type !== b.term_type) {
        const typeOrder = { party: 1, date: 2, amount: 3, obligation: 4, clause: 5 };
        return typeOrder[a.term_type] - typeOrder[b.term_type];
      }
      return b.confidence - a.confidence;
    });
  }

  /**
   * Search terms across documents
   */
  static async search(query: SearchTermsQuery) {
    let filtered = [...mockTerms];

    // Filter by document ID
    if (query.document_id) {
      filtered = filtered.filter((t) => t.document_id === query.document_id);
    }

    // Filter by term type
    if (query.term_type) {
      filtered = filtered.filter((t) => t.term_type === query.term_type);
    }

    // Search in term_key or term_value
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.term_key.toLowerCase().includes(searchLower) ||
          t.term_value.toLowerCase().includes(searchLower)
      );
    }

    // Sort by confidence (highest first)
    return filtered.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Create multiple terms at once (used during document processing)
   */
  static async createBulk(
    terms: Omit<ExtractedTerm, 'id' | 'created_at'>[]
  ): Promise<ExtractedTerm[]> {
    const createdTerms: ExtractedTerm[] = terms.map((term) => ({
      id: uuidv4(),
      ...term,
      created_at: new Date(),
    }));

    mockTerms.push(...createdTerms);
    return createdTerms;
  }

  /**
   * Delete all terms for a document (when document is deleted)
   */
  static async deleteByDocumentId(documentId: string): Promise<void> {
    const indicesToRemove: number[] = [];

    mockTerms.forEach((term, index) => {
      if (term.document_id === documentId) {
        indicesToRemove.push(index);
      }
    });

    // Remove in reverse order to maintain correct indices
    for (let i = indicesToRemove.length - 1; i >= 0; i--) {
      mockTerms.splice(indicesToRemove[i], 1);
    }
  }

  /**
   * Get terms grouped by type for a document
   */
  static async getGroupedByType(documentId: string): Promise<{
    parties: ExtractedTerm[];
    dates: ExtractedTerm[];
    obligations: ExtractedTerm[];
    amounts: ExtractedTerm[];
    clauses: ExtractedTerm[];
  }> {
    const terms = await this.getByDocumentId(documentId);

    return {
      parties: terms.filter((t) => t.term_type === 'party'),
      dates: terms.filter((t) => t.term_type === 'date'),
      obligations: terms.filter((t) => t.term_type === 'obligation'),
      amounts: terms.filter((t) => t.term_type === 'amount'),
      clauses: terms.filter((t) => t.term_type === 'clause'),
    };
  }

  /**
   * Get statistics about extracted terms
   */
  static async getStatistics(documentId?: string): Promise<{
    total: number;
    byType: Record<string, number>;
    averageConfidence: number;
  }> {
    let terms = documentId ? mockTerms.filter((t) => t.document_id === documentId) : mockTerms;

    const byType = terms.reduce(
      (acc, term) => {
        acc[term.term_type] = (acc[term.term_type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averageConfidence =
      terms.length > 0 ? terms.reduce((sum, t) => sum + t.confidence, 0) / terms.length : 0;

    return {
      total: terms.length,
      byType,
      averageConfidence,
    };
  }

  /**
   * Get low confidence terms (for review)
   */
  static async getLowConfidenceTerms(
    documentId?: string,
    threshold = 0.9
  ): Promise<ExtractedTerm[]> {
    let terms = documentId ? mockTerms.filter((t) => t.document_id === documentId) : mockTerms;

    return terms
      .filter((t) => t.confidence < threshold)
      .sort((a, b) => a.confidence - b.confidence);
  }
}
