/**
 * AI/OpenAI Configuration
 */

import OpenAI from 'openai';

// Make OpenAI optional for development with mock data
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export default openai;

export const AI_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  temperature: 0.1, // Low temperature for consistent extraction
  maxTokens: 4000,
};

/**
 * Call OpenAI API with error handling
 */
/**
 * Get OpenAI client instance
 */
export const getOpenAIClient = (): OpenAI | null => {
  return openai;
};

/**
 * Call OpenAI API with error handling
 */
export const callAI = async (prompt: string, options = {}) => {
  if (!openai) {
    throw new Error('OpenAI is not configured. Please set OPENAI_API_KEY environment variable.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens,
      ...options,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('AI processing failed');
  }
};
