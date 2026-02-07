# AI-Enabled CRM System

A comprehensive CRM system with AI-powered features for legal document processing, financial analysis, and sales pipeline management.

## Features

### 🏢 Core CRM
- Company and contact management
- Activity tracking and relationship mapping
- Comprehensive contact history

### 📊 Sales Pipeline
- Interactive Kanban board for deal tracking
- Customizable pipeline stages
- Revenue forecasting and probability tracking
- Deal activity logging

### ⚖️ AI Legal Engine
- PDF upload and parsing
- Automated key term extraction (parties, dates, obligations, amounts)
- AI-powered document summarization
- Searchable contract database

### 💰 Financial Analysis
- Bank CSV import and processing
- AI-powered transaction categorization
- Cash flow analysis and projections
- Financial reporting and dashboards

## Tech Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **AI**: OpenAI GPT-4
- **Queue**: Bull (Redis)
- **Authentication**: JWT

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State**: Redux Toolkit
- **Routing**: React Router v6
- **Drag & Drop**: @dnd-kit
- **Charts**: Recharts

## Project Structure

```
crm-ai-project/
├── backend/              # Backend API
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── modules/     # Feature modules
│   │   ├── shared/      # Shared utilities
│   │   └── jobs/        # Background jobs
│   └── package.json
│
├── frontend/            # Frontend application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── features/    # Redux slices
│   │   └── services/    # API services
│   └── package.json
│
├── database/            # Database schema and migrations
│   ├── schema.sql       # Complete schema
│   ├── migrations/      # Migration files
│   └── seeds/           # Seed data
│
├── storage/             # File uploads
│   ├── legal-documents/ # PDF files
│   ├── csv-uploads/     # Bank CSVs
│   └── temp/            # Temporary files
│
├── docker/              # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
└── docs/                # Documentation
    ├── ARCHITECTURE.md
    ├── DATABASE_SCHEMA.md
    ├── FILE_STRUCTURE.md
    └── API_DESIGN.md
```

## Quick Start

### Option 1: Docker (Recommended)

1. **Configure environment**
   ```bash
   cd docker
   cp .env.example .env
   # Edit .env and set JWT_SECRET and OPENAI_API_KEY
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **API Documentation (Swagger)**: http://localhost:3000/api/v1/docs
   - **API Documentation (ReDoc)**: http://localhost:3000/api/v1/redoc
   - **Database**: localhost:5432

### Option 2: Local Development

#### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and OpenAI API key
   ```

3. **Set up database**
   ```bash
   createdb crm_ai_db
   npm run db:setup
   npm run db:seed
   ```

4. **Start server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Application Access

### 🌐 URLs

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger UI (Interactive API Docs)**: http://localhost:3000/api/v1/docs
- **ReDoc (Clean API Docs)**: http://localhost:3000/api/v1/redoc
- **Database**: localhost:5432

### 🔐 Getting Started

1. **Get an authentication token**:
   ```bash
   cd backend
   node get-token.js
   ```

2. **Authorize in Swagger UI**:
   - Open http://localhost:3000/api/v1/docs
   - Click the green "Authorize" button
   - Paste the token (without "Bearer" prefix)
   - Click "Authorize" → "Close"

3. **Test the API**:
   - Try `GET /auth/me` to verify authentication
   - Try `GET /financial/categories` to see all categories
   - Try `POST /financial/transactions/upload` to upload CSV with AI

See `backend/SWAGGER_AUTH_GUIDE.md` for detailed authentication instructions.

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [File Structure](./FILE_STRUCTURE.md)
- [API Design](./API_DESIGN.md)

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI features
- `JWT_SECRET` - Secret key for JWT tokens
- `REDIS_URL` - Redis connection for job queue

### Frontend
- `VITE_API_URL` - Backend API URL

See `.env.example` files for complete list.

## API Endpoints

**Interactive API Documentation**: http://localhost:3000/api/v1/docs

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user profile

### Financial (AI-Powered)
- `POST /api/v1/financial/bank-accounts` - Create bank account
- `GET /api/v1/financial/bank-accounts` - List all accounts
- `POST /api/v1/financial/transactions/upload` - Upload CSV with AI categorization
- `GET /api/v1/financial/transactions` - List transactions with filters
- `PATCH /api/v1/financial/transactions/:id/category` - Override category
- `GET /api/v1/financial/categories` - List all categories

### CRM
- `GET /api/v1/crm/companies` - List companies
- `POST /api/v1/crm/companies` - Create company
- `GET /api/v1/crm/contacts` - List contacts
- `POST /api/v1/crm/contacts` - Create contact

### Sales
- `GET /api/v1/sales/deals` - List deals
- `POST /api/v1/sales/deals` - Create deal
- `PATCH /api/v1/sales/deals/:id/move` - Move deal to stage (Kanban)
- `GET /api/v1/sales/kanban` - Get Kanban board view

### Legal (AI-Powered)
- `POST /api/v1/legal/documents/upload` - Upload PDF with AI term extraction
- `GET /api/v1/legal/documents` - List documents
- `POST /api/v1/legal/documents/:id/reprocess` - Re-extract terms with AI
- `GET /api/v1/legal/stats` - Processing statistics

**Full documentation with request/response examples**: http://localhost:3000/api/v1/docs

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- SQL injection prevention via parameterized queries
- Input validation on all endpoints
- Rate limiting
- Helmet.js security headers

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

Built with ❤️ using Node.js, React, PostgreSQL, and OpenAI GPT-4
