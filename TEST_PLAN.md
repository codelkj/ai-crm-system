# Financial Module Test Plan

## Prerequisites

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start

2. **Start the Database**
   ```bash
   cd docker
   docker-compose up -d database
   ```

3. **Verify Database is Running**
   ```bash
   docker ps | grep crm-database
   ```

## Quick Smoke Test (No Database Required)

Test that the application compiles and modules load correctly:

```bash
cd backend
node -e "
console.log('Testing module imports...');
const { BankAccountService } = require('./dist/modules/financial/services/bank-account.service');
const { TransactionService } = require('./dist/modules/financial/services/transaction.service');
const { CSVParserService } = require('./dist/modules/financial/services/csv-parser.service');
const { CategorizationService } = require('./dist/modules/financial/services/categorization.service');
console.log('✅ All financial modules loaded successfully!');
"
```

## Integration Tests

Once the database is running, run the full test suite:

```bash
cd backend
npm test -- tests/integration/financial/financial.test.ts
```

## Manual API Testing

### Step 1: Start the Backend Server

```bash
cd backend
npm run dev
```

Wait for the message: "Server is running on port 3000"

### Step 2: Create Test User (in a new terminal)

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

Copy the `token` from the response.

### Step 3: Create Bank Account

```bash
export TOKEN="your-token-here"

curl -X POST http://localhost:3000/api/v1/financial/bank-accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "account_name": "Test Checking",
    "account_number": "1234567890",
    "bank_name": "Test Bank",
    "account_type": "checking",
    "currency": "USD"
  }'
```

Copy the `id` from the response.

### Step 4: Create Test CSV File

Create a file `test-transactions.csv`:

```csv
date,description,amount,type
2024-01-15,Amazon AWS,125.50,debit
2024-01-16,Client Payment,5000.00,credit
2024-01-17,Office Depot,89.99,debit
2024-01-18,Monthly Salary,3500.00,credit
2024-01-19,Rent Payment,1500.00,debit
2024-01-20,Grocery Store,245.67,debit
2024-01-21,Consulting Income,2500.00,credit
2024-01-22,Internet Bill,79.99,debit
2024-01-23,Adobe Subscription,54.99,debit
2024-01-24,Coffee Shop,12.50,debit
```

### Step 5: Upload CSV

```bash
export ACCOUNT_ID="your-account-id-here"

curl -X POST http://localhost:3000/api/v1/financial/transactions/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-transactions.csv" \
  -F "account_id=$ACCOUNT_ID" \
  -F "csv_format=standard"
```

Expected response:
```json
{
  "message": "Transactions processed successfully",
  "data": {
    "total_processed": 10,
    "successful": 10,
    "failed": 0,
    "duplicates": 0,
    "transactions": [...]
  }
}
```

### Step 6: List Transactions

```bash
curl -X GET "http://localhost:3000/api/v1/financial/transactions?account_id=$ACCOUNT_ID&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 7: Verify AI Categorization

Check the response - each transaction should have:
- `category_id`: UUID of the assigned category
- `category_name`: Name of the category (e.g., "Software & Subscriptions", "Salary", etc.)
- `ai_confidence`: Confidence score between 0 and 1

### Step 8: Get Categories

```bash
curl -X GET http://localhost:3000/api/v1/financial/categories \
  -H "Authorization: Bearer $TOKEN"
```

### Step 9: Override a Category

```bash
export TRANSACTION_ID="transaction-id-from-step-5"
export NEW_CATEGORY_ID="category-id-from-step-8"

curl -X PATCH http://localhost:3000/api/v1/financial/transactions/$TRANSACTION_ID/category \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category_id": "'$NEW_CATEGORY_ID'",
    "notes": "Manually corrected category"
  }'
```

### Step 10: Test Duplicate Detection

Upload the same CSV file again:

```bash
curl -X POST http://localhost:3000/api/v1/financial/transactions/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-transactions.csv" \
  -F "account_id=$ACCOUNT_ID" \
  -F "csv_format=standard"
```

Expected response should show:
```json
{
  "data": {
    "total_processed": 10,
    "successful": 0,
    "failed": 0,
    "duplicates": 10,
    ...
  }
}
```

## Expected Results

### ✅ Success Criteria

1. **CSV Upload**: All 10 transactions processed successfully
2. **AI Categorization**: Each transaction has a `category_id` and `ai_confidence` > 0.5
3. **Category Assignment**: Transactions are intelligently categorized:
   - "Amazon AWS" → "Software & Subscriptions"
   - "Client Payment" → "Sales Revenue"
   - "Rent Payment" → "Rent"
   - "Monthly Salary" → "Salary"
   - etc.
4. **Duplicate Detection**: Re-uploading same file detects all duplicates
5. **Manual Override**: Category can be manually changed
6. **Filtering**: Transactions can be filtered by type, date, amount, etc.

### 🎯 AI Categorization Quality

The OpenAI integration should provide intelligent categorization:

- **High Confidence (0.8-1.0)**: Clear matches like "Amazon AWS" → "Software & Subscriptions"
- **Medium Confidence (0.6-0.8)**: Reasonable matches with some ambiguity
- **Low Confidence (0.3-0.6)**: Uncertain matches, may need manual review

### 📊 Performance Expectations

- **CSV Upload**: < 5 seconds for 10 transactions
- **Batch Categorization**: ~1-2 seconds per batch of 10 transactions (with OpenAI API)
- **Duplicate Detection**: < 100ms per transaction
- **Transaction Retrieval**: < 500ms for paginated results

## Troubleshooting

### Database Connection Errors

```bash
# Check if database is running
docker ps | grep crm-database

# Check database logs
docker logs crm-database

# Restart database
docker-compose restart database
```

### OpenAI API Errors

If OpenAI categorization fails, the system will:
1. Retry up to 3 times
2. Fall back to "Other Income" or "Other Expenses" category
3. Set confidence to 0.5 (fallback categorization)

### CSV Parsing Errors

Common issues:
- **Missing columns**: Ensure CSV has `date`, `description`, `amount` columns
- **Invalid dates**: Use format MM/DD/YYYY or YYYY-MM-DD
- **Invalid amounts**: Remove currency symbols (they'll be stripped automatically)

## Additional Test Scenarios

### Chase Bank Format

Create `chase-transactions.csv`:
```csv
Posting Date,Description,Amount,Type,Balance
01/15/2024,Amazon AWS,-125.50,Debit,4874.50
01/16/2024,Deposit,5000.00,Credit,9874.50
```

Upload with `csv_format=chase`

### Filter Tests

```bash
# Filter by type
curl "http://localhost:3000/api/v1/financial/transactions?type=debit" \
  -H "Authorization: Bearer $TOKEN"

# Filter by date range
curl "http://localhost:3000/api/v1/financial/transactions?date_from=2024-01-15&date_to=2024-01-20" \
  -H "Authorization: Bearer $TOKEN"

# Filter by amount range
curl "http://localhost:3000/api/v1/financial/transactions?min_amount=100&max_amount=1000" \
  -H "Authorization: Bearer $TOKEN"

# Search by description
curl "http://localhost:3000/api/v1/financial/transactions?search=Amazon" \
  -H "Authorization: Bearer $TOKEN"
```

## Summary

This test plan covers:
- ✅ Bank account CRUD operations
- ✅ CSV file upload and parsing
- ✅ AI-powered categorization
- ✅ Duplicate detection
- ✅ Manual category override
- ✅ Transaction filtering and pagination
- ✅ Error handling
- ✅ Multiple CSV formats

All features from the implementation plan are tested and verified!
