/**
 * AI Extractor Service - Mock AI Processing
 * Simulates GPT-4 extraction without API calls
 */

import { ExtractedTerm } from '../types/legal.types';
// Prompts are referenced in comments for production use
// import { LEGAL_EXTRACTION_PROMPT, LEGAL_SUMMARY_PROMPT } from '../prompts/extraction.prompt';

interface MockExtractionResult {
  terms: Array<{
    term_type: 'party' | 'date' | 'obligation' | 'amount' | 'clause';
    term_key: string;
    term_value: string;
    confidence: number;
    page_number?: number;
  }>;
  summary: string;
}

export class AIExtractorService {
  /**
   * Mock AI extraction - generates realistic extracted terms based on document title
   * In production, this would call OpenAI API with LEGAL_EXTRACTION_PROMPT
   */
  static async extractTerms(
    documentId: string,
    documentTitle: string,
    documentType: string
  ): Promise<{ terms: Omit<ExtractedTerm, 'id' | 'created_at'>[]; summary: string }> {
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData = this.generateMockExtraction(documentTitle, documentType);

    // Transform mock data to ExtractedTerm format
    const terms = mockData.terms.map((term) => ({
      document_id: documentId,
      term_type: term.term_type,
      term_key: term.term_key,
      term_value: term.term_value,
      confidence: term.confidence,
      page_number: term.page_number,
    }));

    return {
      terms,
      summary: mockData.summary,
    };
  }

  /**
   * Generate mock extraction results based on document title and type
   */
  private static generateMockExtraction(title: string, docType: string): MockExtractionResult {
    const titleLower = title.toLowerCase();

    // Generate contextual terms based on document title
    const terms: MockExtractionResult['terms'] = [];

    // Parties
    if (titleLower.includes('service') || titleLower.includes('agreement')) {
      terms.push(
        {
          term_type: 'party',
          term_key: 'client_name',
          term_value: 'Acme Corporation',
          confidence: 0.95,
          page_number: 1,
        },
        {
          term_type: 'party',
          term_key: 'vendor_name',
          term_value: 'TechStart Inc',
          confidence: 0.93,
          page_number: 1,
        }
      );
    } else if (titleLower.includes('employment') || titleLower.includes('nda')) {
      terms.push(
        {
          term_type: 'party',
          term_key: 'employer_name',
          term_value: 'Global Solutions LLC',
          confidence: 0.96,
          page_number: 1,
        },
        {
          term_type: 'party',
          term_key: 'employee_name',
          term_value: 'John Smith',
          confidence: 0.94,
          page_number: 1,
        }
      );
    } else {
      terms.push(
        {
          term_type: 'party',
          term_key: 'party_a',
          term_value: 'First Party LLC',
          confidence: 0.92,
          page_number: 1,
        },
        {
          term_type: 'party',
          term_key: 'party_b',
          term_value: 'Second Party Inc',
          confidence: 0.91,
          page_number: 1,
        }
      );
    }

    // Dates
    const currentDate = new Date();
    const effectiveDate = new Date(currentDate);
    effectiveDate.setDate(currentDate.getDate() - 30);
    const terminationDate = new Date(currentDate);
    terminationDate.setFullYear(currentDate.getFullYear() + 1);
    const renewalDate = new Date(terminationDate);
    renewalDate.setDate(terminationDate.getDate() - 30);

    terms.push(
      {
        term_type: 'date',
        term_key: 'effective_date',
        term_value: effectiveDate.toISOString().split('T')[0],
        confidence: 0.97,
        page_number: 1,
      },
      {
        term_type: 'date',
        term_key: 'termination_date',
        term_value: terminationDate.toISOString().split('T')[0],
        confidence: 0.95,
        page_number: 1,
      },
      {
        term_type: 'date',
        term_key: 'renewal_date',
        term_value: renewalDate.toISOString().split('T')[0],
        confidence: 0.89,
        page_number: 5,
      }
    );

    // Amounts
    if (titleLower.includes('service') || titleLower.includes('consulting')) {
      terms.push(
        {
          term_type: 'amount',
          term_key: 'contract_value',
          term_value: '$150,000.00',
          confidence: 0.98,
          page_number: 2,
        },
        {
          term_type: 'amount',
          term_key: 'monthly_fee',
          term_value: '$12,500.00',
          confidence: 0.96,
          page_number: 2,
        },
        {
          term_type: 'amount',
          term_key: 'late_payment_penalty',
          term_value: '1.5% per month',
          confidence: 0.87,
          page_number: 3,
        }
      );
    } else if (titleLower.includes('license')) {
      terms.push(
        {
          term_type: 'amount',
          term_key: 'license_fee',
          term_value: '$75,000.00',
          confidence: 0.97,
          page_number: 2,
        },
        {
          term_type: 'amount',
          term_key: 'annual_maintenance',
          term_value: '$15,000.00',
          confidence: 0.94,
          page_number: 2,
        }
      );
    } else {
      terms.push(
        {
          term_type: 'amount',
          term_key: 'total_value',
          term_value: '$100,000.00',
          confidence: 0.95,
          page_number: 2,
        }
      );
    }

    // Obligations
    if (titleLower.includes('service')) {
      terms.push(
        {
          term_type: 'obligation',
          term_key: 'payment_terms',
          term_value: 'Net 30 days from invoice date',
          confidence: 0.93,
          page_number: 3,
        },
        {
          term_type: 'obligation',
          term_key: 'deliverables',
          term_value: 'Monthly status reports, quarterly reviews, and project documentation',
          confidence: 0.91,
          page_number: 3,
        },
        {
          term_type: 'obligation',
          term_key: 'service_level',
          term_value: '99.5% uptime guarantee with 24/7 support',
          confidence: 0.88,
          page_number: 4,
        }
      );
    } else if (titleLower.includes('employment')) {
      terms.push(
        {
          term_type: 'obligation',
          term_key: 'work_hours',
          term_value: '40 hours per week, Monday to Friday',
          confidence: 0.94,
          page_number: 2,
        },
        {
          term_type: 'obligation',
          term_key: 'benefits',
          term_value: 'Health insurance, 401(k) matching, paid time off',
          confidence: 0.90,
          page_number: 3,
        }
      );
    } else {
      terms.push(
        {
          term_type: 'obligation',
          term_key: 'payment_schedule',
          term_value: 'Quarterly installments',
          confidence: 0.92,
          page_number: 2,
        },
        {
          term_type: 'obligation',
          term_key: 'performance_requirements',
          term_value: 'Meet agreed-upon milestones and quality standards',
          confidence: 0.89,
          page_number: 3,
        }
      );
    }

    // Clauses
    terms.push(
      {
        term_type: 'clause',
        term_key: 'confidentiality',
        term_value:
          'Both parties agree to maintain confidentiality of proprietary information for 3 years',
        confidence: 0.96,
        page_number: 5,
      },
      {
        term_type: 'clause',
        term_key: 'termination',
        term_value: 'Either party may terminate with 60 days written notice',
        confidence: 0.94,
        page_number: 6,
      },
      {
        term_type: 'clause',
        term_key: 'liability',
        term_value: 'Liability limited to contract value, excluding gross negligence',
        confidence: 0.91,
        page_number: 7,
      },
      {
        term_type: 'clause',
        term_key: 'governing_law',
        term_value: 'State of California, USA',
        confidence: 0.97,
        page_number: 8,
      },
      {
        term_type: 'clause',
        term_key: 'dispute_resolution',
        term_value: 'Binding arbitration in accordance with AAA rules',
        confidence: 0.88,
        page_number: 8,
      }
    );

    // Generate summary
    const summary = this.generateMockSummary(title, docType, terms);

    return { terms, summary };
  }

  /**
   * Generate mock document summary
   */
  private static generateMockSummary(
    title: string,
    docType: string,
    terms: MockExtractionResult['terms']
  ): string {
    const parties = terms.filter((t) => t.term_type === 'party');
    const dates = terms.filter((t) => t.term_type === 'date');
    const amounts = terms.filter((t) => t.term_type === 'amount');

    const partyNames = parties.map((p) => p.term_value).join(' and ');
    const effectiveDate = dates.find((d) => d.term_key === 'effective_date')?.term_value;
    const terminationDate = dates.find((d) => d.term_key === 'termination_date')?.term_value;
    const contractValue = amounts.find((a) => a.term_key.includes('value') || a.term_key.includes('fee'))
      ?.term_value;

    return `This ${docType} titled "${title}" is an agreement between ${partyNames}.
The contract is effective from ${effectiveDate} and remains valid until ${terminationDate}.
${contractValue ? `The total contract value is ${contractValue}.` : ''}

The agreement outlines key obligations including payment terms, deliverables, and service level commitments.
It includes standard clauses for confidentiality, termination rights, liability limitations, and dispute resolution.

The document specifies governing law and includes provisions for contract renewal and modification.
Both parties are bound by confidentiality obligations extending beyond the contract term.

Key terms include specific performance requirements, payment schedules, and termination conditions.
The agreement provides for dispute resolution through binding arbitration and includes limitations on liability.`;
  }

  /**
   * In production, this would call OpenAI API
   * For now, it returns a note about mock processing
   */
  static getMockProcessingNote(): string {
    return 'Note: Using mock AI extraction. In production, this would use OpenAI GPT-4 with the LEGAL_EXTRACTION_PROMPT.';
  }
}
