import type { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { buildSystemPrompt, buildGeneratePrompt } from './prompts';
import {
  finalizeVisual,
  questionSchemas,
  validateWorksheet,
} from '@/lib/learning/contracts';
import type { AIGenerateParams } from '@/types';

export const AI_MODEL = 'gemini-2.5-flash';
export interface GenerationUsage {
  model: string;
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
}
export class GenerationError extends Error {
  constructor(
    public usage: GenerationUsage,
    public code: string
  ) {
    super(
      'Soal belum berhasil dibuat. Kuota dikembalikan. Silakan coba pembuatan baru.'
    );
  }
}
export async function generateWorksheetWithClient(
  params: AIGenerateParams,
  client: Pick<GoogleGenAI['models'], 'generateContent'>
) {
  const started = Date.now();
  const usage: GenerationUsage = {
    model: AI_MODEL,
    promptVersion: 2,
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
  try {
    usage.calls = 1;
    const response = await client.generateContent({
      model: AI_MODEL,
      contents: buildGeneratePrompt(params),
      config: {
        systemInstruction: buildSystemPrompt(),
        temperature: 0.4,
        candidateCount: 1,
        maxOutputTokens: Math.min(
          8192,
          params.questionCount *
            (params.questionType === 'story_qa'
              ? 550
              : params.questionType === 'essay'
                ? 350
                : 240) +
            256
        ),
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: 'application/json',
        responseJsonSchema: schema,
      },
    });
    usage.inputTokens = response.usageMetadata?.promptTokenCount || 0;
    usage.outputTokens = response.usageMetadata?.candidatesTokenCount || 0;
    usage.thinkingTokens = response.usageMetadata?.thoughtsTokenCount || 0;
    usage.totalTokens = response.usageMetadata?.totalTokenCount || 0;
    usage.metered =
      typeof response.usageMetadata?.promptTokenCount === 'number' &&
      typeof response.usageMetadata?.totalTokenCount === 'number';
    if (response.candidates?.[0]?.finishReason !== 'STOP')
      throw new Error('INCOMPLETE');
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
  } catch {
    usage.durationMs = Date.now() - started;
    throw new GenerationError(usage, 'GENERATION_INVALID');
  }
}
