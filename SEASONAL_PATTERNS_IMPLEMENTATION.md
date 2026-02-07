# 🔮 Cash Flow Projections & Seasonal Pattern Detection

## Overview

This implementation adds AI-powered cash flow projections and seasonal pattern detection to the financial module. The system analyzes historical transaction data to identify spending patterns and generates more accurate financial forecasts.

## Features Implemented

### 1. Enhanced Cash Flow Projections
- **Seasonal Adjustments**: Projections now incorporate detected seasonal patterns for improved accuracy
- **Extended Historical Analysis**: Uses 12 months of data (vs previous 90 days)
- **Reduced Variance**: More stable projections with ±5% variance (vs ±10%)
- **Visual Indicators**: Badge shows when seasonal adjustments are active
- **Detailed Metadata**: Displays historical data basis and averages

### 2. Seasonal Pattern Detection
- **Pattern Recognition**: Analyzes up to 24 months of transaction history
- **Statistical Analysis**: Calculates pattern strength using variance analysis
- **Year-over-Year Tracking**: Monitors growth trends per month
- **AI-Powered Insights**: GPT-4 generates actionable recommendations
- **Fallback Logic**: Works without AI when OpenAI is unavailable
- **Interactive Visualizations**: Multiple chart views and strength indicators

## Architecture

### Backend Components

#### Services
**ProjectionService** (`backend/src/modules/financial/services/projection.service.ts`)
- `generateProjection(months)` - Creates cash flow projections with seasonal adjustments
- `detectSeasonalPatterns()` - Analyzes historical data for patterns
- `generateSeasonalInsights()` - Uses AI to create actionable insights
- `generateFallbackInsights()` - Provides insights without AI

#### Controllers
**ProjectionController** (`backend/src/modules/financial/controllers/projection.controller.ts`)
- `generateProjection` - Handles projection generation requests
- `detectSeasonalPatterns` - Handles seasonal pattern analysis requests
- `getAll` - Lists all saved projections

#### Routes
**Financial Routes** (`backend/src/modules/financial/routes/financial.routes.ts`)
- `POST /api/v1/financial/projections/generate` - Generate projections
- `GET /api/v1/financial/projections/seasonal-patterns` - Get seasonal patterns
- `GET /api/v1/financial/projections` - List projections

### Frontend Components

#### Components
**SeasonalPatterns** (`frontend/src/components/financial/SeasonalPatterns.tsx`)
- Displays seasonal spending patterns with interactive charts
- Shows AI-generated insights
- Pattern strength indicators with color coding
- Year-over-year growth badges
- Responsive grid layout

**ProjectionChart** (`frontend/src/pages/Financials/ProjectionChart.tsx`)
- Enhanced with seasonal adjustment indicators
- Shows metadata about projection basis
- Visual badge when seasonal patterns detected
- Displays average income/expense data

#### Services
**FinancialService** (`frontend/src/services/financial.service.ts`)
- `getSeasonalPatterns()` - Fetches seasonal pattern data
- `generateProjection(params)` - Generates cash flow projections
- `uploadCSV(formData)` - Uploads transaction CSV files
- `updateTransactionCategory(id, categoryId)` - Updates transaction categories

## API Endpoints

### GET /api/v1/financial/projections/seasonal-patterns
Detects and returns seasonal spending patterns.

**Authentication**: Required (JWT)

**Response**:
```json
{
  "data": {
    "has_patterns": true,
    "patterns": [
      {
        "month": "Jan",
        "avg_income": 5000,
        "avg_expenses": 3500,
        "avg_balance": 1500,
        "pattern_strength": 85,
        "year_over_year_growth": 5.2
      }
    ],
    "insights": [
      "December typically has highest expenses ($4,200)",
      "March shows strongest positive cash flow (+$2,100)"
    ],
    "metadata": {
      "data_points": 48,
      "months_analyzed": 12,
      "historical_period_months": 24
    }
  }
}
```

### POST /api/v1/financial/projections/generate
Generates cash flow projection with seasonal adjustments.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "months": 6
}
```

**Response**:
```json
{
  "data": {
    "projection_data": [
      {
        "month": "Mar 2026",
        "projected_balance": 15000,
        "projected_income": 5200,
        "projected_expenses": 3600,
        "seasonal_adjustment": 8
      }
    ],
    "start_date": "2026-02-07T00:00:00.000Z",
    "end_date": "2026-08-01T00:00:00.000Z",
    "seasonal_patterns": { /* seasonal data */ },
    "metadata": {
      "months": 6,
      "avg_monthly_income": 5000,
      "avg_monthly_expenses": 3500,
      "historical_period_days": 365,
      "uses_seasonal_adjustment": true
    }
  }
}
```

## How Seasonal Detection Works

### 1. Data Collection
- Queries last 24 months of transaction data
- Groups by month and year
- Calculates income and expenses per month

### 2. Pattern Analysis
- Computes monthly averages across all years
- Measures variance to determine pattern strength
- Lower variance = stronger, more consistent pattern
- Pattern strength: 0-100% (100% = perfect consistency)

### 3. Insight Generation
- AI analyzes patterns using GPT-4
- Identifies high/low spending months
- Detects seasonal trends
- Suggests optimization opportunities
- Falls back to rule-based insights if AI unavailable

### 4. Projection Enhancement
- Applies seasonal factors to base projections
- Adjusts income/expenses per month based on historical patterns
- Shows ±% seasonal adjustment for transparency
- More accurate forecasts than simple averages

## Pattern Strength Calculation

```typescript
// Calculate standard deviation to measure consistency
const variance = data.reduce((sum, val) =>
  sum + Math.pow(val - average, 2), 0) / count;

// Lower variance = stronger pattern (inverse relationship)
const patternStrength = Math.max(0, 100 - (
  Math.sqrt(variance) / average * 100
));
```

**Interpretation**:
- **80-100%**: Very Strong - Highly predictable pattern
- **60-79%**: Strong - Reliable pattern
- **40-59%**: Moderate - Some pattern exists
- **0-39%**: Weak - Pattern not reliable

## UI Features

### Seasonal Patterns Card
- **AI Insights Section**: Gradient background with actionable recommendations
- **Interactive Charts**:
  - Balance View: Shows net cash flow by month
  - Income vs Expenses: Compares both metrics
- **Pattern Strength Indicators**: Color-coded bars (green/yellow/red)
- **YoY Growth Badges**: Shows year-over-year trends
- **Responsive Design**: Adapts to mobile/tablet/desktop

### Projection Chart Enhancements
- **Seasonal Badge**: "🔮 AI Seasonal" when patterns detected
- **Metadata Footer**: Shows historical data basis
- **Average Metrics**: Displays avg income/expenses
- **Pattern Indicator**: Highlights seasonal adjustment usage

## Testing

### Manual Testing

1. **Start Backend**:
```bash
cd backend
npm run dev
```

2. **Start Frontend**:
```bash
cd frontend
npm start
```

3. **Login and Navigate**:
- Login to the application
- Go to Financials page
- Click "Show Projections"
- View both Projection Chart and Seasonal Patterns

### API Testing

Use the provided test script:

```bash
cd backend
# Set your JWT token in test-seasonal-patterns.js
node test-seasonal-patterns.js
```

Or use curl:

```bash
# Get seasonal patterns
curl -X GET http://localhost:3001/api/v1/financial/projections/seasonal-patterns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Generate projection
curl -X POST http://localhost:3001/api/v1/financial/projections/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"months": 6}'
```

## Data Requirements

### Minimum Data
- **For Patterns**: At least 3-6 months of transactions
- **For Projections**: At least 30 days of transactions
- **Optimal**: 12-24 months for accurate seasonal detection

### Data Quality
- Regular transaction uploads for consistent patterns
- Mix of income and expenses for balanced analysis
- Categorized transactions improve insight quality

## Configuration

### Environment Variables
Ensure these are set in `.env`:

```env
OPENAI_API_KEY=your-openai-api-key
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db
JWT_SECRET=your-jwt-secret
```

### AI Configuration
- **Model**: GPT-4 (for insights generation)
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 500 (concise insights)
- **Fallback**: Rule-based insights if AI unavailable

## Performance Considerations

### Database Queries
- Uses indexed date columns for fast filtering
- Aggregates at database level for efficiency
- Limits to 24 months max for manageable datasets

### Frontend Optimization
- Lazy loading of chart components
- Debounced API calls on filter changes
- Cached responses for repeated requests
- Responsive chart rendering

## Future Enhancements

### Planned Features
- [ ] Save and compare multiple projections
- [ ] Export projections to PDF
- [ ] Category-level seasonal patterns
- [ ] Alert system for unusual spending
- [ ] Budget recommendations based on patterns
- [ ] Machine learning prediction improvements

### Integration Opportunities
- [ ] Connect with budgeting module
- [ ] Link to sales forecasting
- [ ] Integrate with reporting dashboards
- [ ] Mobile app support

## Troubleshooting

### No Patterns Detected
- **Cause**: Insufficient historical data
- **Solution**: Upload more transactions (aim for 12+ months)

### Projections Seem Inaccurate
- **Cause**: Limited or irregular transaction data
- **Solution**: Ensure regular transaction uploads, check for data gaps

### AI Insights Not Showing
- **Cause**: OpenAI API key missing or invalid
- **Solution**: Check `.env` file has valid OPENAI_API_KEY
- **Note**: Fallback insights will still work

### Chart Not Rendering
- **Cause**: Missing recharts dependency
- **Solution**: Run `npm install recharts` in frontend directory

## Support

For issues or questions:
1. Check the console logs (browser and backend)
2. Verify database has transaction data
3. Confirm OpenAI API key is valid
4. Review the test scripts for examples

## Files Modified/Created

### Backend
- ✅ `backend/src/modules/financial/services/projection.service.ts`
- ✅ `backend/src/modules/financial/controllers/projection.controller.ts`
- ✅ `backend/src/modules/financial/routes/financial.routes.ts`
- ✅ `backend/test-seasonal-patterns.js`

### Frontend
- ✅ `frontend/src/components/financial/SeasonalPatterns.tsx`
- ✅ `frontend/src/components/financial/SeasonalPatterns.css`
- ✅ `frontend/src/pages/Financials/ProjectionChart.tsx`
- ✅ `frontend/src/pages/Financials/index.tsx`
- ✅ `frontend/src/services/financial.service.ts`

---

**Implementation Date**: February 7, 2026
**Status**: ✅ Complete and Ready for Testing
