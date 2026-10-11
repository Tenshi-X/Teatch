import type { GeneratedWorksheet } from '@/lib/learning/contracts';
import { GenerationError, type GenerationUsage } from './generation';
export class PipelineError extends Error {
  constructor(
    message: string,
    public retrySameKey = false
  ) {
    super(message);
  }
}
type Generation = { worksheet: GeneratedWorksheet; usage: GenerationUsage };
export async function fulfillGeneration(ops: {
  generate: () => Promise<Generation>;
  save: (result: Generation) => Promise<string>;
  release: (
    code: string,
    usage: GenerationUsage | undefined
  ) => Promise<{ status: string; worksheetId?: string | null }>;
}) {
  let generated: Generation | undefined;
  try {
    generated = await ops.generate();
    return await ops.save(generated);
  } catch (error) {
    const code = generated
      ? 'SAVE_FAILED'
      : error instanceof GenerationError
        ? error.code
        : 'SERVER_ERROR';
    try {
      const outcome = await ops.release(
        code,
        generated?.usage ||
          (error instanceof GenerationError ? error.usage : undefined)
      );
      // A database commit may succeed even when its HTTP response is lost.
      if (outcome.status === 'succeeded' && outcome.worksheetId)
        return outcome.worksheetId;
      if (outcome.status !== 'failed') throw new Error('RELEASE_PENDING');
    } catch {
      throw new PipelineError(
        'Pembuatan belum selesai. Reservasi kuota akan dipulihkan pada permintaan berikutnya setelah 15 menit.',
        true
      );
    }
    throw new PipelineError(
      'Pembuatan gagal. Kuota dikembalikan. Silakan mulai pembuatan baru.'
    );
  }
}
