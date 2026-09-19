import { getGeminiClient } from '../config/gemini.js';

export class GeminiServiceError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'GeminiServiceError';
  }
}

function parseJsonResponse(text) {
  const cleanedText = text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

  try {
    return JSON.parse(cleanedText);
  } catch {
    throw new GeminiServiceError('AI service returned an invalid structured response');
  }
}

export async function generateStructuredResponse({ prompt, systemInstruction, responseJsonSchema, model = process.env.GEMINI_MODEL || 'gemini-1.5-flash' }) {
  if (!prompt?.trim()) {
    throw new GeminiServiceError('AI prompt cannot be empty', 400);
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new GeminiServiceError('Gemini API is not configured', 503);
  }

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseJsonSchema
      }
    });
    const responseText = typeof response.text === 'string' ? response.text : '';

    if (!responseText.trim()) {
      throw new GeminiServiceError('AI service returned an empty response');
    }

    return parseJsonResponse(responseText);
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }

    console.error(`Gemini request failed: ${error.message}`);
    throw new GeminiServiceError('AI service is temporarily unavailable', 503);
  }
}
