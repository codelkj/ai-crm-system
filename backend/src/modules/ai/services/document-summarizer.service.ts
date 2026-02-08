/**
 * Document Summarizer Service
 * AI-powered document summarization using GPT-4
 */

import { openai } from '../../../config/ai';
import pool from '../../../config/database';
import fs from 'fs/promises';
import path from 'path';
import pdf from 'pdf-parse';

interface DocumentSummary {
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

class DocumentSummarizerService {
  /**
   * Summarize a legal document
   */
  async summarize(documentId: string, maxSummaryLength: number = 500): Promise<DocumentSummary> {
    const startTime = Date.now();

    try {
      // Get document from database
      const docResult = await pool.query(`
        SELECT id, file_path, document_name, document_type, firm_id
        FROM legal_documents
        WHERE id = $1
      `, [documentId]);

      if (docResult.rows.length === 0) {
        throw new Error('Document not found');
      }

      const document = docResult.rows[0];

      // Extract text from PDF
      const text = await this.extractTextFromPDF(document.file_path);

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in document');
      }

      const wordCount = text.split(/\s+/).length;

      // Generate AI summary
      const summary = await this.generateAISummary(text, maxSummaryLength);

      // Extract key entities
      const entities = await this.extractEntities(text);

      const result: DocumentSummary = {
        documentId,
        summary: summary.summary,
        keyPoints: summary.keyPoints,
        entities,
        wordCount,
        confidence: summary.confidence,
        processingTime: Date.now() - startTime
      };

      // Store summary in database
      await this.storeSummary(document.firm_id, documentId, result);

      return result;

    } catch (error) {
      console.error('Document summarization error:', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF file
   */
  private async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Generate AI summary using GPT-4
   */
  private async generateAISummary(text: string, maxLength: number): Promise<{
    summary: string;
    keyPoints: string[];
    confidence: number;
  }> {
    if (!openai) {
      return this.fallbackSummary(text, maxLength);
    }

    try {
      // Truncate text if too long (GPT-4 token limit)
      const truncatedText = text.slice(0, 12000); // ~3000 tokens

      const prompt = `Summarize this legal document concisely. Provide:
1. A brief summary (${maxLength} characters max)
2. 3-5 key points as bullet points

Document:
${truncatedText}

Respond in JSON format:
{
  "summary": "Brief summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 800
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');

      return {
        summary: result.summary || 'Summary not available',
        keyPoints: result.keyPoints || [],
        confidence: 0.85
      };

    } catch (error) {
      console.error('AI summary generation failed:', error);
      return this.fallbackSummary(text, maxLength);
    }
  }

  /**
   * Fallback summary when AI is unavailable
   */
  private fallbackSummary(text: string, maxLength: number): {
    summary: string;
    keyPoints: string[];
    confidence: number;
  } {
    // Extract first few sentences as summary
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const summary = sentences.slice(0, 3).join(' ').slice(0, maxLength);

    return {
      summary: summary || 'Document summary not available',
      keyPoints: ['AI summarization unavailable'],
      confidence: 0.1
    };
  }

  /**
   * Extract key entities from text
   */
  private async extractEntities(text: string): Promise<{
    people?: string[];
    organizations?: string[];
    dates?: string[];
    amounts?: string[];
  }> {
    if (!openai) {
      return {};
    }

    try {
      const truncatedText = text.slice(0, 8000);

      const prompt = `Extract key entities from this legal document:
- People (names of individuals)
- Organizations (company names, institutions)
- Dates (important dates mentioned)
- Amounts (monetary amounts in Rands)

Document excerpt:
${truncatedText}

Respond in JSON format:
{
  "people": ["Name 1", "Name 2"],
  "organizations": ["Org 1"],
  "dates": ["Date 1"],
  "amounts": ["R 100,000"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 500
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error('Entity extraction failed:', error);
      return {};
    }
  }

  /**
   * Store summary in database
   */
  private async storeSummary(firmId: string, documentId: string, summary: DocumentSummary): Promise<void> {
    try {
      // Update legal_documents table
      await pool.query(`
        UPDATE legal_documents SET
          ai_summary = $1,
          ai_key_terms = $2,
          ai_processed = true,
          ai_processed_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [summary.summary, JSON.stringify({ keyPoints: summary.keyPoints, entities: summary.entities }), documentId]);

      // Store as AI insight
      await pool.query(`
        INSERT INTO ai_insights (firm_id, entity_type, entity_id, insight_type, insight_data, confidence)
        VALUES ($1, 'document', $2, 'document_summary', $3, $4)
      `, [firmId, documentId, JSON.stringify(summary), summary.confidence]);

    } catch (error) {
      console.error('Failed to store summary:', error);
    }
  }

  /**
   * Batch summarize multiple documents
   */
  async summarizeBatch(documentIds: string[]): Promise<Map<string, DocumentSummary>> {
    const results = new Map<string, DocumentSummary>();

    for (const documentId of documentIds) {
      try {
        const summary = await this.summarize(documentId);
        results.set(documentId, summary);
      } catch (error) {
        console.error(`Summarization failed for document ${documentId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get summary for a document (from cache if available)
   */
  async getSummary(documentId: string, regenerate: boolean = false): Promise<DocumentSummary | null> {
    try {
      if (!regenerate) {
        // Check if summary already exists
        const result = await pool.query(`
          SELECT ai_summary, ai_key_terms, ai_processed_at
          FROM legal_documents
          WHERE id = $1 AND ai_processed = true
        `, [documentId]);

        if (result.rows.length > 0) {
          const doc = result.rows[0];
          const keyTerms = doc.ai_key_terms || {};

          return {
            documentId,
            summary: doc.ai_summary,
            keyPoints: keyTerms.keyPoints || [],
            entities: keyTerms.entities || {},
            wordCount: 0,
            confidence: 0.85,
            processingTime: 0
          };
        }
      }

      // Generate new summary
      return await this.summarize(documentId);

    } catch (error) {
      console.error('Failed to get summary:', error);
      return null;
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(firmId: string): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_documents,
          COUNT(CASE WHEN ai_processed = true THEN 1 END) as processed_documents,
          COUNT(CASE WHEN ai_processed = false OR ai_processed IS NULL THEN 1 END) as unprocessed_documents,
          ROUND(AVG(CASE WHEN ai_processed = true THEN 1.0 ELSE 0.0 END) * 100, 2) as processing_rate
        FROM legal_documents
        WHERE firm_id = $1
      `, [firmId]);

      return result.rows[0];
    } catch (error) {
      console.error('Failed to get processing stats:', error);
      return {};
    }
  }
}

export default new DocumentSummarizerService();
