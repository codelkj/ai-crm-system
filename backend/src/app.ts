/**
 * Express Application Setup
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import redoc from 'redoc-express';
import { errorHandler } from './shared/middleware/error-handler';
import { requestLogger } from './shared/utils/logger';
import { swaggerSpec } from './config/swagger';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import crmRoutes from './modules/crm/routes/crm.routes';
import salesRoutes from './modules/sales/routes/sales.routes';
import legalRoutes from './modules/legal/routes/legal.routes';
import financialRoutes from './modules/financial/routes/financial.routes';
import aiAssistantRoutes from './modules/ai-assistant/routes/assistant.routes';

const app = express();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
}));
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
      financial: '/api/v1/financial',
      aiAssistant: '/api/v1/ai-assistant'
    },
    documentation: {
      swagger: '/api/v1/docs',
      redoc: '/api/v1/redoc',
      openapi: '/api/v1/docs/swagger.json',
      quickStart: 'See QUICK_START.md for setup instructions'
    }
  });
});

// Favicon (prevents 404 errors)
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation
app.get('/api/v1/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AI CRM API Documentation',
}));

app.get('/api/v1/redoc', redoc({
  title: 'AI CRM API - ReDoc',
  specUrl: '/api/v1/docs/swagger.json',
  theme: {
    colors: {
      primary: {
        main: '#2196f3',
      },
    },
  },
}));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/crm', crmRoutes);
app.use('/api/v1/sales', salesRoutes);
app.use('/api/v1/legal', legalRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/ai-assistant', aiAssistantRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
