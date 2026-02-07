# Quick Start Guide - Financial Module Testing

## 🚀 Quick Start (5 minutes)

### Step 1: Start Docker Desktop
1. Open **Docker Desktop** application
2. Wait for the Docker icon in system tray to show "Running"

### Step 2: Start Database & Services

```bash
# Navigate to docker directory
cd docker

# Start database and Redis
docker-compose up -d database redis

# Wait ~10 seconds for database to initialize
# Verify services are running
docker ps
```

You should see:
- `crm-database` - PostgreSQL
- `crm-redis` - Redis

### Step 3: Start Backend Server

```bash
# In a new terminal, navigate to backend
cd backend

# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

Wait for: `✅ Server is running on port 3000`

### Step 4: Run Quick Verification Test

Open a new terminal and run:

```bash
cd backend

# Create test CSV file
cat > test.csv << 'EOF'
date,description,amount,type
2024-01-15,Amazon AWS,125.50,debit
2024-01-16,Client Payment,5000.00,credit
2024-01-17,Office Depot,89.99,debit
EOF

# Test the endpoints (using curl or httpie)
```

### Step 5: Full Integration Test

```bash
cd backend
npm test -- tests/integration/financial/financial.test.ts
```

## 📋 Quick Manual Test

### 1. Sign Up

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

**Copy the token from response**

### 2. Create Bank Account

```bash
# Replace YOUR_TOKEN with token from step 1
curl -X POST http://localhost:3000/api/v1/financial/bank-accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "account_name": "My Checking",
    "bank_name": "Test Bank",
    "account_type": "checking"
  }'
```

**Copy the account ID from response**

### 3. Upload CSV

```bash
# Replace YOUR_TOKEN and YOUR_ACCOUNT_ID
curl -X POST http://localhost:3000/api/v1/financial/transactions/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.csv" \
  -F "account_id=YOUR_ACCOUNT_ID" \
  -F "csv_format=standard"
```

**Check the response** - should show:
- ✅ `successful: 3` (all transactions processed)
- ✅ Each transaction has `category_id` and `ai_confidence`
- ✅ AI categorized "Amazon AWS" → "Software & Subscriptions"

## 🎯 What to Verify

1. **CSV Upload Works**: File uploads without errors
2. **AI Categorization Works**: Each transaction has a `category_id` and `category_name`
3. **Confidence Scores**: `ai_confidence` is between 0 and 1
4. **Duplicate Detection**: Re-uploading shows `duplicates: 3`
5. **Transactions Retrievable**: Can query transactions with filters

## 🐛 Common Issues

### "Database connection error"
```bash
# Check if database is running
docker ps | grep crm-database

# Restart database
docker-compose restart database
```

### "OpenAI API error"
- Verify `OPENAI_API_KEY` is set in `backend/.env`
- Check API key is valid (starts with `sk-proj-`)
- System will fallback to "Other" category if AI fails

### "Port 3000 already in use"
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

## ✅ Success Indicators

You'll know it's working when:
- ✅ Server starts without errors
- ✅ CSV upload returns `successful > 0`
- ✅ Transactions have `category_name` (not just category_id)
- ✅ AI confidence scores are > 0.5 for clear categories
- ✅ Duplicate upload shows `duplicates > 0`

## 📚 Next Steps

- See `TEST_PLAN.md` for comprehensive testing
- Check `API_DESIGN.md` for full API documentation
- Review implementation in `backend/src/modules/financial/`

---

**Note**: The OpenAI API key you provided is already configured in `backend/.env`!
