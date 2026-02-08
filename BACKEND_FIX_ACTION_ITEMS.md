# Backend Fix Action Items

**Priority-ordered fixes based on comprehensive backend testing**
**Date:** 2026-02-08

---

## 🔴 PRIORITY 1: CRITICAL FIXES (Blocking)

### 1.1 Fix Invoicing List Endpoint (500 Error)

**Issue:** `GET /api/v1/invoicing/invoices` returns internal server error

**Location:** `backend/src/modules/invoicing/services/invoice.service.ts`

**Steps to Fix:**
1. Check the `getAll()` method in invoice service
2. Review SQL query for syntax errors
3. Check for missing JOIN clauses
4. Verify response data structure matches expected format
5. Test with empty invoices table and with existing invoices

**Test Command:**
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/invoicing/invoices
```

---

### 1.2 Fix Time Entry Schema Mismatch

**Issue:** Cannot create time entries - column name mismatch

**Error:** `null value in column "entry_date" violates not-null constraint`

**Location:**
- Database: `database/migrations/003_time_tracking_and_billing.sql`
- Controller: `backend/src/modules/time-tracking/controllers/time-entry.controller.ts`
- Service: `backend/src/modules/time-tracking/services/time-entry.service.ts`

**Root Cause:** API sends `date` but database expects `entry_date`

**Fix Options:**
1. **Option A (Recommended):** Update controller to send `entry_date`
2. **Option B:** Add migration to rename column to `date`

**Steps (Option A):**
1. Open time entry controller
2. Find the create endpoint
3. Change request body mapping from `date` to `entry_date`
4. Update validator if needed

**Test Payload:**
```json
{
  "matter_id": "<uuid>",
  "user_id": "<uuid>",
  "entry_date": "2026-02-08",
  "duration_minutes": 120,
  "description": "Legal research",
  "billable": true,
  "hourly_rate": 250.00
}
```

---

### 1.3 Fix Matter Creation Schema Error

**Issue:** Cannot create matters - description column doesn't exist

**Error:** `column "description" of relation "deals" does not exist`

**Location:**
- Controller: `backend/src/modules/sales/controllers/matter.controller.ts`
- Service: `backend/src/modules/sales/services/matter.service.ts`
- Schema: `database/migrations/001_multi_tenancy_foundation.sql` (deals table)

**Root Cause:** Trying to insert `description` into deals table which doesn't have this column

**Fix Options:**
1. **Option A:** Use `notes` column instead of `description`
2. **Option B:** Add `description` column to deals table
3. **Option C:** Map `description` to existing column in service layer

**Steps (Option A - Recommended):**
1. Open matter controller create method
2. Map request body `description` to `notes` column
3. Update matter service INSERT statement
4. Test matter creation

**Alternative (Option B):**
1. Create migration 007 to add description column:
```sql
ALTER TABLE deals ADD COLUMN description TEXT;
```
2. Run migration
3. Test matter creation

---

### 1.4 Fix Billing Pack Client ID Missing

**Issue:** Cannot generate billing packs - missing client_id

**Error:** `null value in column "client_id" violates not-null constraint`

**Location:** `backend/src/modules/time-tracking/services/billing-pack.service.ts`

**Root Cause:** Billing pack creation doesn't derive client_id from matter

**Steps to Fix:**
1. Open billing pack service `create()` method
2. Query matter to get company_id:
```sql
SELECT company_id FROM deals WHERE id = $1
```
3. Use that company_id as client_id for billing pack
4. Update INSERT statement to include client_id
5. Test billing pack generation

**Modified Logic:**
```typescript
// Get matter and company
const matter = await pool.query(
  'SELECT company_id FROM deals WHERE id = $1',
  [matter_id]
);
const client_id = matter.rows[0].company_id;

// Create billing pack with client_id
const result = await pool.query(
  `INSERT INTO billing_packs (firm_id, matter_id, client_id, ...)
   VALUES ($1, $2, $3, ...)`,
  [firm_id, matter_id, client_id, ...]
);
```

---

## 🟡 PRIORITY 2: FEATURE GAPS (Important)

### 2.1 Implement Document Routing HTTP Layer

**Issue:** Document routing services exist but no HTTP routes exposed

**Missing Endpoints:**
- `GET /api/v1/legal-crm/document-routing/rules`
- `POST /api/v1/legal-crm/document-routing/rules`
- `PUT /api/v1/legal-crm/document-routing/rules/:id`
- `DELETE /api/v1/legal-crm/document-routing/rules/:id`
- `GET /api/v1/legal-crm/documents/permissions`
- `POST /api/v1/legal-crm/documents/permissions`

**Existing Services:**
- ✅ `backend/src/modules/legal-crm/services/document-permission.service.ts`
- ✅ `backend/src/modules/legal-crm/services/document-access.service.ts`

**Steps to Implement:**

1. **Create Routing Rules Controller**
   - File: `backend/src/modules/legal-crm/controllers/routing-rules.controller.ts`
   - Methods: getAll, getById, create, update, delete, testRule

2. **Create Document Permissions Controller**
   - File: `backend/src/modules/legal-crm/controllers/document-permissions.controller.ts`
   - Methods: getAll, getByDocument, grant, revoke, check

3. **Create Routing Rules Service**
   - File: `backend/src/modules/legal-crm/services/routing-rules.service.ts`
   - Use existing routing_rules table
   - Implement round-robin logic

4. **Update Legal CRM Routes**
   - File: `backend/src/modules/legal-crm/routes/legal-crm.routes.ts`
   - Add routing rules routes
   - Add document permissions routes

5. **Test All Endpoints**

**Example Controller Structure:**
```typescript
// routing-rules.controller.ts
export class RoutingRulesController {
  async getAll(req, res) { }
  async getById(req, res) { }
  async create(req, res) { }
  async update(req, res) { }
  async delete(req, res) { }
  async testRule(req, res) { }  // Test if document matches rule
  async applyRules(req, res) { } // Apply rules to document
}
```

---

### 2.2 Implement Missing AI Endpoints

**Issue:** Some AI features have services but missing HTTP endpoints

**To Add:**
- Document text analysis endpoint (generic)
- Batch processing status endpoint
- AI insights dashboard data endpoint

**Steps:**
1. Review existing AI services
2. Create missing controllers
3. Add routes to ai.routes.ts
4. Test all AI features end-to-end

---

## 🟢 PRIORITY 3: ENHANCEMENTS (Nice to have)

### 3.1 Verify Migration 005 Completion

**Issue:** Some AI tables might not have been created

**Expected Tables:**
- ai_interactions
- document_analyses

**Steps:**
1. Check if tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_interactions', 'document_analyses');
```
2. If missing, re-run migration 005
3. Verify data can be inserted

---

### 3.2 Add API Request Validation

**Issue:** Some endpoints lack proper input validation

**Endpoints to Enhance:**
- Time entry creation (validate duration > 0)
- Invoice creation (validate amounts > 0)
- Matter creation (validate required fields)

**Steps:**
1. Add express-validator rules
2. Create validation middleware
3. Add error messages
4. Test with invalid data

---

### 3.3 Improve Error Messages

**Issue:** Generic "internal server error" messages hide root cause

**Steps:**
1. Review error handler middleware
2. Add specific error codes
3. Include helpful error messages
4. Log detailed errors server-side
5. Return sanitized errors to client

---

### 3.4 Add Response Data Consistency

**Issue:** Some endpoints return `data.data` while others return `data.invoice`

**Steps:**
1. Standardize all API responses:
```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```
2. Update all controllers to use consistent format
3. Document response structure

---

## 🔵 PRIORITY 4: TESTING (Quality)

### 4.1 Expand Test Coverage

**Missing Tests:**
- Invoice update and payment recording
- Time entry approval workflow
- Matter stage transitions
- Lightning Path Kanban operations
- Document routing rule matching
- FICA compliance checking
- Contract analysis

**Steps:**
1. Create test suite for each module
2. Add integration tests
3. Add edge case tests
4. Set up CI/CD testing

---

### 4.2 Create Test Data Seeder

**Issue:** Hard to test without realistic data

**Steps:**
1. Create seed script for:
   - Multiple companies
   - Multiple matters at different stages
   - Sample invoices
   - Time entries
   - Documents
2. Add command: `npm run seed:test`

---

### 4.3 Multi-Firm Isolation Testing

**Issue:** Cannot test firm isolation with only 1 firm

**Steps:**
1. Create second test firm in seed data
2. Create users in different firms
3. Test cross-firm access attempts
4. Verify all queries include firm_id filter

---

## 📋 CHECKLIST

Copy this checklist to track progress:

### Critical Fixes
- [ ] Fix invoicing list endpoint (500 error)
- [ ] Fix time entry schema mismatch (date vs entry_date)
- [ ] Fix matter creation schema error (description column)
- [ ] Fix billing pack client_id derivation

### Feature Gaps
- [ ] Implement document routing HTTP layer
  - [ ] Create routing rules controller
  - [ ] Create document permissions controller
  - [ ] Add routes to legal-crm
  - [ ] Test all endpoints
- [ ] Implement missing AI endpoints
  - [ ] Document analysis endpoint
  - [ ] Batch processing status

### Enhancements
- [ ] Verify migration 005 AI tables
- [ ] Add API request validation
- [ ] Improve error messages
- [ ] Standardize response format

### Testing
- [ ] Expand test coverage
- [ ] Create test data seeder
- [ ] Multi-firm isolation tests

---

## 🚀 QUICK START

**To fix the most critical issues first:**

```bash
# 1. Fix time entry schema
cd backend/src/modules/time-tracking/controllers
# Edit time-entry.controller.ts - change 'date' to 'entry_date'

# 2. Fix matter creation
cd ../sales/controllers
# Edit matter.controller.ts - change 'description' to 'notes'

# 3. Fix billing pack client_id
cd ../time-tracking/services
# Edit billing-pack.service.ts - add client_id derivation

# 4. Fix invoicing list
cd ../invoicing/services
# Edit invoice.service.ts - debug getAll() method

# 5. Test fixes
cd ../../../..
node test-comprehensive-backend.js
```

---

## 📊 SUCCESS METRICS

**Target:** 90%+ test pass rate

**Current:** 63.3% (19/30 tests passing)

**After Priority 1 Fixes:** Expected 80%+ (24/30 tests passing)

**After Priority 2 Fixes:** Expected 90%+ (27/30 tests passing)

---

**Document Created:** 2026-02-08
**Last Updated:** 2026-02-08
**Next Review:** After implementing Priority 1 fixes
