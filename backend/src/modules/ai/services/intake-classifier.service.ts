/**
 * Intake Classifier Service
 * AI-powered classification of legal inquiries
 */

import { openai } from '../../../config/ai';
import { Pool } from 'pg';
import pool from '../../../config/database';

interface ClassificationResult {
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

class IntakeClassifierService {
  /**
   * Classify legal inquiry and suggest department/director
   */
  async classify(firmId: string, intakeNotes: string, clientType?: string): Promise<ClassificationResult> {
    try {
      if (!openai) {
        // Fallback classification without AI
        return this.fallbackClassification();
      }

      // Get available departments and matter types for context
      const departmentsResult = await pool.query(`
        SELECT id, name, code FROM departments WHERE firm_id = $1 AND active = true
      `, [firmId]);

      const departments = departmentsResult.rows.map(d => `${d.name} (${d.code})`).join(', ');

      const prompt = `You are a legal intake specialist for a South African law firm.

Available practice areas: ${departments}

Analyze this legal inquiry and classify it:

Client Type: ${clientType || 'Unknown'}
Inquiry: ${intakeNotes}

Provide a JSON response with:
{
  "department": "Most appropriate practice area (e.g., Litigation, Corporate, Conveyancing, Labour, Tax, Family, IP)",
  "matterType": "Specific matter type (e.g., 'Litigation - Contract Dispute', 'Corporate - M&A Transaction')",
  "urgency": "low | medium | high",
  "estimatedValue": number (estimated rand value if applicable),
  "confidence": 0.0-1.0 (how confident you are),
  "reasoning": "Brief explanation of classification"
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const classification = JSON.parse(response.choices[0].message.content || '{}');

      // Map department name to department ID
      const deptMatch = departmentsResult.rows.find(d =>
        d.name.toLowerCase() === classification.department?.toLowerCase() ||
        d.code.toLowerCase() === classification.department?.toLowerCase()
      );

      if (deptMatch) {
        classification.departmentId = deptMatch.id;

        // Get suggested director from department
        const directorResult = await pool.query(`
          SELECT u.id, u.first_name, u.last_name
          FROM users u
          JOIN user_departments ud ON ud.user_id = u.id
          WHERE ud.department_id = $1 AND ud.is_director = true
          AND u.is_active = true
          LIMIT 1
        `, [deptMatch.id]);

        if (directorResult.rows.length > 0) {
          const director = directorResult.rows[0];
          classification.suggestedDirector = `${director.first_name} ${director.last_name}`;
          classification.suggestedDirectorId = director.id;
        }
      }

      // Store AI insight
      await this.storeInsight(firmId, null, classification);

      return classification;

    } catch (error) {
      console.error('Intake classification error:', error);
      return this.fallbackClassification();
    }
  }

  /**
   * Fallback classification when AI is unavailable
   */
  private fallbackClassification(): ClassificationResult {
    return {
      department: 'Unknown',
      matterType: 'General Legal Matter',
      urgency: 'medium',
      confidence: 0.1,
      reasoning: 'AI classification unavailable - manual classification required'
    };
  }

  /**
   * Store classification insight
   */
  private async storeInsight(firmId: string, entityId: string | null, classification: any): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO ai_insights (firm_id, entity_type, entity_id, insight_type, insight_data, confidence)
        VALUES ($1, 'matter', $2, 'intake_classification', $3, $4)
      `, [firmId, entityId, JSON.stringify(classification), classification.confidence]);
    } catch (error) {
      console.error('Failed to store AI insight:', error);
    }
  }

  /**
   * Batch classify multiple inquiries
   */
  async classifyBatch(firmId: string, inquiries: Array<{ id: string; notes: string; clientType?: string }>): Promise<Map<string, ClassificationResult>> {
    const results = new Map<string, ClassificationResult>();

    for (const inquiry of inquiries) {
      const classification = await this.classify(firmId, inquiry.notes, inquiry.clientType);
      results.set(inquiry.id, classification);
    }

    return results;
  }

  /**
   * Update matter with AI classification
   */
  async applyClassificationToMatter(matterId: string, classification: ClassificationResult): Promise<void> {
    try {
      await pool.query(`
        UPDATE deals SET
          ai_intake_classification = $1,
          ai_suggested_department_id = $2,
          ai_suggested_director_id = $3,
          ai_classification_confidence = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `, [
        JSON.stringify(classification),
        classification.departmentId,
        classification.suggestedDirectorId,
        classification.confidence,
        matterId
      ]);
    } catch (error) {
      console.error('Failed to apply classification to matter:', error);
      throw error;
    }
  }

  /**
   * Get classification history for a firm
   */
  async getClassificationHistory(firmId: string, limit: number = 50): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT
          ai.id,
          ai.entity_id,
          ai.insight_data,
          ai.confidence,
          ai.generated_at,
          d.title AS matter_title,
          d.matter_number
        FROM ai_insights ai
        LEFT JOIN deals d ON d.id = ai.entity_id
        WHERE ai.firm_id = $1
        AND ai.insight_type = 'intake_classification'
        ORDER BY ai.generated_at DESC
        LIMIT $2
      `, [firmId, limit]);

      return result.rows;
    } catch (error) {
      console.error('Failed to get classification history:', error);
      return [];
    }
  }
}

export default new IntakeClassifierService();
