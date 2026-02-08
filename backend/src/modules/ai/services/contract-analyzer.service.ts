/**
 * Contract Analyzer Service
 * AI-powered contract analysis - extract terms, obligations, risks
 */

import { openai } from '../../../config/ai';
import pool from '../../../config/database';
import fs from 'fs/promises';
import pdf from 'pdf-parse';

interface ContractAnalysis {
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

class ContractAnalyzerService {
  /**
   * Analyze a contract document
   */
  async analyze(documentId: string): Promise<ContractAnalysis> {
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

      // Perform AI analysis
      const analysis = await this.performAIAnalysis(text);

      // Calculate overall risk score
      const riskScore = this.calculateRiskScore(analysis.risks);

      const result: ContractAnalysis = {
        documentId,
        ...analysis,
        overallRiskScore: riskScore,
        analyzedAt: new Date()
      };

      // Store analysis
      await this.storeAnalysis(document.firm_id, documentId, result);

      return result;

    } catch (error) {
      console.error('Contract analysis error:', error);
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
   * Perform AI-powered contract analysis
   */
  private async performAIAnalysis(contractText: string): Promise<Omit<ContractAnalysis, 'documentId' | 'overallRiskScore' | 'analyzedAt'>> {
    if (!openai) {
      return this.fallbackAnalysis();
    }

    try {
      // Truncate text if too long
      const truncatedText = contractText.slice(0, 15000);

      const prompt = `You are an expert South African commercial lawyer. Analyze this contract and provide:

1. **Parties**: List all parties with their roles (e.g., "Seller", "Buyer", "Lessor")
2. **Key Terms**: Extract effective date, termination date, renewal terms, payment terms, notice period
3. **Obligations**: List 3-5 main obligations for each party with deadlines if applicable
4. **Risks**: Identify 3-5 risk factors with severity (low/medium/high) and category (financial, legal, operational)
5. **Unusual Clauses**: Flag any unusual, one-sided, or concerning clauses
6. **Recommendations**: Provide 2-3 actionable recommendations for the client

Contract:
${truncatedText}

Respond in JSON format:
{
  "parties": [{"name": "Party A", "role": "Seller"}],
  "keyTerms": {
    "effectiveDate": "date",
    "terminationDate": "date",
    "renewalTerms": "description",
    "paymentTerms": "description",
    "noticePeriod": "period"
  },
  "obligations": [{"party": "Party A", "obligation": "description", "deadline": "date"}],
  "risks": [{"severity": "high", "description": "risk description", "category": "financial"}],
  "unusualClauses": ["clause description"],
  "recommendations": ["recommendation 1"],
  "confidence": 0.85
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 2000
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');

      return {
        parties: analysis.parties || [],
        keyTerms: analysis.keyTerms || {},
        obligations: analysis.obligations || [],
        risks: analysis.risks || [],
        unusualClauses: analysis.unusualClauses || [],
        recommendations: analysis.recommendations || [],
        confidence: analysis.confidence || 0.8
      };

    } catch (error) {
      console.error('AI contract analysis failed:', error);
      return this.fallbackAnalysis();
    }
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  private fallbackAnalysis(): Omit<ContractAnalysis, 'documentId' | 'overallRiskScore' | 'analyzedAt'> {
    return {
      parties: [],
      keyTerms: {},
      obligations: [],
      risks: [{
        severity: 'medium',
        description: 'AI analysis unavailable - manual review required',
        category: 'operational'
      }],
      unusualClauses: [],
      recommendations: ['Perform manual contract review', 'Engage legal counsel for detailed analysis'],
      confidence: 0.1
    };
  }

  /**
   * Calculate overall risk score (0-100)
   */
  private calculateRiskScore(risks: Array<{ severity: string }>): number {
    if (risks.length === 0) return 20;

    const weights = { high: 30, medium: 15, low: 5 };
    const totalScore = risks.reduce((sum, risk) => {
      return sum + (weights[risk.severity as keyof typeof weights] || 0);
    }, 0);

    // Normalize to 0-100 scale
    const maxPossibleScore = risks.length * weights.high;
    return Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100);
  }

  /**
   * Store contract analysis
   */
  private async storeAnalysis(firmId: string, documentId: string, analysis: ContractAnalysis): Promise<void> {
    try {
      // Store as AI insight
      await pool.query(`
        INSERT INTO ai_insights (firm_id, entity_type, entity_id, insight_type, insight_data, confidence)
        VALUES ($1, 'document', $2, 'contract_analysis', $3, $4)
        ON CONFLICT (entity_type, entity_id, insight_type)
        WHERE entity_type = 'document' AND entity_id = $2 AND insight_type = 'contract_analysis'
        DO UPDATE SET
          insight_data = EXCLUDED.insight_data,
          confidence = EXCLUDED.confidence,
          generated_at = CURRENT_TIMESTAMP
      `, [firmId, documentId, JSON.stringify(analysis), analysis.confidence]);

      // Update document with key terms
      await pool.query(`
        UPDATE legal_documents SET
          ai_key_terms = $1,
          ai_processed = true,
          ai_processed_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [JSON.stringify(analysis.keyTerms), documentId]);

    } catch (error) {
      console.error('Failed to store contract analysis:', error);
    }
  }

  /**
   * Get analysis for a document (from cache if available)
   */
  async getAnalysis(documentId: string, regenerate: boolean = false): Promise<ContractAnalysis | null> {
    try {
      if (!regenerate) {
        // Check if analysis already exists
        const result = await pool.query(`
          SELECT insight_data, confidence, generated_at
          FROM ai_insights
          WHERE entity_type = 'document'
          AND entity_id = $1
          AND insight_type = 'contract_analysis'
          ORDER BY generated_at DESC
          LIMIT 1
        `, [documentId]);

        if (result.rows.length > 0) {
          const stored = result.rows[0];
          return {
            ...JSON.parse(stored.insight_data),
            analyzedAt: stored.generated_at
          };
        }
      }

      // Generate new analysis
      return await this.analyze(documentId);

    } catch (error) {
      console.error('Failed to get contract analysis:', error);
      return null;
    }
  }

  /**
   * Batch analyze multiple contracts
   */
  async analyzeBatch(documentIds: string[]): Promise<Map<string, ContractAnalysis>> {
    const results = new Map<string, ContractAnalysis>();

    for (const documentId of documentIds) {
      try {
        const analysis = await this.analyze(documentId);
        results.set(documentId, analysis);
      } catch (error) {
        console.error(`Contract analysis failed for document ${documentId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get high-risk contracts for a firm
   */
  async getHighRiskContracts(firmId: string, threshold: number = 70): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT
          ld.id,
          ld.document_name,
          ld.document_type,
          ld.uploaded_at,
          ai.insight_data,
          ai.confidence,
          (ai.insight_data->>'overallRiskScore')::int as risk_score
        FROM legal_documents ld
        JOIN ai_insights ai ON ai.entity_id = ld.id
        WHERE ld.firm_id = $1
        AND ai.entity_type = 'document'
        AND ai.insight_type = 'contract_analysis'
        AND (ai.insight_data->>'overallRiskScore')::int >= $2
        ORDER BY (ai.insight_data->>'overallRiskScore')::int DESC
      `, [firmId, threshold]);

      return result.rows.map(row => ({
        ...row,
        analysis: JSON.parse(row.insight_data)
      }));

    } catch (error) {
      console.error('Failed to get high-risk contracts:', error);
      return [];
    }
  }

  /**
   * Compare two contracts
   */
  async compareContracts(documentId1: string, documentId2: string): Promise<any> {
    try {
      const [analysis1, analysis2] = await Promise.all([
        this.getAnalysis(documentId1),
        this.getAnalysis(documentId2)
      ]);

      if (!analysis1 || !analysis2) {
        throw new Error('One or both contracts have not been analyzed');
      }

      return {
        document1: analysis1,
        document2: analysis2,
        differences: {
          riskScoreDiff: analysis1.overallRiskScore - analysis2.overallRiskScore,
          partyCount: analysis1.parties.length - analysis2.parties.length,
          riskCount: analysis1.risks.length - analysis2.risks.length
        }
      };

    } catch (error) {
      console.error('Contract comparison failed:', error);
      throw error;
    }
  }
}

export default new ContractAnalyzerService();
