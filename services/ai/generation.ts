import type {
  GoogleGenAI,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import { z } from 'zod';
import { buildSystemPrompt, buildGeneratePrompt } from './prompts';
import {
  finalizeVisual,
  questionSchemas,
  validateWorksheet,
} from '@/lib/learning/contracts';
import type { AIGenerateParams } from '@/types';
import {
  AI_MODEL,
  AI_MODEL_SETTINGS,
  resolveAIModel,
  classifyGenerationError,
  canFallbackFromError,
  generationOutputTokenLimit,
} from './config';

export { AI_MODEL } from './config';
export interface GenerationUsage {
  model: string;
  requestedModel?: string;
  attempts?: ModelAttemptUsage[];
  promptVersion: number;
  inputTokens: number;
  outputTokens: number;
  thinkingTokens: number;
  totalTokens: number;
  durationMs: number;
  valid: boolean;
  calls: number;
  metered: boolean;
  questionCount: number;
  level: string;
  subject: string;
  questionType: string;
  difficulty: string;
  grade?: string;
  objectiveId?: string;
}
export type ModelAttemptUsage = Pick<
  GenerationUsage,
  | 'model'
  | 'inputTokens'
  | 'outputTokens'
  | 'thinkingTokens'
  | 'totalTokens'
  | 'durationMs'
  | 'valid'
  | 'calls'
  | 'metered'
> & { errorCode?: string };
export class GenerationError extends Error {
  constructor(
    public usage: GenerationUsage,
    public code: string,
    public fallbackAllowed = false
  ) {
    super(
      'Soal belum berhasil dibuat. Kuota dikembalikan. Silakan coba pembuatan baru.'
    );
  }
}

// Enforce a local deadline as well as the SDK timeout, and abort the HTTP request.
// An aborted provider operation may still use tokens; its usage stays unmetered.
async function callWithTimeout(
  client: Pick<GoogleGenAI['models'], 'generateContent'>,
  request: GenerateContentParameters,
  timeoutMs: number
): Promise<GenerateContentResponse> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new DOMException('Generation timed out', 'TimeoutError'));
      controller.abort();
    }, timeoutMs);
  });
  try {
    return await Promise.race([
      client.generateContent({
        ...request,
        config: {
          ...request.config,
          httpOptions: { timeout: timeoutMs, retryOptions: { attempts: 1 } },
          abortSignal: controller.signal,
        },
      }),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}
export async function generateWorksheetWithClient(
  params: AIGenerateParams,
  client: Pick<GoogleGenAI['models'], 'generateContent'>,
  model: string = AI_MODEL,
  options: { timeoutMs?: number } = {}
) {
  const started = Date.now();
  const usage: GenerationUsage = {
    model,
    promptVersion: 3,
    inputTokens: 0,
    outputTokens: 0,
    thinkingTokens: 0,
    totalTokens: 0,
    durationMs: 0,
    valid: false,
    calls: 0,
    metered: false,
    questionCount: params.questionCount,
    level: params.level,
    subject: params.subject,
    questionType: params.questionType,
    difficulty: params.difficulty,
    grade: params.grade,
    objectiveId: params.objectiveId,
  };
  const schema = z.toJSONSchema(
    z.object({
      title: z.string().max(150),
      questions: z
        .array(
          questionSchemas[params.questionType as keyof typeof questionSchemas]
        )
        .length(params.questionCount),
    })
  );
  delete schema.$schema;
  let stage: 'transport' | 'truncated' | 'validation' = 'transport';
  try {
    const settings = AI_MODEL_SETTINGS[resolveAIModel(model)];
    usage.calls = 1;
    const response = await callWithTimeout(
      client,
      {
        model,
        contents: buildGeneratePrompt(params),
        config: {
          systemInstruction: buildSystemPrompt(),
          maxOutputTokens: generationOutputTokenLimit(params),
          thinkingConfig: { thinkingLevel: settings.thinkingLevel },
          responseMimeType: 'application/json',
          responseJsonSchema: schema,
        },
      },
      options.timeoutMs ?? settings.timeoutMs
    );
    usage.inputTokens = response.usageMetadata?.promptTokenCount || 0;
    usage.outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    usage.thinkingTokens = response.usageMetadata?.thoughtsTokenCount || 0;
    usage.totalTokens = response.usageMetadata?.totalTokenCount || 0;
    usage.metered =
      typeof response.usageMetadata?.promptTokenCount === 'number' &&
      typeof response.usageMetadata?.candidatesTokenCount === 'number' &&
      typeof response.usageMetadata?.totalTokenCount === 'number' &&
      usage.totalTokens >=
        usage.inputTokens + usage.outputTokens + usage.thinkingTokens;
    stage = 'truncated';
    if (response.candidates?.[0]?.finishReason !== 'STOP')
      throw new Error('INCOMPLETE');
    stage = 'validation';
    const raw = JSON.parse(response.text || '') as unknown;
    // Shape validation precedes deterministic visual corrections.
    const shape = z
      .object({
        title: z.string(),
        questions: z.array(
          questionSchemas[params.questionType as keyof typeof questionSchemas]
        ),
      })
      .parse(raw);
    const worksheet = validateWorksheet(
      {
        ...shape,
        questions: shape.questions.map((q) =>
          finalizeVisual(q, params.subject === 'Bahasa Inggris')
        ),
      },
      params
    );
    usage.valid = true;
    usage.durationMs = Date.now() - started;
    return { worksheet, usage };
  } catch (error) {
    usage.durationMs = Date.now() - started;
    throw new GenerationError(
      usage,
      stage === 'transport'
        ? classifyGenerationError(error)
        : stage === 'truncated'
          ? 'AI_TRUNCATED'
          : 'GENERATION_INVALID',
      stage === 'transport' && canFallbackFromError(error)
    );
  }
}
