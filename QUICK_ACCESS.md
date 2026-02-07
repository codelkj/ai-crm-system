# 🚀 Quick Access Guide

## Application URLs

### 🌐 Frontend Application
**URL**: http://localhost:5173
- Main UI for CRM system
- React + TypeScript + Vite
- Interactive dashboards and forms

### 🔧 Backend API
**URL**: http://localhost:3000
- RESTful API endpoints
- Node.js + Express + TypeScript
- JWT authentication

### 📚 API Documentation

#### Swagger UI (Interactive)
**URL**: http://localhost:3000/api/v1/docs
- Interactive API testing
- Try endpoints directly in browser
- File upload support for CSV and PDF
- JWT authentication built-in

#### ReDoc (Clean Docs)
**URL**: http://localhost:3000/api/v1/redoc
- Clean, professional API documentation
- Better for reading and understanding
- Same content as Swagger, different UI

### 💾 Database
**Host**: localhost:5432
**Database**: crm_ai_db
**User**: crm_user
**Password**: crm_password (default)

---

## 🔐 Quick Authentication

### Get a Token (Easiest Method)
```bash
cd backend
node get-token.js
```

This will:
1. Create a new user automatically
2. Generate a JWT token
3. Display it clearly for copy-paste

### Use Token in Swagger UI
1. Open http://localhost:3000/api/v1/docs
2. Click green "Authorize" button (top right)
3. Paste the token (ONLY the token, no "Bearer" prefix)
4. Click "Authorize" → "Close"
5. You're authenticated! 🎉

---

## 🧪 Quick API Tests

### 1. Test Authentication
**GET** http://localhost:3000/api/v1/auth/me
- Should return your user profile
- Confirms JWT token is working

### 2. Test Financial Categories
**GET** http://localhost:3000/api/v1/financial/categories
- Lists all 15 pre-seeded categories
- Income and expense categories

### 3. Test AI CSV Upload
**POST** http://localhost:3000/api/v1/financial/transactions/upload
- Upload: `backend/test-transactions.csv`
- Uses OpenAI GPT-4 to categorize transactions
- Returns 95% confidence scores

### 4. Test CRM
**GET** http://localhost:3000/api/v1/crm/companies
- Lists all companies
- Includes pagination

### 5. Test Kanban
**GET** http://localhost:3000/api/v1/sales/kanban
- Sales pipeline board view
- Deals grouped by stage

---

## 🎯 Available Test Files

### CSV Upload Test
**File**: `backend/test-transactions.csv`
- 15 sample transactions
- Mix of income and expenses
- Tests AI categorization

**How to use**:
1. Create a bank account first (POST /financial/bank-accounts)
2. Upload CSV with the account ID
3. Watch AI categorize with 95% confidence!

---

## 🔗 Quick Links Summary

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main UI |
| Backend | http://localhost:3000 | API Server |
| Swagger UI | http://localhost:3000/api/v1/docs | Interactive API Docs |
| ReDoc | http://localhost:3000/api/v1/redoc | Clean API Docs |
| Database | localhost:5432 | PostgreSQL |
| Health Check | http://localhost:3000/health | Server status |

---

## 📖 Documentation Files

- `README.md` - Main documentation
- `SWAGGER_AUTH_GUIDE.md` - Detailed authentication guide
- `API_DESIGN.md` - API architecture
- `DATABASE_SCHEMA.md` - Database structure
- `ARCHITECTURE.md` - System architecture
- `FILE_STRUCTURE.md` - Project organization
- `QUICK_START.md` - Getting started guide

---

## 💡 Tips

### Token Expired?
Tokens expire after 7 days. Just run `node get-token.js` again to get a fresh one.

### Can't Access Frontend?
Make sure you're using port 5173, not 80:
- ✅ http://localhost:5173
- ❌ http://localhost

### 401 Unauthorized Error?
1. Make sure you clicked "Authorize" in Swagger
2. Verify you pasted ONLY the token (no "Bearer" prefix)
3. Try getting a fresh token with `get-token.js`

### Database Connection Error?
Check if PostgreSQL is running:
```bash
# Windows
net start postgresql

# Or check with:
psql -h localhost -p 5432 -U crm_user -d crm_ai_db
```

---

## 🎉 Everything Working!

All systems tested and operational:
- ✅ Frontend running on port 5173
- ✅ Backend running on port 3000
- ✅ Database running on port 5432
- ✅ Swagger UI accessible
- ✅ JWT authentication working
- ✅ AI categorization tested (95% confidence)
- ✅ All endpoints documented

Happy coding! 🚀
