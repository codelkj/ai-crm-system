# Comprehensive Backend Test Report

**Generated:** 2026-02-08T05:37:17.415Z

**Backend URL:** http://localhost:3000/api/v1

**Firm ID:** 00000000-0000-0000-0000-000000000001

**User ID:** 2dfc8f84-fe23-44ca-b2d8-5186e8d90a1c

---

## Summary

- ✅ **Passed:** 19
- ❌ **Failed:** 9
- ⚠️ **Warnings:** 2
- 📊 **Total Tests:** 30
- 📈 **Success Rate:** 63.3%

---

## Authentication & User Management

### ✅ Database: Check existing users

**Details:** Found 1 users: admin@example.com

### ✅ Login with admin@example.com

**Details:** Token received, User: admin@example.com

### ✅ Get current user (/auth/me)

**Details:** User: undefined, Role: undefined

## Invoicing System (Phase 2)

### ✅ Database: Check invoicing tables

**Details:** Tables found: invoice_line_items, invoices

### ✅ Database: Get test company/client

**Details:** Company ID: e11319fb-1adb-4691-94d2-f00d245173a5

### ✅ Create invoice with line items

**Details:** Invoice undefined created, Total: $undefined

### ❌ List all invoices

**Details:** {"error":{"code":"INTERNAL_SERVER_ERROR","message":"An unexpected error occurred"}}

## Time Tracking System (Phase 3)

### ✅ Database: Check time tracking tables

**Details:** Tables found: billing_pack_entries, billing_packs, time_entries

### ✅ Database: Get test matter

**Details:** Matter ID: 75cabfec-c4ef-4669-ac21-733c76588a04

### ❌ Create time entry

**Details:** {"error":"null value in column \"entry_date\" of relation \"time_entries\" violates not-null constraint"}

### ✅ List time entries

**Details:** Found 0 time entries

### ❌ Generate billing pack

**Details:** {"error":"null value in column \"client_id\" of relation \"billing_packs\" violates not-null constraint"}

## Lightning Path & Matters (Phase 4)

### ✅ Database: Check matters tables

**Details:** Tables found: deals, lightning_stages, matter_assignments, matter_services

### ✅ List all matters

**Details:** Found 15 matters

### ❌ Create matter

**Details:** {"success":false,"error":"column \"description\" of relation \"deals\" does not exist"}

### ❌ List Lightning Path stages

**Details:** {"success":false,"error":"invalid input syntax for type uuid: \"lightning-path\""}

## AI Integration (Phase 5)

### ✅ Database: Check AI tables

**Details:** Tables found: 

### ✅ AI Assistant chat

**Details:** Response received: undefined...

### ✅ Sales pipeline AI insights

**Details:** Insights generated: 0 recommendations

### ❌ Document analysis

**Details:** "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Cannot POST /api/v1/ai/analyze-document</pre>\n</body>\n</html>\n"

### ✅ Quick insights generation

**Details:** 0 insights generated

## Document Routing (Phase 6)

### ✅ Database: Check document routing tables

**Details:** Tables found: 

### ❌ List routing rules

**Details:** "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Cannot GET /api/v1/legal-crm/document-routing/rules</pre>\n</body>\n</html>\n"

### ❌ Create routing rule

**Details:** "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Cannot POST /api/v1/legal-crm/document-routing/rules</pre>\n</body>\n</html>\n"

### ❌ List document permissions

**Details:** "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<title>Error</title>\n</head>\n<body>\n<pre>Cannot GET /api/v1/legal-crm/documents/permissions</pre>\n</body>\n</html>\n"

## Multi-Tenancy & Security

### ⚠️ Firm data isolation

**Details:** Cannot test - only one firm exists

### ✅ Check user role

**Details:** Current user role: admin

### ⚠️ RBAC: Non-admin blocked

**Details:** Cannot test - current user is admin

### ✅ Audit logging active

**Details:** 10 audit logs in last hour

### ✅ JWT: Reject missing token

**Details:** Endpoints correctly reject requests without token

