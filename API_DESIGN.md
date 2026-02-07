# API Design Specification

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints (except `/auth/*`) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. CRM API

### Companies

#### `GET /crm/companies`
Get all companies with pagination
```json
Query Params:
  - page: number (default: 1)
  - limit: number (default: 20)
  - search: string
  - industry: string

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "industry": "Technology",
      "website": "https://acme.com",
      "phone": "+1-555-0123",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "country": "USA",
      "created_at": "2024-01-01T00:00:00Z",
      "contacts_count": 5,
      "deals_count": 3
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### `POST /crm/companies`
Create a new company
```json
Request Body:
{
  "name": "Acme Corp",
  "industry": "Technology",
  "website": "https://acme.com",
  "phone": "+1-555-0123",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA"
}

Response 201:
{
  "data": { /* company object */ }
}
```

#### `GET /crm/companies/:id`
Get company by ID with related data
```json
Response 200:
{
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    /* ... other fields ... */
    "contacts": [ /* array of contacts */ ],
    "deals": [ /* array of deals */ ],
    "activities": [ /* recent activities */ ]
  }
}
```

#### `PUT /crm/companies/:id`
Update company

#### `DELETE /crm/companies/:id`
Delete company

---

### Contacts

#### `GET /crm/contacts`
Get all contacts with pagination
```json
Query Params:
  - page, limit, search
  - company_id: uuid

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "company_name": "Acme Corp",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@acme.com",
      "phone": "+1-555-0456",
      "position": "CEO",
      "is_primary": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": { /* pagination */ }
}
```

#### `POST /crm/contacts`
Create contact

#### `GET /crm/contacts/:id`
Get contact with activities

#### `PUT /crm/contacts/:id`
Update contact

#### `DELETE /crm/contacts/:id`
Delete contact

---

### Activities

#### `GET /crm/activities`
Get activities with filters
```json
Query Params:
  - company_id, contact_id, deal_id
  - type: 'call'|'email'|'meeting'|'note'
  - date_from, date_to

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "contact_id": "uuid",
      "company_id": "uuid",
      "deal_id": "uuid",
      "type": "call",
      "subject": "Discovery call",
      "description": "Discussed requirements...",
      "due_date": "2024-01-15T10:00:00Z",
      "completed_at": null,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### `POST /crm/activities`
Create activity

#### `PUT /crm/activities/:id`
Update activity

#### `DELETE /crm/activities/:id`
Delete activity

---

## 2. Sales Pipeline API

### Pipeline Stages

#### `GET /sales/stages`
Get all pipeline stages
```json
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "Lead",
      "order": 1,
      "probability": 10,
      "color": "#e3f2fd",
      "deals_count": 15
    }
  ]
}
```

#### `POST /sales/stages`
Create stage

#### `PUT /sales/stages/:id`
Update stage

#### `PUT /sales/stages/reorder`
Reorder stages
```json
Request Body:
{
  "stages": [
    { "id": "uuid1", "order": 1 },
    { "id": "uuid2", "order": 2 }
  ]
}
```

---

### Deals

#### `GET /sales/deals`
Get all deals with Kanban view support
```json
Query Params:
  - stage_id: uuid
  - company_id: uuid
  - view: 'kanban'|'list'

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "company_name": "Acme Corp",
      "contact_id": "uuid",
      "contact_name": "John Doe",
      "title": "Enterprise License Deal",
      "value": 50000.00,
      "stage_id": "uuid",
      "stage_name": "Proposal",
      "probability": 50,
      "expected_close_date": "2024-03-01",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}

// Kanban view
Response 200 (view=kanban):
{
  "data": {
    "stages": [
      {
        "id": "uuid",
        "name": "Lead",
        "order": 1,
        "deals": [ /* deals in this stage */ ]
      }
    ]
  }
}
```

#### `POST /sales/deals`
Create deal

#### `GET /sales/deals/:id`
Get deal details

#### `PUT /sales/deals/:id`
Update deal

#### `PUT /sales/deals/:id/stage`
Move deal to different stage
```json
Request Body:
{
  "stage_id": "uuid"
}
```

#### `DELETE /sales/deals/:id`
Delete deal

---

## 3. Legal Documents API

### Documents

#### `GET /legal/documents`
Get all legal documents
```json
Query Params:
  - company_id, deal_id
  - status: 'pending'|'processing'|'completed'|'failed'

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "company_id": "uuid",
      "deal_id": "uuid",
      "title": "Service Agreement",
      "file_path": "/storage/legal/...",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      "upload_date": "2024-01-01T00:00:00Z",
      "processed_at": "2024-01-01T00:10:00Z",
      "processing_status": "completed",
      "summary": "Service agreement between...",
      "terms_count": 25
    }
  ]
}
```

#### `POST /legal/documents`
Upload and process legal document
```json
Content-Type: multipart/form-data

Form Data:
  - file: File (PDF)
  - title: string
  - company_id: uuid (optional)
  - deal_id: uuid (optional)

Response 202:
{
  "data": {
    "id": "uuid",
    "processing_status": "pending",
    "message": "Document uploaded and queued for processing"
  }
}
```

#### `GET /legal/documents/:id`
Get document with extracted terms
```json
Response 200:
{
  "data": {
    "id": "uuid",
    "title": "Service Agreement",
    /* ... other fields ... */
    "summary": "Agreement summary...",
    "extracted_terms": [
      {
        "id": "uuid",
        "term_type": "party",
        "term_key": "client_name",
        "term_value": "Acme Corp",
        "confidence": 0.95,
        "page_number": 1
      },
      {
        "term_type": "date",
        "term_key": "effective_date",
        "term_value": "2024-01-01",
        "confidence": 0.98,
        "page_number": 1
      }
    ]
  }
}
```

#### `GET /legal/documents/:id/download`
Download original PDF

#### `POST /legal/documents/:id/reprocess`
Reprocess document with AI

#### `DELETE /legal/documents/:id`
Delete document

---

### Extracted Terms

#### `GET /legal/terms`
Search extracted terms
```json
Query Params:
  - document_id: uuid
  - term_type: string
  - search: string

Response 200:
{
  "data": [ /* array of terms */ ]
}
```

---

## 4. Financial API

### Bank Accounts

#### `GET /financial/accounts`
Get all bank accounts
```json
Response 200:
{
  "data": [
    {
      "id": "uuid",
      "account_name": "Main Checking",
      "account_number": "****1234",
      "bank_name": "Chase",
      "account_type": "checking",
      "currency": "USD",
      "balance": 50000.00,
      "transaction_count": 150
    }
  ]
}
```

#### `POST /financial/accounts`
Create bank account

---

### Transactions

#### `GET /financial/transactions`
Get transactions with filters
```json
Query Params:
  - account_id: uuid
  - category_id: uuid
  - date_from, date_to
  - type: 'debit'|'credit'

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "date": "2024-01-15",
      "description": "Client payment",
      "amount": 5000.00,
      "type": "credit",
      "category_id": "uuid",
      "category_name": "Sales Revenue",
      "ai_confidence": 0.92,
      "notes": ""
    }
  ]
}
```

#### `POST /financial/transactions/import`
Import transactions from CSV
```json
Content-Type: multipart/form-data

Form Data:
  - file: File (CSV)
  - account_id: uuid
  - auto_categorize: boolean (default: true)

Response 202:
{
  "data": {
    "job_id": "uuid",
    "message": "CSV uploaded and queued for processing",
    "estimated_transactions": 150
  }
}
```

#### `PUT /financial/transactions/:id/categorize`
Manually categorize transaction
```json
Request Body:
{
  "category_id": "uuid"
}
```

---

### Categories

#### `GET /financial/categories`
Get all categories
```json
Query Params:
  - type: 'income'|'expense'

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "name": "Sales Revenue",
      "type": "income",
      "parent_id": null,
      "transaction_count": 50,
      "total_amount": 100000.00
    }
  ]
}
```

#### `POST /financial/categories`
Create category

---

### Cash Flow Projections

#### `GET /financial/projections`
Get cash flow projections
```json
Query Params:
  - account_id: uuid
  - date_from, date_to

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "projection_date": "2024-02-01",
      "projected_income": 25000.00,
      "projected_expenses": 15000.00,
      "net_cash_flow": 10000.00,
      "confidence": 0.85
    }
  ],
  "summary": {
    "total_projected_income": 75000.00,
    "total_projected_expenses": 45000.00,
    "net_projection": 30000.00
  }
}
```

#### `POST /financial/projections/generate`
Generate new projections using AI
```json
Request Body:
{
  "account_id": "uuid",
  "months_ahead": 6
}

Response 202:
{
  "data": {
    "job_id": "uuid",
    "message": "Projection generation started"
  }
}
```

---

## 5. Authentication API

#### `POST /auth/register`
Register new user
```json
Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}

Response 201:
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "token": "jwt.token.here"
  }
}
```

#### `POST /auth/login`
Login user
```json
Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "data": {
    "user": { /* user object */ },
    "token": "jwt.token.here"
  }
}
```

#### `POST /auth/logout`
Logout user

#### `GET /auth/me`
Get current user profile

---

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity
- `500` - Internal Server Error

---

## Rate Limiting

- **Anonymous**: 100 requests/hour
- **Authenticated**: 1000 requests/hour
- **AI Operations**: 50 requests/hour

Headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1641024000
```

---

## Webhooks (Future)

Support for webhooks on key events:
- `document.processed` - Legal document processing completed
- `deal.stage_changed` - Deal moved to new stage
- `transaction.categorized` - Transaction auto-categorized
- `projection.generated` - Cash flow projection generated
