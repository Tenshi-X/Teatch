import 'server-only';
import { GoogleGenAI } from '@google/genai';
import type { AIGenerateParams } from '@/types';
import { generateWorksheetWithClient } from './generation';
import { resolveAIModel } from './config';
export { GenerationError } from './generation';
export async function generateWorksheet(params: AIGenerateParams) {
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: 55000, retryOptions: { attempts: 1 } },
  });
  return generateWorksheetWithClient(
    params,
    client.models,
    resolveAIModel(process.env.TEATCH_AI_MODEL)
  );
}
