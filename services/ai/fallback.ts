import type { GoogleGenAI } from '@google/genai';
import type { AIGenerateParams } from '@/types';
import {
  AI_MODEL,
  AI_MODEL_SETTINGS,
  AI_GENERATION_TIMEOUT_MS,
  generationModelOrder,
} from './config';
import {
  generateWorksheetWithClient,
  GenerationError,
  type GenerationUsage,
  type ModelAttemptUsage,
} from './generation';

export async function generateWorksheetWithFallback(
  params: AIGenerateParams,
  client: Pick<GoogleGenAI['models'], 'generateContent'>,
  primary: string = AI_MODEL
) {
  const started = Date.now();
  const attempts: ModelAttemptUsage[] = [];
  const aggregate = (usage: GenerationUsage): GenerationUsage => ({
    ...usage,
    requestedModel: primary,
    attempts: [...attempts],
    calls: attempts.reduce((sum, attempt) => sum + attempt.calls, 0),
    inputTokens: attempts.reduce(
      (sum, attempt) => sum + attempt.inputTokens,
      0
    ),
    outputTokens: attempts.reduce(
      (sum, attempt) => sum + attempt.outputTokens,
      0
    ),
    thinkingTokens: attempts.reduce(
      (sum, attempt) => sum + attempt.thinkingTokens,
      0
    ),
    totalTokens: attempts.reduce(
      (sum, attempt) => sum + attempt.totalTokens,
      0
    ),
    metered: attempts.every((attempt) => attempt.metered),
    durationMs: Date.now() - started,
  });
  const record = (usage: GenerationUsage, errorCode?: string) => {
    const {
      model,
      inputTokens,
      outputTokens,
      thinkingTokens,
      totalTokens,
      durationMs,
      valid,
      calls,
      metered,
    } = usage;
    attempts.push({
      model,
      inputTokens,
      outputTokens,
      thinkingTokens,
      totalTokens,
      durationMs,
      valid,
      calls,
      metered,
      ...(errorCode ? { errorCode } : {}),
    });
  };
  let lastFailure: GenerationError | undefined;
  for (const model of generationModelOrder(primary)) {
    const remaining = AI_GENERATION_TIMEOUT_MS - (Date.now() - started);
    if (remaining <= 0) break;
    try {
      const result = await generateWorksheetWithClient(params, client, model, {
        timeoutMs: Math.min(AI_MODEL_SETTINGS[model].timeoutMs, remaining),
      });
      record(result.usage);
      return { ...result, usage: aggregate(result.usage) };
    } catch (error) {
      if (!(error instanceof GenerationError)) throw error;
      record(error.usage, error.code);
      lastFailure = error;
      if (!error.fallbackAllowed) break;
    }
  }
  // Invalid primary configuration fails before sending any provider request.
  if (!lastFailure) throw new Error('AI_CONFIG_INVALID');
  throw new GenerationError(aggregate(lastFailure.usage), lastFailure.code);
}
