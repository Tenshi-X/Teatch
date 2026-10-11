import { z } from 'zod';
export const measurementSchema = z.object({
  model: z.string().min(1),
  level: z.string().min(1),
  subject: z.string().min(1),
  questionType: z.string().min(1),
  difficulty: z.string().min(1),
  questionCount: z.number().int().min(1).max(20),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  thinkingTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  valid: z.boolean(),
  metered: z.boolean(),
  calls: z.number().int().nonnegative(),
  reviewedQuestions: z.number().int().nonnegative(),
  inconsistentKeys: z.number().int().nonnegative(),
});
export type Measurement = z.infer<typeof measurementSchema>;
const key = (r: Measurement) =>
  JSON.stringify([
    r.model,
    r.level,
    r.subject,
    r.questionType,
    r.difficulty,
    r.questionCount,
  ]);
const percentile95 = (ns: number[]) =>
  [...ns].sort((a, b) => a - b)[Math.max(0, Math.ceil(ns.length * 0.95) - 1)] ||
  0;
export function evaluateCost(
  baseline: Measurement[],
  candidate: Measurement[],
  rates: { inputUSDPerMillion: number; outputUSDPerMillion: number },
  coverage: { levels: string[]; types: string[] }
) {
  const issues: string[] = [];
  if (!baseline.length || !candidate.length)
    issues.push('Data baseline dan kandidat wajib tersedia.');
  if (
    !Number.isFinite(rates.inputUSDPerMillion) ||
    !Number.isFinite(rates.outputUSDPerMillion) ||
    rates.inputUSDPerMillion <= 0 ||
    rates.outputUSDPerMillion <= 0
  )
    issues.push('Tarif model harus tarif produksi yang terverifikasi.');
  const groups = (rows: Measurement[]) => {
    const m = new Map<string, Measurement[]>();
    for (const r of rows) {
      const parsed = measurementSchema.safeParse(r);
      if (!parsed.success) {
        issues.push('Format pengukuran tidak valid.');
        continue;
      }
      m.set(key(r), [...(m.get(key(r)) || []), r]);
    }
    return m;
  };
  const old = groups(baseline),
    next = groups(candidate);
  const summary = (rs: Measurement[]) => {
    const questions = rs
      .filter((r) => r.valid)
      .reduce((n, r) => n + r.questionCount, 0);
    const cost = (r: Measurement) =>
      (r.inputTokens * rates.inputUSDPerMillion +
        (r.outputTokens + r.thinkingTokens) * rates.outputUSDPerMillion) /
      1e6;
    return {
      samples: rs.length,
      validRate: rs.filter((r) => r.valid).length / rs.length,
      costPerAcceptedQuestion: questions
        ? rs.reduce((n, r) => n + cost(r), 0) / questions
        : Infinity,
      p95CostPerRequestedQuestion: percentile95(
        rs.map((r) => cost(r) / r.questionCount)
      ),
      p95InputPerQuestion: percentile95(
        rs.map((r) => r.inputTokens / r.questionCount)
      ),
      p95OutputPerQuestion: percentile95(
        rs.map((r) => (r.outputTokens + r.thinkingTokens) / r.questionCount)
      ),
    };
  };
  for (const r of candidate) {
    if (r.calls !== 1)
      issues.push('Kandidat harus satu panggilan per pembuatan.');
    if (!r.metered)
      issues.push(
        'Ada pemakaian token yang belum terukur, termasuk kegagalan jaringan.'
      );
    if (r.totalTokens < r.inputTokens + r.outputTokens + r.thinkingTokens)
      issues.push('Token total tidak mencakup seluruh pemakaian.');
    if (
      r.valid &&
      (r.reviewedQuestions !== r.questionCount || r.inconsistentKeys !== 0)
    )
      issues.push('Seluruh kunci soal valid harus ditinjau dan konsisten.');
  }
  for (const r of baseline)
    if (!r.metered)
      issues.push('Baseline memiliki pemakaian yang belum terukur.');
  for (const level of coverage.levels)
    if (!candidate.some((r) => r.level === level))
      issues.push(`Jenjang ${level} belum terwakili.`);
  for (const type of coverage.types)
    if (!candidate.some((r) => r.questionType === type))
      issues.push(`Tipe ${type} belum terwakili.`);
  for (let count = 1; count <= 20; count++)
    if (!candidate.some((r) => r.questionCount === count))
      issues.push(`Jumlah ${count} soal belum terwakili.`);
  const cohorts = [];
  for (const [k, rows] of next) {
    const previous = old.get(k);
    if (!previous) {
      issues.push(`Baseline pembanding belum tersedia: ${k}`);
      continue;
    }
    const a = summary(previous),
      b = summary(rows);
    if (a.samples < 20 || b.samples < 20)
      issues.push(`Minimal 20 sampel per kelompok: ${k}`);
    if (b.validRate < 0.95) issues.push(`Respons valid di bawah 95%: ${k}`);
    for (const metric of [
      'costPerAcceptedQuestion',
      'p95CostPerRequestedQuestion',
      'p95InputPerQuestion',
      'p95OutputPerQuestion',
    ] as const)
      if (b[metric] > a[metric] + 1e-12)
        issues.push(`${metric} meningkat: ${k}`);
    cohorts.push({
      cohort: JSON.parse(k) as string[],
      baseline: a,
      candidate: b,
    });
  }
  return { passed: issues.length === 0, issues: [...new Set(issues)], cohorts };
}
