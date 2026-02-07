# Quick Start Guide

Get your AI-enabled CRM running in minutes!

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis (optional, for background jobs)
- OpenAI API key

## 🚀 Fastest Way: Docker

```bash
# 1. Navigate to docker directory
cd docker

# 2. Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY and JWT_SECRET

# 3. Start everything
docker-compose up -d

# 4. Open browser
# Frontend: http://localhost
# Backend API: http://localhost:3000
# Done! 🎉
```

## 💻 Local Development Setup

### Step 1: Database Setup (5 minutes)

```bash
# Create database
createdb crm_ai_db

# Run schema
psql -d crm_ai_db -f database/schema.sql

# Seed initial data
psql -d crm_ai_db -f database/seeds/001_pipeline_stages.sql
psql -d crm_ai_db -f database/seeds/002_categories.sql
psql -d crm_ai_db -f database/seeds/003_demo_user.sql
```

### Step 2: Backend Setup (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set:
# - DATABASE_URL=postgresql://username:password@localhost:5432/crm_ai_db
# - OPENAI_API_KEY=sk-your-key-here
# - JWT_SECRET=your-secret-key

# Start development server
npm run dev
```

Backend will start on http://localhost:3000

### Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment (optional)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will start on http://localhost:5173

## ✅ Verify Installation

1. **Backend Health Check**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**
   Open http://localhost:5173 in your browser

3. **Database**
   ```bash
   psql -d crm_ai_db -c "SELECT COUNT(*) FROM pipeline_stages;"
   ```
   Should return: 6

## 🎯 First Steps

### 1. Create Your First Company
```bash
curl -X POST http://localhost:3000/api/v1/crm/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Acme Corp",
    "industry": "Technology",
    "website": "https://acme.com"
  }'
```

### 2. Upload a Legal Document
Use the frontend at http://localhost:5173/legal or:

```bash
curl -X POST http://localhost:3000/api/v1/legal/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@contract.pdf" \
  -F "title=Service Agreement"
```

### 3. Import Bank Transactions
```bash
curl -X POST http://localhost:3000/api/v1/financial/transactions/import \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@transactions.csv" \
  -F "account_id=YOUR_ACCOUNT_ID"
```

## 🔑 Get JWT Token

First, you need to register or login:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login (returns token)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in .env
- Check logs for errors

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check VITE_API_URL in frontend/.env
- Check CORS settings in backend

### Database errors
```bash
# Check if database exists
psql -l | grep crm_ai_db

# Reset database (WARNING: deletes all data)
dropdb crm_ai_db
createdb crm_ai_db
psql -d crm_ai_db -f database/schema.sql
```

### AI features not working
- Verify OPENAI_API_KEY is set correctly
- Check OpenAI API quota/billing
- Check backend logs for AI errors

## 📚 Next Steps

1. **Explore the UI**
   - Dashboard: Overview of all modules
   - Companies: Manage companies and contacts
   - Sales Pipeline: Drag-and-drop deal tracking
   - Legal Documents: Upload and analyze contracts
   - Financials: Import transactions and view projections

2. **Read the Documentation**
   - [Architecture](./ARCHITECTURE.md)
   - [Database Schema](./DATABASE_SCHEMA.md)
   - [API Design](./API_DESIGN.md)
   - [File Structure](./FILE_STRUCTURE.md)

3. **Customize**
   - Add custom pipeline stages
   - Create custom transaction categories
   - Configure AI prompts for your industry
   - Add custom fields to companies/contacts

## 🆘 Need Help?

- Check the [README.md](./README.md)
- Review [API_DESIGN.md](./API_DESIGN.md) for endpoint details
- Open a GitHub issue

Happy CRM-ing! 🎉
