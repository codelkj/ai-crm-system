# AI CRM Backend

Backend API for the AI-enabled CRM system with legal document processing and financial analysis.

## Features

- **CRM**: Company and contact management
- **Sales Pipeline**: Deal tracking with Kanban board
- **AI Legal Engine**: PDF parsing and key term extraction
- **Financial Analysis**: Bank transaction categorization and cash flow projections

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+
- **AI**: OpenAI GPT-4
- **Queue**: Bull (Redis)
- **Authentication**: JWT

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Update the following variables:
- `DATABASE_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - A secure random string

### 3. Database Setup
```bash
# Create database
createdb crm_ai_db

# Run schema
npm run db:setup

# Seed initial data (optional)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

The server will start on http://localhost:3000

## API Documentation

See `/docs/api/` for detailed API documentation.

## Project Structure

```
src/
├── config/          # Configuration files
├── modules/         # Feature modules
│   ├── crm/        # CRM functionality
│   ├── sales/      # Sales pipeline
│   ├── legal/      # Legal document processing
│   ├── financial/  # Financial analysis
│   └── auth/       # Authentication
├── shared/         # Shared utilities
├── jobs/           # Background job processing
├── app.ts          # Express app setup
└── server.ts       # Server entry point
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

MIT
