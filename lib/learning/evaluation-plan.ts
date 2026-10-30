import { z } from 'zod';
export const evaluationManifestSchema = z.object({
  model: z.string(),
  repeats: z.number().int().min(1).max(100),
  rates: z.object({
    inputUSDPerMillion: z.number().nonnegative(),
    outputUSDPerMillion: z.number().nonnegative(),
    verifiedAt: z.string(),
    source: z.string(),
  }),
  budget: z.object({
    maxRequests: z.number().int().positive(),
    maxUSD: z.number().positive(),
    inputTokenCeiling: z.number().int().positive(),
  }),
  cases: z
    .array(
      z.object({
        id: z.string().min(1),
        params: z.object({
          age: z.number().int().min(6).max(12),
          level: z.literal('SD'),
          grade: z.enum(['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4']),
          subject: z.enum(['Matematika', 'Bahasa Indonesia']),
          questionType: z.enum([
            'multiple_choice',
            'short_answer',
            'true_false',
          ]),
          difficulty: z.enum(['mudah', 'sedang', 'sulit']),
          questionCount: z.number().int().min(1).max(20),
          topic: z.string().max(200),
          objectiveId: z.string().optional(),
        }),
      })
    )
    .min(1)
    .refine(
      (cases) => new Set(cases.map((item) => item.id)).size === cases.length,
      'Case IDs must be unique.'
    ),
});
export type EvaluationManifest = z.infer<typeof evaluationManifestSchema>;
export function evaluationBudget(manifest: EvaluationManifest) {
  const plannedRequests = manifest.cases.length * manifest.repeats;
  const maxUSD =
    manifest.cases.reduce(
      (sum, c) =>
        sum +
        (manifest.budget.inputTokenCeiling * manifest.rates.inputUSDPerMillion +
          (c.params.questionCount * 240 + 256) *
            manifest.rates.outputUSDPerMillion) /
          1e6,
      0
    ) * manifest.repeats;
  return {
    plannedRequests,
    estimatedCeilingUSD: maxUSD,
    allowed:
      manifest.rates.inputUSDPerMillion > 0 &&
      manifest.rates.outputUSDPerMillion > 0 &&
      !!manifest.rates.verifiedAt &&
      !!manifest.rates.source &&
      plannedRequests <= manifest.budget.maxRequests &&
      maxUSD <= manifest.budget.maxUSD,
  };
}
