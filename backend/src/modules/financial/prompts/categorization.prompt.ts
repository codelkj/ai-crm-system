/**
 * AI Prompts for Financial Transaction Categorization
 */

export const CATEGORIZATION_PROMPT = `
You are a financial transaction categorization expert. Categorize the following bank transaction.

Available categories:
{categories}

Transaction details:
- Date: {date}
- Description: {description}
- Amount: {amount}
- Type: {type}

Analyze the transaction description and determine the most appropriate category.

Return ONLY valid JSON with this structure:
{
  "category_id": "uuid-of-category",
  "category_name": "Category Name",
  "confidence": 0.95,
  "reasoning": "Brief explanation of why this category was chosen"
}
`;

export const CASH_FLOW_PROJECTION_PROMPT = `
You are a financial forecasting expert. Based on historical transaction data, project future cash flow.

Historical data (last {months} months):
{transaction_history}

Analyze patterns including:
1. Recurring income (monthly revenue, subscriptions)
2. Recurring expenses (rent, salaries, utilities)
3. Seasonal patterns
4. Growth trends

Project cash flow for the next {projection_months} months.

Return ONLY valid JSON with this structure:
{
  "projections": [
    {
      "projection_date": "2024-03-01",
      "projected_income": 25000.00,
      "projected_expenses": 15000.00,
      "confidence": 0.85,
      "reasoning": "Based on average monthly income with 10% growth trend"
    }
  ]
}
`;
