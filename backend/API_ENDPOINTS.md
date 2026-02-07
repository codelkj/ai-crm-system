# API Endpoints Reference

**Base URL**: `http://localhost:3000/api/v1`

**Authentication**: All endpoints (except `/auth/register` and `/auth/login`) require JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}

Response 201:
{
  "data": {
    "user": { "id": "...", "email": "...", ... },
    "token": "eyJhbGc..."
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@crm.com",
  "password": "Admin123!"
}

Response 200:
{
  "data": {
    "user": { "id": "...", "email": "...", "role": "admin", ... },
    "token": "eyJhbGc..."
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>

Response 200:
{
  "data": {
    "id": "...",
    "email": "admin@crm.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }
}
```

---

## 🏢 CRM - Companies

### List Companies
```http
GET /crm/companies?page=1&limit=20&search=acme

Response 200:
{
  "data": [
    {
      "id": "...",
      "name": "Acme Corporation",
      "industry": "Technology",
      "website": "https://acme.com",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

### Get Company
```http
GET /crm/companies/:id

Response 200:
{
  "data": {
    "id": "...",
    "name": "Acme Corporation",
    ...
  }
}
```

### Create Company
```http
POST /crm/companies
Content-Type: application/json

{
  "name": "New Corp",
  "industry": "Finance",
  "website": "https://newcorp.com",
  "phone": "+1-555-9999",
  "city": "Boston",
  "state": "MA",
  "country": "USA"
}
```

### Update Company
```http
PUT /crm/companies/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "industry": "New Industry"
}
```

### Delete Company
```http
DELETE /crm/companies/:id

Response 200:
{
  "message": "Company deleted successfully"
}
```

---

## 👤 CRM - Contacts

### List Contacts
```http
GET /crm/contacts?page=1&limit=20&company_id=...&search=john

Response 200:
{
  "data": [
    {
      "id": "...",
      "company_id": "...",
      "first_name": "John",
      "last_name": "Smith",
      "email": "john@acme.com",
      ...
    }
  ],
  "meta": { ... }
}
```

### Create Contact
```http
POST /crm/contacts
Content-Type: application/json

{
  "company_id": "...",
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@company.com",
  "phone": "+1-555-1234",
  "position": "CEO",
  "is_primary": true
}
```

---

## 📝 CRM - Activities

### List Activities
```http
GET /crm/activities?company_id=...&contact_id=...&type=call

Response 200:
{
  "data": [
    {
      "id": "...",
      "type": "call",
      "subject": "Follow-up call",
      "description": "Discussed requirements",
      "due_date": "2024-02-15T10:00:00Z",
      "completed_at": null,
      ...
    }
  ]
}
```

### Create Activity
```http
POST /crm/activities
Content-Type: application/json

{
  "company_id": "...",
  "contact_id": "...",
  "type": "meeting",
  "subject": "Quarterly Review",
  "description": "Review Q1 performance",
  "due_date": "2024-03-01T14:00:00Z"
}
```

### Mark Activity Complete
```http
POST /crm/activities/:id/complete

Response 200:
{
  "data": {
    "id": "...",
    "completed_at": "2024-02-07T19:00:00Z",
    ...
  }
}
```

---

## 💼 Sales - Pipeline

### Get Kanban Board
```http
GET /sales/kanban

Response 200:
{
  "data": {
    "stages": [
      {
        "id": "...",
        "name": "Lead",
        "color": "#6B7280",
        "order": 1,
        "deals": [
          {
            "id": "...",
            "title": "Enterprise License Deal",
            "company_name": "Acme Corp",
            "contact_name": "John Smith",
            "value": 50000.00,
            "currency": "USD",
            "probability": 10,
            ...
          }
        ],
        "total_value": 400000.00,
        "deal_count": 4
      },
      ...
    ]
  }
}
```

### List Deals
```http
GET /sales/deals?stage_id=...&company_id=...&page=1&limit=20

Response 200:
{
  "data": [ ... ],
  "meta": { ... }
}
```

### Create Deal
```http
POST /sales/deals
Content-Type: application/json

{
  "company_id": "...",
  "contact_id": "...",
  "title": "New Deal",
  "value": 75000.00,
  "currency": "USD",
  "stage_id": "...",
  "probability": 25,
  "expected_close_date": "2024-06-01"
}
```

### Move Deal to Stage
```http
PUT /sales/deals/:id/stage
Content-Type: application/json

{
  "stage_id": "..."
}

Response 200:
{
  "data": {
    "id": "...",
    "stage_id": "...",
    "stage_name": "Proposal",
    ...
  }
}
```

### Reorder Pipeline Stages
```http
PUT /sales/stages/reorder
Content-Type: application/json

{
  "stages": [
    { "id": "...", "order": 1 },
    { "id": "...", "order": 2 },
    ...
  ]
}
```

---

## ⚖️ Legal - Documents

### List Documents
```http
GET /legal/documents?company_id=...&status=completed&page=1

Response 200:
{
  "data": [
    {
      "id": "...",
      "title": "Master Services Agreement",
      "company_id": "...",
      "file_path": "/storage/legal/...",
      "processing_status": "completed",
      "summary": "Service agreement between...",
      "terms_count": 18,
      ...
    }
  ],
  "meta": { ... }
}
```

### Upload Document
```http
POST /legal/documents
Content-Type: multipart/form-data

file: <PDF file>
title: "Service Agreement"
company_id: "..."
deal_id: "..." (optional)

Response 202:
{
  "data": {
    "id": "...",
    "processing_status": "processing",
    "message": "Document uploaded and queued for processing"
  }
}
```

### Get Document with Terms
```http
GET /legal/documents/:id?include_terms=true

Response 200:
{
  "data": {
    "id": "...",
    "title": "Master Services Agreement",
    "summary": "...",
    "terms": [
      {
        "id": "...",
        "term_type": "party",
        "term_key": "client_name",
        "term_value": "Acme Corporation",
        "confidence": 0.95,
        "page_number": 1
      },
      {
        "term_type": "date",
        "term_key": "effective_date",
        "term_value": "2024-01-15",
        "confidence": 0.98,
        "page_number": 1
      },
      ...
    ]
  }
}
```

### Get Processing Stats
```http
GET /legal/documents/stats

Response 200:
{
  "data": {
    "total": 6,
    "completed": 5,
    "processing": 0,
    "pending": 1,
    "failed": 0
  }
}
```

### Search Terms
```http
GET /legal/terms/search?term_type=party&search=acme

Response 200:
{
  "data": [
    {
      "id": "...",
      "document_id": "...",
      "document_title": "Master Services Agreement",
      "term_type": "party",
      "term_key": "client_name",
      "term_value": "Acme Corporation",
      "confidence": 0.95
    }
  ]
}
```

---

## 💰 Financial - Accounts

### List Bank Accounts
```http
GET /financial/accounts

Response 200:
{
  "data": [
    {
      "id": "...",
      "account_name": "Main Checking",
      "bank_name": "Chase Bank",
      "account_type": "checking",
      "currency": "USD",
      "current_balance": 125430.50,
      "transaction_count": 23
    }
  ]
}
```

### Create Bank Account
```http
POST /financial/accounts
Content-Type: application/json

{
  "account_name": "Savings Account",
  "bank_name": "Bank of America",
  "account_type": "savings",
  "currency": "USD"
}
```

---

## 💳 Financial - Transactions

### List Transactions
```http
GET /financial/transactions?account_id=...&start_date=2024-01-01&end_date=2024-02-07

Response 200:
{
  "data": [
    {
      "id": "...",
      "account_id": "...",
      "date": "2024-02-01",
      "description": "Client Payment - Acme Corp",
      "amount": 5000.00,
      "type": "credit",
      "category_id": "...",
      "category_name": "Sales Revenue",
      "ai_confidence": 0.92
    }
  ],
  "summary": {
    "total_credit": 25000.00,
    "total_debit": 15000.00,
    "net": 10000.00,
    "count": 45
  }
}
```

### Create Transaction
```http
POST /financial/transactions
Content-Type: application/json

{
  "account_id": "...",
  "date": "2024-02-07",
  "description": "Office rent payment",
  "amount": 3500.00,
  "type": "debit"
}

// Auto-categorizes if category_id not provided
```

### Categorize Transaction
```http
POST /financial/transactions/:id/categorize

Response 200:
{
  "data": {
    "category_id": "...",
    "category_name": "Rent",
    "confidence": 0.95,
    "reasoning": "Matched keyword 'rent' in description"
  }
}
```

### Import CSV
```http
POST /financial/transactions/import
Content-Type: multipart/form-data

file: <CSV file>
account_id: "..."

Response 202:
{
  "data": {
    "message": "CSV import completed",
    "summary": {
      "total_rows": 50,
      "successful": 48,
      "failed": 2,
      "transactions_created": 48
    }
  }
}
```

### Download Sample CSV
```http
GET /financial/transactions/sample-csv

Response 200:
Content-Type: text/csv
Content-Disposition: attachment; filename="sample-transactions.csv"

Date,Description,Amount,Type
2024-01-15,"Client Payment",5000.00,credit
2024-01-20,"Office Supplies",-150.50,debit
...
```

---

## 📊 Financial - Cash Flow Projections

### Generate Projections
```http
POST /financial/projections/generate?months=6&historical_months=3

Response 200:
{
  "data": {
    "projections": [
      {
        "projection_date": "2024-03-01",
        "projected_income": 28000.00,
        "projected_expenses": 15500.00,
        "net_cash_flow": 12500.00,
        "confidence": 0.87
      },
      ...
    ],
    "summary": {
      "total_projected_income": 168000.00,
      "total_projected_expenses": 93000.00,
      "net_projection": 75000.00,
      "average_monthly_net": 12500.00
    }
  }
}
```

### Get Projections
```http
GET /financial/projections

Response 200:
{
  "data": [
    {
      "id": "...",
      "account_id": "...",
      "projection_date": "2024-03-01",
      "projected_income": 28000.00,
      "projected_expenses": 15500.00,
      "net_cash_flow": 12500.00,
      "confidence": 0.87
    },
    ...
  ]
}
```

---

## 📁 Financial - Categories

### List Categories
```http
GET /financial/categories?type=expense

Response 200:
{
  "data": [
    {
      "id": "...",
      "name": "Rent",
      "type": "expense",
      "transaction_count": 12,
      "total_amount": 42000.00
    },
    ...
  ]
}
```

---

## 🔍 Quick Test Commands

```bash
# Health check (no auth required)
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"Admin123!"}'

# Get companies (replace TOKEN)
curl http://localhost:3000/api/v1/crm/companies \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Kanban board
curl http://localhost:3000/api/v1/sales/kanban \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get legal documents
curl http://localhost:3000/api/v1/legal/documents \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get transactions
curl http://localhost:3000/api/v1/financial/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [ ... ]
  }
}
```

Common error codes:
- `400` - VALIDATION_ERROR
- `401` - UNAUTHORIZED
- `403` - FORBIDDEN
- `404` - NOT_FOUND
- `409` - CONFLICT (e.g., duplicate email)
- `500` - INTERNAL_SERVER_ERROR
