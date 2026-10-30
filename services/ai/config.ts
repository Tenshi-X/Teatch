export const AI_MODEL = 'gemini-2.5-flash';
// New model families need their own thinking/schema compatibility evaluation.
export const SUPPORTED_AI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
] as const;
export function resolveAIModel(value = AI_MODEL) {
  if (!(SUPPORTED_AI_MODELS as readonly string[]).includes(value))
    throw new Error('AI_CONFIG_INVALID');
  return value;
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
      'Soal belum memenuhi pemeriksaan mutu. Silakan buat draf baru.',
  };
  return messages[code] || 'Pembuatan belum berhasil. Silakan buat draf baru.';
}
