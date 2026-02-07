# Database Setup

## Prerequisites
- PostgreSQL 15 or higher

## Setup Instructions

### 1. Create Database
```bash
createdb crm_ai_db
```

### 2. Run Schema
```bash
psql -d crm_ai_db -f schema.sql
```

### 3. Run Seeds (Optional - for development)
```bash
psql -d crm_ai_db -f seeds/001_pipeline_stages.sql
psql -d crm_ai_db -f seeds/002_categories.sql
psql -d crm_ai_db -f seeds/003_demo_user.sql
```

## Database Connection

Set the `DATABASE_URL` environment variable:

```
DATABASE_URL=postgresql://username:password@localhost:5432/crm_ai_db
```

## Schema Overview

The database includes:
- **CRM Tables**: companies, contacts, activities
- **Sales Tables**: deals, pipeline_stages
- **Legal Tables**: legal_documents, extracted_terms
- **Financial Tables**: bank_accounts, transactions, categories, cash_flow_projections
- **Auth Tables**: users

## Migrations

Migrations are version-controlled in the `migrations/` directory.

To run migrations:
```bash
psql -d crm_ai_db -f migrations/001_initial_schema.sql
```

## Notes

- All primary keys use UUIDs for distributed scalability
- Timestamps use TIMESTAMP WITH TIME ZONE for timezone awareness
- Indexes are created on foreign keys and frequently queried columns
- Triggers auto-update `updated_at` columns
