/**
 * AI Prompts for Legal Document Extraction
 */

export const LEGAL_EXTRACTION_PROMPT = `
You are a legal document analysis expert. Extract key information from the provided legal document text.

Extract the following information in JSON format:
1. **Parties**: Names of all parties involved in the agreement
2. **Dates**: Key dates (effective date, termination date, renewal dates)
3. **Obligations**: Key obligations for each party
4. **Amounts**: Financial amounts, payment terms, penalties
5. **Clauses**: Important clauses (termination, confidentiality, liability, etc.)

For each extracted term, provide:
- term_type: The category (party, date, obligation, amount, clause)
- term_key: A descriptive key (e.g., "effective_date", "client_name")
- term_value: The actual extracted value
- confidence: Your confidence score (0-1)
- page_number: The page where this information was found (if available)

Document text:
{document_text}

Return ONLY valid JSON with this structure:
{
  "terms": [
    {
      "term_type": "party",
      "term_key": "client_name",
      "term_value": "Acme Corporation",
      "confidence": 0.95,
      "page_number": 1
    }
  ]
}
`;

export const LEGAL_SUMMARY_PROMPT = `
You are a legal document summarization expert. Provide a concise summary of the legal document.

Include:
1. Document type (contract, agreement, NDA, etc.)
2. Main purpose
3. Key parties
4. Critical terms and conditions
5. Important dates

Keep the summary under 500 words.

Document text:
{document_text}
`;
