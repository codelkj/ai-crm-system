/**
 * FICA Gap Detector Service
 * Detects missing FICA compliance documents
 */

import { openai } from '../../../config/ai';
import pool from '../../../config/database';

interface FICAGap {
  documentCode: string;
  documentName: string;
  status: 'missing' | 'expired' | 'pending_verification';
  required: boolean;
  expiryDate?: string;
  daysOverdue?: number;
}

interface FICAAnalysis {
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

class FICADetectorService {
  /**
   * Detect FICA compliance gaps for a client
   */
  async detectGaps(clientId: string): Promise<FICAAnalysis> {
    try {
      // Get client info
      const clientResult = await pool.query(`
        SELECT id, name, client_type, firm_id FROM companies WHERE id = $1
      `, [clientId]);

      if (clientResult.rows.length === 0) {
        throw new Error('Client not found');
      }

      const client = clientResult.rows[0];

      // Get required FICA documents for this client type
      const requiredDocsResult = await pool.query(`
        SELECT
          fd.id,
          fd.document_code,
          fd.document_name,
          fd.required_for_entity_type,
          cfd.status,
          cfd.submitted_date,
          cfd.verified_date,
          cfd.expiry_date,
          cfd.notes
        FROM fica_documents fd
        LEFT JOIN client_fica_documents cfd ON cfd.fica_document_id = fd.id AND cfd.client_id = $1
        WHERE fd.firm_id = $2
        AND fd.active = true
        AND (fd.required_for_entity_type = $3 OR fd.required_for_entity_type = 'both')
        ORDER BY fd.document_name
      `, [clientId, client.firm_id, client.client_type]);

      const requiredDocs = requiredDocsResult.rows;
      const missingDocuments: FICAGap[] = [];
      const expiringSoon: FICAGap[] = [];

      const totalRequired = requiredDocs.length;
      let completedCount = 0;

      for (const doc of requiredDocs) {
        if (!doc.status || doc.status === 'not_submitted') {
          missingDocuments.push({
            documentCode: doc.document_code,
            documentName: doc.document_name,
            status: 'missing',
            required: true
          });
        } else if (doc.status === 'verified') {
          completedCount++;

          // Check if expiring soon (within 30 days)
          if (doc.expiry_date) {
            const expiryDate = new Date(doc.expiry_date);
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
              expiringSoon.push({
                documentCode: doc.document_code,
                documentName: doc.document_name,
                status: 'missing',
                required: true,
                expiryDate: doc.expiry_date,
                daysOverdue: -daysUntilExpiry
              });
            } else if (daysUntilExpiry <= 0) {
              missingDocuments.push({
                documentCode: doc.document_code,
                documentName: doc.document_name,
                status: 'expired',
                required: true,
                expiryDate: doc.expiry_date,
                daysOverdue: Math.abs(daysUntilExpiry)
              });
              completedCount--;
            }
          }
        } else if (doc.status === 'submitted') {
          missingDocuments.push({
            documentCode: doc.document_code,
            documentName: doc.document_name,
            status: 'pending_verification',
            required: true
          });
        }
      }

      const completionPercentage = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0;

      let complianceStatus: 'complete' | 'in_progress' | 'not_started' = 'not_started';
      if (completionPercentage === 100) {
        complianceStatus = 'complete';
      } else if (completionPercentage > 0) {
        complianceStatus = 'in_progress';
      }

      // Generate AI recommendations
      const recommendations = await this.generateRecommendations(
        client,
        missingDocuments,
        expiringSoon
      );

      const analysis: FICAAnalysis = {
        clientId: client.id,
        clientName: client.name,
        clientType: client.client_type,
        complianceStatus,
        completionPercentage,
        missingDocuments,
        expiringSoon,
        recommendations,
        lastChecked: new Date()
      };

      // Store AI insight
      await this.storeInsight(client.firm_id, clientId, analysis);

      // Update client FICA status
      await this.updateClientFICAStatus(clientId, complianceStatus);

      return analysis;

    } catch (error) {
      console.error('FICA gap detection error:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateRecommendations(
    client: any,
    missingDocs: FICAGap[],
    expiringSoon: FICAGap[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Basic rule-based recommendations
    if (missingDocs.length === 0 && expiringSoon.length === 0) {
      recommendations.push('✅ All FICA documents are complete and up to date');
      return recommendations;
    }

    if (missingDocs.some(d => d.status === 'expired')) {
      recommendations.push('🔴 URGENT: Expired documents must be renewed immediately to maintain compliance');
    }

    if (missingDocs.length > 0) {
      recommendations.push(`📄 Request ${missingDocs.length} missing document(s) from client: ${missingDocs.map(d => d.documentName).join(', ')}`);
    }

    if (expiringSoon.length > 0) {
      recommendations.push(`⏰ ${expiringSoon.length} document(s) expiring within 30 days - schedule renewals proactively`);
    }

    // Try to get AI-enhanced recommendations
    if (openai && (missingDocs.length > 0 || expiringSoon.length > 0)) {
      try {
        const prompt = `As a FICA compliance specialist for a South African law firm:

Client: ${client.name} (${client.client_type})
Missing documents: ${missingDocs.map(d => d.documentName).join(', ')}
Expiring soon: ${expiringSoon.map(d => d.documentName).join(', ')}

Provide 2-3 specific, actionable recommendations for achieving FICA compliance. Be practical and concise.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.3
        });

        const aiRecommendations = response.choices[0].message.content?.split('\n').filter(r => r.trim());
        if (aiRecommendations && aiRecommendations.length > 0) {
          recommendations.push(...aiRecommendations.slice(0, 3));
        }
      } catch (error) {
        console.error('AI recommendations failed:', error);
      }
    }

    return recommendations;
  }

  /**
   * Store FICA analysis as AI insight
   */
  private async storeInsight(firmId: string, clientId: string, analysis: FICAAnalysis): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO ai_insights (firm_id, entity_type, entity_id, insight_type, insight_data, confidence)
        VALUES ($1, 'client', $2, 'fica_gap', $3, $4)
      `, [firmId, clientId, JSON.stringify(analysis), 0.95]);
    } catch (error) {
      console.error('Failed to store FICA insight:', error);
    }
  }

  /**
   * Update client FICA status
   */
  private async updateClientFICAStatus(clientId: string, status: string): Promise<void> {
    try {
      await pool.query(`
        UPDATE companies SET
          fica_status = $1,
          fica_completed_date = CASE WHEN $1 = 'complete' THEN CURRENT_DATE ELSE NULL END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [status, clientId]);
    } catch (error) {
      console.error('Failed to update FICA status:', error);
    }
  }

  /**
   * Batch analyze FICA compliance for multiple clients
   */
  async analyzeBatch(firmId: string, clientIds: string[]): Promise<FICAAnalysis[]> {
    const results: FICAAnalysis[] = [];

    for (const clientId of clientIds) {
      try {
        const analysis = await this.detectGaps(clientId);
        results.push(analysis);
      } catch (error) {
        console.error(`FICA analysis failed for client ${clientId}:`, error);
      }
    }

    return results;
  }

  /**
   * Get FICA compliance summary for firm
   */
  async getFirmComplianceSummary(firmId: string): Promise<any> {
    try {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_clients,
          COUNT(CASE WHEN fica_status = 'complete' THEN 1 END) as compliant_clients,
          COUNT(CASE WHEN fica_status = 'in_progress' THEN 1 END) as in_progress_clients,
          COUNT(CASE WHEN fica_status = 'not_started' OR fica_status IS NULL THEN 1 END) as non_compliant_clients,
          ROUND(AVG(CASE WHEN fica_status = 'complete' THEN 100 WHEN fica_status = 'in_progress' THEN 50 ELSE 0 END), 2) as avg_compliance_score
        FROM companies
        WHERE firm_id = $1
      `, [firmId]);

      return result.rows[0];
    } catch (error) {
      console.error('Failed to get compliance summary:', error);
      throw error;
    }
  }

  /**
   * Get clients with FICA gaps
   */
  async getClientsWithGaps(firmId: string): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT
          c.id,
          c.name,
          c.client_type,
          c.fica_status,
          fc.missing_docs,
          fc.pending_docs,
          fc.missing_document_names
        FROM companies c
        LEFT JOIN v_fica_compliance fc ON fc.client_id = c.id
        WHERE c.firm_id = $1
        AND c.fica_status != 'complete'
        ORDER BY fc.missing_docs DESC
      `, [firmId]);

      return result.rows;
    } catch (error) {
      console.error('Failed to get clients with gaps:', error);
      return [];
    }
  }
}

export default new FICADetectorService();
