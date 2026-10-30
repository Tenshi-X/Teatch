import 'server-only';
import { GoogleGenAI } from '@google/genai';
import type { AIGenerateParams } from '@/types';
import { generateWorksheetWithFallback } from './fallback';
import { resolveAIModel } from './config';
export { GenerationError } from './generation';
export async function generateWorksheet(params: AIGenerateParams) {
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { retryOptions: { attempts: 1 } },
  });
  return generateWorksheetWithFallback(
    params,
    client.models,
    resolveAIModel(process.env.TEATCH_AI_MODEL)
  );
}
