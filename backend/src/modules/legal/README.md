# Legal AI Engine Module

This module provides AI-powered legal document processing and term extraction capabilities for the CRM system.

## Features

### Document Management
- Upload and store legal documents (PDF)
- Link documents to companies and deals
- Track processing status (pending, processing, completed, failed)
- Generate AI-powered summaries

### AI Term Extraction
- Extract parties (client names, vendor names)
- Extract dates (effective date, termination date, renewal date)
- Extract obligations (payment terms, deliverables, service levels)
- Extract amounts (contract values, fees, penalties)
- Extract clauses (confidentiality, termination, liability, governing law)
- Confidence scores for each extracted term (0.85-0.98)

### Mock AI Processing
Currently uses mock AI extraction that simulates GPT-4 behavior without API calls. In production, this would use the OpenAI API with the prompts defined in `prompts/extraction.prompt.ts`.

## API Endpoints

### Documents

#### Get All Documents
```
GET /api/v1/legal/documents
Query Params:
  - page (default: 1)
  - limit (default: 20)
  - company_id (optional)
  - deal_id (optional)
  - status (optional: pending|processing|completed|failed)
```

#### Get Document by ID
```
GET /api/v1/legal/documents/:id
Query Params:
  - includeTerms (boolean, default: false)
```

#### Upload Document
```
POST /api/v1/legal/documents
Content-Type: multipart/form-data
Body:
  - file (PDF file)
  - title (string)
  - document_type (string)
  - company_id (optional UUID)
  - deal_id (optional UUID)

Note: Automatically triggers AI processing
```

#### Delete Document
```
DELETE /api/v1/legal/documents/:id
```

#### Reprocess Document
```
POST /api/v1/legal/documents/:id/reprocess
```

#### Get Processing Statistics
```
GET /api/v1/legal/documents/stats
```

### Terms

#### Get Terms by Document
```
GET /api/v1/legal/documents/:documentId/terms
```

#### Get Terms Grouped by Type
```
GET /api/v1/legal/documents/:documentId/terms/grouped
Returns:
{
  parties: ExtractedTerm[],
  dates: ExtractedTerm[],
  obligations: ExtractedTerm[],
  amounts: ExtractedTerm[],
  clauses: ExtractedTerm[]
}
```

#### Search Terms
```
GET /api/v1/legal/terms/search
Query Params:
  - document_id (optional UUID)
  - term_type (optional: party|date|obligation|amount|clause)
  - search (optional string)
```

#### Get Terms Statistics
```
GET /api/v1/legal/terms/statistics
Query Params:
  - document_id (optional)
```

#### Get Low Confidence Terms
```
GET /api/v1/legal/terms/low-confidence
Query Params:
  - document_id (optional)
  - threshold (optional, default: 0.9)
```

## File Structure

```
legal/
├── controllers/
│   ├── document.controller.ts    # Document CRUD and processing
│   └── terms.controller.ts       # Terms retrieval and search
├── services/
│   ├── document.service.ts       # Document business logic
│   ├── terms.service.ts          # Terms business logic
│   └── ai-extractor.service.ts   # Mock AI extraction
├── types/
│   └── legal.types.ts            # TypeScript interfaces
├── validators/
│   └── legal.validators.ts       # Request validation & Multer config
├── routes/
│   └── legal.routes.ts           # Route definitions
├── prompts/
│   └── extraction.prompt.ts      # AI prompts (for production)
└── README.md                     # This file
```

## Mock Data

The module initializes with 6 sample documents:

1. **Master Services Agreement - Acme Corp** (Service Agreement)
   - Linked to Acme Corporation
   - Linked to Enterprise Software License deal
   - Status: Completed

2. **Enterprise Software License Agreement** (License Agreement)
   - Linked to TechStart Inc
   - Linked to Cloud Migration Project deal
   - Status: Completed

3. **Consulting Services Contract - Global Solutions** (Consulting Agreement)
   - Linked to Global Solutions LLC
   - Linked to Consulting Services Package deal
   - Status: Completed

4. **Mutual Non-Disclosure Agreement** (NDA)
   - Linked to Acme Corporation
   - Status: Completed

5. **Data Processing Agreement - GDPR Compliant** (DPA)
   - Linked to TechStart Inc
   - Linked to Annual Support Contract deal
   - Status: Completed

6. **Executive Employment Agreement** (Employment Contract)
   - Linked to Global Solutions LLC
   - Status: Pending (awaiting processing)

Each completed document has 15-20 extracted terms with realistic values and confidence scores.

## Extracted Term Types

### Party
- client_name
- vendor_name
- employer_name
- employee_name
- party_a
- party_b

### Date
- effective_date
- termination_date
- renewal_date

### Amount
- contract_value
- monthly_fee
- late_payment_penalty
- license_fee
- annual_maintenance
- total_value

### Obligation
- payment_terms
- deliverables
- service_level
- work_hours
- benefits
- payment_schedule
- performance_requirements

### Clause
- confidentiality
- termination
- liability
- governing_law
- dispute_resolution

## Mock AI Extraction

The `ai-extractor.service.ts` generates realistic terms based on document title and type:

- **Service/Consulting**: Generates service-related terms (SLAs, deliverables, monthly fees)
- **License**: Generates licensing terms (license fees, maintenance, usage rights)
- **Employment/NDA**: Generates employment terms (work hours, benefits, confidentiality)
- **Default**: Generates generic contract terms

Each term includes:
- Confidence score (0.85-0.98)
- Page number reference
- Realistic values based on document context

## Production Considerations

To use real AI extraction in production:

1. Set `OPENAI_API_KEY` environment variable
2. Update `ai-extractor.service.ts` to call OpenAI API
3. Use prompts from `prompts/extraction.prompt.ts`
4. Implement proper error handling and retries
5. Consider background job processing for large documents
6. Add document parsing (pdf-parse package is already installed)

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload Configuration

- **Allowed MIME types**: application/pdf
- **Max file size**: 10MB (configurable via STORAGE_CONFIG)
- **Storage location**: ./storage/legal-documents/
- **Filename format**: {uuid}-{timestamp}.pdf

## Testing

Use the following curl commands to test (replace TOKEN with your JWT):

```bash
# Get all documents
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/legal/documents

# Get document with terms
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/legal/documents/{id}?includeTerms=true

# Upload document
curl -H "Authorization: Bearer TOKEN" \
  -F "file=@contract.pdf" \
  -F "title=Service Agreement" \
  -F "document_type=Service Agreement" \
  -F "company_id={company-uuid}" \
  http://localhost:3000/api/v1/legal/documents

# Search terms
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/v1/legal/terms/search?term_type=amount&search=fee"

# Get statistics
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/v1/legal/documents/stats
```
