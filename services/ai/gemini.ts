import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt, buildGeneratePrompt } from './prompts';
import type { AIGenerateParams, AIGeneratedWorksheet } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
  'gemini-pro'
];

/**
 * Generate a worksheet using Google Gemini API.
 * Returns structured JSON with questions.
 */
export async function generateWorksheet(
  params: AIGenerateParams
): Promise<AIGeneratedWorksheet> {
  const prompt = buildGeneratePrompt(params);
  let lastError: any = null;

  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`Mencoba menggunakan model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
        systemInstruction: buildSystemPrompt(),
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const parsed = JSON.parse(text) as AIGeneratedWorksheet;

      // Validate structure
      if (!parsed.title || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response structure from AI');
      }

      console.log(`Berhasil menggunakan model: ${modelName}`);
      return parsed;
    } catch (error: any) {
      console.error(`Gagal dengan model ${modelName}:`, error?.message || error);
      lastError = error;
      
      // Jika errornya adalah rate limit, langsung lempar error agar tidak mencoba model lain secara sia-sia
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('429') || errorMessage.includes('Resource has been exhausted')) {
        throw new Error('Terlalu banyak permintaan (Rate Limit). Silakan tunggu sebentar dan coba lagi.');
      }
      
      // Jika error 404 (model not found), lanjut ke model berikutnya di array FALLBACK_MODELS
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        continue;
      }
      
      // Jika error lain (contoh: format salah), lanjut ke model berikutnya sebagai backup plan
      if (error instanceof SyntaxError) {
        continue;
      }
    }
  }

  // Jika semua model gagal
  const finalErrorMessage = lastError instanceof Error ? lastError.message : 'Unknown error';
  throw new Error(`Gagal menggenerate soal setelah mencoba semua model. Error terakhir: ${finalErrorMessage}`);
}
