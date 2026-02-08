/**
 * AI Insights Controller
 * Handles all AI-powered analysis endpoints
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../../../shared/middleware/authenticate';
import intakeClassifier from '../services/intake-classifier.service';
import ficaDetector from '../services/fica-detector.service';
import documentSummarizer from '../services/document-summarizer.service';
import contractAnalyzer from '../services/contract-analyzer.service';

class AIInsightsController {
  /**
   * INTAKE CLASSIFICATION
   */

  // Classify a legal inquiry
  classifyIntake = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { notes, clientType } = req.body;
      const firm_id = req.user?.firm_id;

      if (!notes) {
        res.status(400).json({ success: false, message: 'Inquiry notes are required' });
        return;
      }

      const classification = await intakeClassifier.classify(firm_id, notes, clientType);

      res.json({
        success: true,
        data: classification
      });
    } catch (error: any) {
      console.error('Intake classification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Apply classification to a matter
  applyClassificationToMatter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { matterId } = req.params;
      const classification = req.body;

      await intakeClassifier.applyClassificationToMatter(matterId, classification);

      res.json({
        success: true,
        message: 'Classification applied to matter'
      });
    } catch (error: any) {
      console.error('Apply classification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get classification history
  getClassificationHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const firm_id = req.user?.firm_id;
      const limit = parseInt(req.query.limit as string) || 50;

      const history = await intakeClassifier.getClassificationHistory(firm_id, limit);

      res.json({
        success: true,
        data: history
      });
    } catch (error: any) {
      console.error('Classification history error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * FICA COMPLIANCE
   */

  // Detect FICA gaps for a client
  detectFICAGaps = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;

      const analysis = await ficaDetector.detectGaps(clientId);

      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      console.error('FICA gap detection error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get firm FICA compliance summary
  getFirmFICACompliance = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const firm_id = req.user?.firm_id;

      const summary = await ficaDetector.getFirmComplianceSummary(firm_id);
      const clientsWithGaps = await ficaDetector.getClientsWithGaps(firm_id);

      res.json({
        success: true,
        data: {
          summary,
          clientsWithGaps
        }
      });
    } catch (error: any) {
      console.error('FICA compliance summary error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Batch analyze FICA compliance
  batchAnalyzeFICA = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { clientIds } = req.body;
      const firm_id = req.user?.firm_id;

      if (!Array.isArray(clientIds) || clientIds.length === 0) {
        res.status(400).json({ success: false, message: 'clientIds array is required' });
        return;
      }

      const results = await ficaDetector.analyzeBatch(firm_id, clientIds);

      res.json({
        success: true,
        data: results
      });
    } catch (error: any) {
      console.error('Batch FICA analysis error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * DOCUMENT SUMMARIZATION
   */

  // Summarize a document
  summarizeDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { documentId } = req.params;
      const regenerate = req.query.regenerate === 'true';

      const summary = await documentSummarizer.getSummary(documentId, regenerate);

      if (!summary) {
        res.status(404).json({ success: false, message: 'Document not found or summarization failed' });
        return;
      }

      res.json({
        success: true,
        data: summary
      });
    } catch (error: any) {
      console.error('Document summarization error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Batch summarize documents
  batchSummarizeDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { documentIds } = req.body;

      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        res.status(400).json({ success: false, message: 'documentIds array is required' });
        return;
      }

      const results = await documentSummarizer.summarizeBatch(documentIds);

      res.json({
        success: true,
        data: Object.fromEntries(results)
      });
    } catch (error: any) {
      console.error('Batch document summarization error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get document processing stats
  getDocumentProcessingStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const firm_id = req.user?.firm_id;

      const stats = await documentSummarizer.getProcessingStats(firm_id);

      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Document processing stats error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * CONTRACT ANALYSIS
   */

  // Analyze a contract
  analyzeContract = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { documentId } = req.params;
      const regenerate = req.query.regenerate === 'true';

      const analysis = await contractAnalyzer.getAnalysis(documentId, regenerate);

      if (!analysis) {
        res.status(404).json({ success: false, message: 'Document not found or analysis failed' });
        return;
      }

      res.json({
        success: true,
        data: analysis
      });
    } catch (error: any) {
      console.error('Contract analysis error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Batch analyze contracts
  batchAnalyzeContracts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { documentIds } = req.body;

      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        res.status(400).json({ success: false, message: 'documentIds array is required' });
        return;
      }

      const results = await contractAnalyzer.analyzeBatch(documentIds);

      res.json({
        success: true,
        data: Object.fromEntries(results)
      });
    } catch (error: any) {
      console.error('Batch contract analysis error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get high-risk contracts
  getHighRiskContracts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const firm_id = req.user?.firm_id;
      const threshold = parseInt(req.query.threshold as string) || 70;

      const contracts = await contractAnalyzer.getHighRiskContracts(firm_id, threshold);

      res.json({
        success: true,
        data: contracts
      });
    } catch (error: any) {
      console.error('High-risk contracts error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Compare two contracts
  compareContracts = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { documentId1, documentId2 } = req.body;

      if (!documentId1 || !documentId2) {
        res.status(400).json({ success: false, message: 'Both documentId1 and documentId2 are required' });
        return;
      }

      const comparison = await contractAnalyzer.compareContracts(documentId1, documentId2);

      res.json({
        success: true,
        data: comparison
      });
    } catch (error: any) {
      console.error('Contract comparison error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  /**
   * GENERAL AI INSIGHTS
   */

  // Get all AI insights for an entity
  getEntityInsights = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { entityType, entityId } = req.params;
      const firm_id = req.user?.firm_id;

      const result = await this.queryInsights(firm_id, entityType, entityId);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error: any) {
      console.error('Entity insights error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Get recent AI insights
  getRecentInsights = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const firm_id = req.user?.firm_id;
      const limit = parseInt(req.query.limit as string) || 50;
      const insightType = req.query.type as string;

      const pool = require('../../../config/database').default;
      const query = insightType
        ? `SELECT * FROM ai_insights WHERE firm_id = $1 AND insight_type = $2 ORDER BY generated_at DESC LIMIT $3`
        : `SELECT * FROM ai_insights WHERE firm_id = $1 ORDER BY generated_at DESC LIMIT $2`;

      const params = insightType ? [firm_id, insightType, limit] : [firm_id, limit];
      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error: any) {
      console.error('Recent insights error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Helper: Query insights
  private async queryInsights(firmId: string, entityType: string, entityId: string): Promise<any> {
    const pool = require('../../../config/database').default;
    return await pool.query(`
      SELECT * FROM ai_insights
      WHERE firm_id = $1 AND entity_type = $2 AND entity_id = $3
      ORDER BY generated_at DESC
    `, [firmId, entityType, entityId]);
  }
}

export default new AIInsightsController();
