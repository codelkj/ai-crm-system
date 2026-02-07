# File Structure Design

## Project Organization

```
crm-ai-project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # Database connection config
│   │   │   ├── ai.ts                # AI/OpenAI configuration
│   │   │   ├── storage.ts           # File storage configuration
│   │   │   └── index.ts
│   │   │
│   │   ├── modules/
│   │   │   ├── crm/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── company.controller.ts
│   │   │   │   │   ├── contact.controller.ts
│   │   │   │   │   └── activity.controller.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── company.service.ts
│   │   │   │   │   ├── contact.service.ts
│   │   │   │   │   └── activity.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── index.ts     # Prisma/TypeORM models
│   │   │   │   ├── routes/
│   │   │   │   │   └── crm.routes.ts
│   │   │   │   ├── validators/
│   │   │   │   │   └── crm.validators.ts
│   │   │   │   └── types/
│   │   │   │       └── crm.types.ts
│   │   │   │
│   │   │   ├── sales/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── deal.controller.ts
│   │   │   │   │   └── stage.controller.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── deal.service.ts
│   │   │   │   │   ├── stage.service.ts
│   │   │   │   │   └── pipeline.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── routes/
│   │   │   │   │   └── sales.routes.ts
│   │   │   │   ├── validators/
│   │   │   │   │   └── sales.validators.ts
│   │   │   │   └── types/
│   │   │   │       └── sales.types.ts
│   │   │   │
│   │   │   ├── legal/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── document.controller.ts
│   │   │   │   │   └── terms.controller.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── document.service.ts
│   │   │   │   │   ├── parser.service.ts
│   │   │   │   │   ├── ai-extractor.service.ts
│   │   │   │   │   └── terms.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── routes/
│   │   │   │   │   └── legal.routes.ts
│   │   │   │   ├── validators/
│   │   │   │   │   └── legal.validators.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── legal.types.ts
│   │   │   │   └── prompts/
│   │   │   │       ├── extraction.prompt.ts
│   │   │   │       └── summary.prompt.ts
│   │   │   │
│   │   │   ├── financial/
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── account.controller.ts
│   │   │   │   │   ├── transaction.controller.ts
│   │   │   │   │   └── projection.controller.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── account.service.ts
│   │   │   │   │   ├── transaction.service.ts
│   │   │   │   │   ├── csv-parser.service.ts
│   │   │   │   │   ├── categorization.service.ts
│   │   │   │   │   └── projection.service.ts
│   │   │   │   ├── models/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── routes/
│   │   │   │   │   └── financial.routes.ts
│   │   │   │   ├── validators/
│   │   │   │   │   └── financial.validators.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── financial.types.ts
│   │   │   │   └── prompts/
│   │   │   │       └── categorization.prompt.ts
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── controllers/
│   │   │       │   └── auth.controller.ts
│   │   │       ├── services/
│   │   │       │   ├── auth.service.ts
│   │   │       │   └── jwt.service.ts
│   │   │       ├── middleware/
│   │   │       │   ├── authenticate.ts
│   │   │       │   └── authorize.ts
│   │   │       ├── routes/
│   │   │       │   └── auth.routes.ts
│   │   │       └── types/
│   │   │           └── auth.types.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── middleware/
│   │   │   │   ├── error-handler.ts
│   │   │   │   ├── request-logger.ts
│   │   │   │   └── rate-limiter.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   ├── validators.ts
│   │   │   │   └── helpers.ts
│   │   │   └── types/
│   │   │       └── common.types.ts
│   │   │
│   │   ├── jobs/
│   │   │   ├── queues/
│   │   │   │   ├── legal-processing.queue.ts
│   │   │   │   └── financial-analysis.queue.ts
│   │   │   └── workers/
│   │   │       ├── legal-worker.ts
│   │   │       └── financial-worker.ts
│   │   │
│   │   ├── app.ts                   # Express app setup
│   │   └── server.ts                # Server entry point
│   │
│   ├── prisma/                      # If using Prisma
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── crm/
│   │   │   ├── sales/
│   │   │   ├── legal/
│   │   │   └── financial/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── scripts/
│   │   ├── db-setup.ts
│   │   ├── seed-data.ts
│   │   └── migrate.ts
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Table/
│   │   │   │   └── Layout/
│   │   │   │
│   │   │   ├── crm/
│   │   │   │   ├── CompanyList/
│   │   │   │   ├── CompanyForm/
│   │   │   │   ├── ContactList/
│   │   │   │   ├── ContactForm/
│   │   │   │   └── ActivityTimeline/
│   │   │   │
│   │   │   ├── sales/
│   │   │   │   ├── KanbanBoard/
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── Column.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   └── styles.css
│   │   │   │   ├── DealForm/
│   │   │   │   └── PipelineConfig/
│   │   │   │
│   │   │   ├── legal/
│   │   │   │   ├── DocumentUpload/
│   │   │   │   ├── DocumentList/
│   │   │   │   ├── DocumentViewer/
│   │   │   │   ├── TermsDisplay/
│   │   │   │   └── DocumentSearch/
│   │   │   │
│   │   │   └── financial/
│   │   │       ├── TransactionUpload/
│   │   │       ├── TransactionList/
│   │   │       ├── CategoryManager/
│   │   │       ├── CashFlowChart/
│   │   │       └── ProjectionDashboard/
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   │   └── index.tsx
│   │   │   ├── Companies/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── Contacts/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── SalesPipeline/
│   │   │   │   └── index.tsx
│   │   │   ├── LegalDocuments/
│   │   │   │   ├── index.tsx
│   │   │   │   └── [id].tsx
│   │   │   ├── Financials/
│   │   │   │   ├── index.tsx
│   │   │   │   └── Projections.tsx
│   │   │   ├── Login/
│   │   │   │   └── index.tsx
│   │   │   └── Settings/
│   │   │       └── index.tsx
│   │   │
│   │   ├── features/                # Redux slices or state management
│   │   │   ├── crm/
│   │   │   │   └── crmSlice.ts
│   │   │   ├── sales/
│   │   │   │   └── salesSlice.ts
│   │   │   ├── legal/
│   │   │   │   └── legalSlice.ts
│   │   │   ├── financial/
│   │   │   │   └── financialSlice.ts
│   │   │   └── auth/
│   │   │       └── authSlice.ts
│   │   │
│   │   ├── services/                # API client
│   │   │   ├── api.ts
│   │   │   ├── crm.service.ts
│   │   │   ├── sales.service.ts
│   │   │   ├── legal.service.ts
│   │   │   ├── financial.service.ts
│   │   │   └── auth.service.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── types/
│   │   │   ├── crm.types.ts
│   │   │   ├── sales.types.ts
│   │   │   ├── legal.types.ts
│   │   │   └── financial.types.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   └── assets/
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── README.md
│
├── storage/                         # Local file storage
│   ├── legal-documents/
│   │   └── .gitkeep
│   ├── csv-uploads/
│   │   └── .gitkeep
│   └── temp/
│       └── .gitkeep
│
├── database/
│   ├── schema.sql                   # Full schema DDL
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   └── 003_add_triggers.sql
│   └── seeds/
│       ├── 001_users.sql
│       ├── 002_categories.sql
│       └── 003_pipeline_stages.sql
│
├── docs/
│   ├── api/
│   │   ├── crm-api.md
│   │   ├── sales-api.md
│   │   ├── legal-api.md
│   │   └── financial-api.md
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── data-flow.md
│   │   └── ai-integration.md
│   └── user-guides/
│       ├── crm-guide.md
│       ├── sales-pipeline-guide.md
│       ├── legal-documents-guide.md
│       └── financials-guide.md
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .gitignore
├── .env.example
├── ARCHITECTURE.md
├── DATABASE_SCHEMA.md
├── FILE_STRUCTURE.md
└── README.md
```

## Key Directory Explanations

### Backend Structure

#### `/backend/src/modules/`
- **Modular architecture**: Each business domain (CRM, Sales, Legal, Financial) is isolated
- **Clean architecture**: Controllers → Services → Models pattern
- **Separation of concerns**: Routes, validators, and types are separate

#### `/backend/src/jobs/`
- **Background processing**: AI tasks run asynchronously
- **Queue management**: Bull (Redis) or Celery for job queues
- **Workers**: Separate processes for heavy AI operations

### Frontend Structure

#### `/frontend/src/components/`
- **Common components**: Reusable UI elements
- **Feature components**: Domain-specific components grouped by module
- **Component co-location**: Each component has its own folder with styles

#### `/frontend/src/features/`
- **State management**: Redux Toolkit slices for each domain
- **Business logic**: Feature-specific logic separate from components

#### `/frontend/src/services/`
- **API layer**: Centralized API calls
- **Type safety**: Typed API responses matching backend

### Storage Structure

#### `/storage/`
- **legal-documents**: PDF files organized by company/deal
- **csv-uploads**: Bank CSV files with processed flag
- **temp**: Temporary processing files

### Database Structure

#### `/database/`
- **schema.sql**: Complete database schema
- **migrations**: Version-controlled schema changes
- **seeds**: Initial data for development

## File Naming Conventions

- **TypeScript**: `kebab-case.ts` or `PascalCase.tsx` (for components)
- **Components**: `PascalCase/` folders with `index.tsx`
- **Services**: `kebab-case.service.ts`
- **Types**: `kebab-case.types.ts`
- **Tests**: `*.test.ts` or `*.spec.ts`

## Environment Variables

### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AI/OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# File Storage
STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760

# Redis (for job queue)
REDIS_URL=redis://localhost:6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=AI CRM
```

## Next Steps

1. Review this file structure
2. Approve the design
3. Use `/sc:implement` to scaffold the project structure
4. Implement core modules incrementally
