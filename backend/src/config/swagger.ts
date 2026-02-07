/**
 * Swagger/OpenAPI Configuration
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI-Enabled CRM API',
      version: '1.0.0',
      description: 'Complete API documentation for the AI-enabled CRM system with financial analysis, legal document processing, and sales pipeline management.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter ONLY your JWT token (without "Bearer" prefix). Get a token by clicking the green "Authorize" button above and pasting your token from /auth/login or /auth/register.',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Invalid input data' },
              },
            },
          },
        },
        BankAccount: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            account_name: { type: 'string', example: 'Business Checking' },
            account_number: { type: 'string', example: '****1234' },
            bank_name: { type: 'string', example: 'Chase Bank' },
            account_type: {
              type: 'string',
              enum: ['checking', 'savings', 'credit_card', 'investment', 'other'],
            },
            currency: { type: 'string', example: 'USD' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            account_id: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date' },
            description: { type: 'string', example: 'Amazon AWS Services' },
            amount: { type: 'number', example: 125.50 },
            type: { type: 'string', enum: ['debit', 'credit'] },
            category_id: { type: 'string', format: 'uuid' },
            category_name: { type: 'string', example: 'Software & Subscriptions' },
            ai_confidence: { type: 'number', minimum: 0, maximum: 1, example: 0.95 },
            notes: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Software & Subscriptions' },
            type: { type: 'string', enum: ['income', 'expense'] },
            parent_id: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'user'] },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Financial',
        description: 'Bank accounts, transactions, and AI-powered categorization',
      },
      {
        name: 'CRM',
        description: 'Customer relationship management - contacts, companies, activities',
      },
      {
        name: 'Sales',
        description: 'Sales pipeline and deal management',
      },
      {
        name: 'Legal',
        description: 'Legal document processing and term extraction',
      },
    ],
  },
  apis: [
    './src/modules/*/routes/*.ts',
    './src/modules/*/controllers/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
