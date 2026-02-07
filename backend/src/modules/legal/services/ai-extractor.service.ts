/**
 * AI Extractor Service - Real OpenAI Integration
 * Extracts legal terms from PDF documents using OpenAI GPT-4
 */

import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse';
import { getOpenAIClient } from '../../../config/ai';
import { ExtractedTerm } from '../types/legal.types';
import { LEGAL_EXTRACTION_PROMPT, LEGAL_SUMMARY_PROMPT } from '../prompts/extraction.prompt';

interface AIExtractionResult {
  terms: Array<{
    term_type: 'party' | 'date' | 'obligation' | 'amount' | 'clause';
    term_key: string;
    term_value: string;
    confidence: number;
    page_number?: number;
  }>;
}

export class AIExtractorService {
  /**
   * Extract text from PDF file
   */
  private static async extractTextFromPDF(filePath: string): Promise<{ text: string; numPages: number }> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);

      return {
        text: data.text,
        numPages: data.numpages
      };
    } catch (error: any) {
      console.error('PDF parsing error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract legal terms from document using OpenAI
   */
  static async extractTerms(
    documentId: string,
    documentTitle: string,
    documentType: string,
    filePath?: string
  ): Promise<{ terms: Omit<ExtractedTerm, 'id' | 'created_at'>[]; summary: string }> {
    const openai = getOpenAIClient();

    // Extract text from PDF if file path provided
    let documentText = '';
    if (filePath && fs.existsSync(filePath)) {
      const pdfData = await this.extractTextFromPDF(filePath);
      documentText = pdfData.text;

      // Limit text size to avoid token limits (max ~30k characters ≈ 7.5k tokens)
      if (documentText.length > 30000) {
        documentText = documentText.substring(0, 30000);
        console.warn(`Document text truncated to 30k characters for AI processing`);
      }
    }

    if (!documentText) {
      throw new Error('No document text available for extraction');
    }

    if (!openai) {
      console.warn('OpenAI not configured, using fallback extraction');
      return this.fallbackExtraction(documentTitle, documentType);
    }

    try {
      // Extract terms using OpenAI
      const extractedTerms = await this.callOpenAIForExtraction(documentText);

      // Generate summary using OpenAI
      const summary = await this.callOpenAIForSummary(documentText, documentTitle, documentType);

      // Transform to database format
      const terms = extractedTerms.map((term) => ({
        document_id: documentId,
        term_type: term.term_type,
        term_key: term.term_key,
        term_value: term.term_value,
        confidence: term.confidence,
        page_number: term.page_number,
      }));

      return {
        terms,
        summary,
      };
    } catch (error: any) {
      console.error('AI extraction failed, using fallback:', error);
      return this.fallbackExtraction(documentTitle, documentType);
    }
  }

  /**
   * Call OpenAI API for term extraction
   */
  private static async callOpenAIForExtraction(documentText: string): Promise<AIExtractionResult['terms']> {
    const openai = getOpenAIClient();
    if (!openai) {
      throw new Error('OpenAI not configured');
    }

    const prompt = LEGAL_EXTRACTION_PROMPT.replace('{document_text}', documentText);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a legal document analysis expert. Extract structured data from legal documents in valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Low temperature for consistent extraction
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const responseText = completion.choices[0].message.content;
      if (!responseText) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse JSON response
      const result: AIExtractionResult = JSON.parse(responseText);

      // Validate response structure
      if (!result.terms || !Array.isArray(result.terms)) {
        throw new Error('Invalid response structure: missing terms array');
      }

      // Validate each term
      const validTerms = result.terms.filter(term => {
        return (
          term.term_type &&
          term.term_key &&
          term.term_value &&
          typeof term.confidence === 'number' &&
          term.confidence >= 0 &&
          term.confidence <= 1
        );
      });

      if (validTerms.length === 0) {
        throw new Error('No valid terms extracted from response');
      }

      return validTerms;
    } catch (error: any) {
      console.error('OpenAI extraction error:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI API for document summary
   */
  private static async callOpenAIForSummary(
    documentText: string,
    documentTitle: string,
    documentType: string
  ): Promise<string> {
    const openai = getOpenAIClient();
    if (!openai) {
      return `${documentType} titled "${documentTitle}" - AI summary unavailable`;
    }

    const prompt = LEGAL_SUMMARY_PROMPT.replace('{document_text}', documentText);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a legal document summarization expert. Provide clear, concise summaries of legal documents.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      const summary = completion.choices[0].message.content;
      return summary || `${documentType} titled "${documentTitle}"`;
    } catch (error: any) {
      console.error('OpenAI summary error:', error);
      return `${documentType} titled "${documentTitle}" - Summary generation failed`;
    }
  }

  /**
   * Fallback extraction when AI is unavailable
   * Uses simple heuristics to extract basic information
   */
  private static fallbackExtraction(
    title: string,
    docType: string
  ): { terms: Omit<ExtractedTerm, 'id' | 'created_at'>[]; summary: string } {
    const documentId = 'temp'; // Will be replaced by caller

    const terms: Omit<ExtractedTerm, 'id' | 'created_at'>[] = [];

    // Add basic placeholder terms
    terms.push(
      {
        document_id: documentId,
        term_type: 'party',
        term_key: 'party_a',
        term_value: 'Party A (extraction pending)',
        confidence: 0.3,
        page_number: 1,
      },
      {
        document_id: documentId,
        term_type: 'party',
        term_key: 'party_b',
        term_value: 'Party B (extraction pending)',
        confidence: 0.3,
        page_number: 1,
      },
      {
        document_id: documentId,
        term_type: 'date',
        term_key: 'effective_date',
        term_value: new Date().toISOString().split('T')[0],
        confidence: 0.2,
        page_number: 1,
      }
    );

    const summary = `${docType} titled "${title}". AI extraction unavailable - please configure OpenAI API key for detailed term extraction and document summarization.`;

    return { terms, summary };
  }
}
