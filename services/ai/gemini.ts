import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, buildGeneratePrompt } from './prompts';
import type { AIGenerateParams, AIGeneratedWorksheet } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate a worksheet using Google Gemini API.
 * Returns structured JSON with questions.
 */
export async function generateWorksheet(
  params: AIGenerateParams
): Promise<AIGeneratedWorksheet> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash-latest',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
    systemInstruction: buildSystemPrompt(),
  });

  const prompt = buildGeneratePrompt(params);

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const parsed = JSON.parse(text) as AIGeneratedWorksheet;

    // Validate structure
    if (!parsed.title || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid response structure from AI');
    }

    return parsed;
  } catch (error) {
    console.error('Gemini API error:', error);

    if (error instanceof SyntaxError) {
      throw new Error('AI mengembalikan format yang tidak valid. Silakan coba lagi.');
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('429')) {
      throw new Error('Terlalu banyak permintaan (Rate Limit). Silakan tunggu sebentar dan coba lagi.');
    }

    throw new Error(`Gagal menggenerate soal: ${errorMessage}`);
  }
}
