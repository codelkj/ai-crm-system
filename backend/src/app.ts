/**
 * Express Application Setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './shared/middleware/error-handler';
import { requestLogger } from './shared/utils/logger';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import crmRoutes from './modules/crm/routes/crm.routes';
import salesRoutes from './modules/sales/routes/sales.routes';
import legalRoutes from './modules/legal/routes/legal.routes';
import financialRoutes from './modules/financial/routes/financial.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'AI-Enabled CRM Backend',
    version: '1.0.0',
    description: 'Backend API for AI-enabled CRM with financial analysis and legal document processing',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth',
      crm: '/api/v1/crm',
      sales: '/api/v1/sales',
      legal: '/api/v1/legal',
      financial: '/api/v1/financial'
    },
    documentation: {
      apiDesign: 'See API_DESIGN.md for endpoint documentation',
      quickStart: 'See QUICK_START.md for setup instructions'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/legal', legalRoutes);
app.use('/api/v1/financial', financialRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
