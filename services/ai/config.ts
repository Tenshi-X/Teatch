import { ThinkingLevel } from '@google/genai';

export const AI_MODEL = 'gemini-3.8-flash';
// Ordered failover; each model is called at most once per generation.
export const SUPPORTED_AI_MODELS = [
  AI_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
] as const;
export type AIModel = (typeof SUPPORTED_AI_MODELS)[number];
export const AI_GENERATION_TIMEOUT_MS = 45_000;
export const AI_MODEL_SETTINGS = {
  'gemini-3.8-flash': { thinkingLevel: ThinkingLevel.LOW, timeoutMs: 20_000 },
  'gemini-3.5-flash-lite': {
    thinkingLevel: ThinkingLevel.MINIMAL,
    timeoutMs: 10_000,
  },
  'gemini-3.6-flash': {
    thinkingLevel: ThinkingLevel.MEDIUM,
    timeoutMs: 15_000,
  },
} as const;
export function resolveAIModel(value = AI_MODEL) {
  if (!(SUPPORTED_AI_MODELS as readonly string[]).includes(value))
    throw new Error('AI_CONFIG_INVALID');
  return value as AIModel;
}
export function generationModelOrder(primary = AI_MODEL): AIModel[] {
  const selected = resolveAIModel(primary);
  return SUPPORTED_AI_MODELS.slice(SUPPORTED_AI_MODELS.indexOf(selected));
}
export function generationOutputTokenLimit(params: {
  questionCount: number;
  questionType: string;
}) {
  const perQuestion =
    params.questionType === 'story_qa'
      ? 550
      : params.questionType === 'essay'
        ? 350
        : 240;
  // maxOutputTokens includes internal thinking as well as the final JSON.
  return Math.min(16_384, params.questionCount * perQuestion + 256 + 4096);
}
export function canFallbackFromError(error: unknown): boolean {
  const e = error as { status?: number; message?: string } | null;
  if (e?.message === 'AI_CONFIG_INVALID') return false;
  if (typeof e?.status === 'number')
    return [403, 404, 408, 429].includes(e.status) || e.status >= 500;
  return true;
}
export type GenerationErrorCode =
  | 'AI_CONFIG_INVALID'
  | 'AI_ACCESS_DENIED'
  | 'AI_RATE_LIMIT'
  | 'AI_TIMEOUT'
  | 'AI_TRANSPORT'
  | 'AI_TRUNCATED'
  | 'GENERATION_INVALID';
export function classifyGenerationError(error: unknown): GenerationErrorCode {
  const e = error as {
    status?: number;
    name?: string;
    code?: string;
    message?: string;
  } | null;
  if (e?.message === 'AI_CONFIG_INVALID') return 'AI_CONFIG_INVALID';
  if ([400, 401, 403, 404].includes(e?.status || 0)) return 'AI_ACCESS_DENIED';
  if (e?.status === 429) return 'AI_RATE_LIMIT';
  if (
    e?.status === 408 ||
    e?.status === 504 ||
    ['AbortError', 'TimeoutError'].includes(e?.name || '') ||
    /timeout|timed out/i.test(e?.message || '')
  )
    return 'AI_TIMEOUT';
  return 'AI_TRANSPORT';
}
export function generationFailureMessage(code: string) {
  const messages: Record<string, string> = {
    AI_CONFIG_INVALID: 'Konfigurasi model belum tersedia. Hubungi pengelola.',
    AI_ACCESS_DENIED:
      'Layanan AI belum dapat diakses. Pengelola perlu memeriksa konfigurasi provider.',
    AI_RATE_LIMIT:
      'Layanan AI sedang mencapai batas permintaan. Coba lagi nanti.',
    AI_TIMEOUT: 'Layanan AI melewati batas waktu. Coba kembali nanti.',
    AI_TRANSPORT: 'Sambungan ke layanan AI terputus. Coba kembali nanti.',
    AI_TRUNCATED:
      'Respons AI belum lengkap. Coba dengan jumlah soal lebih sedikit.',
    GENERATION_INVALID:
      'Soal belum memenuhi pemeriksaan mutu. Silakan buat latihan baru.',
  };
  return (
    messages[code] || 'Pembuatan belum berhasil. Silakan buat latihan baru.'
  );
}
