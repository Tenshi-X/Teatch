import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { measurementSchema } from '@/lib/learning/cost-evaluation';
const runSchema = z.object({
  model: z.string(),
  rates: z.object({
    inputUSDPerMillion: z.number().positive(),
    outputUSDPerMillion: z.number().positive(),
    verifiedAt: z.string().min(1),
    source: z.string().min(1),
  }),
  measurements: z
    .array(
      measurementSchema.extend({
        caseId: z.string(),
        sample: z.number().int().nonnegative(),
      })
    )
    .min(1),
});
async function main() {
  const [baselineFile, candidateFile, output] = process.argv.slice(2);
  if (!baselineFile || !candidateFile || !output)
    throw Error(
      'Usage: npm run evaluate:benchmark -- baseline.samples.json candidate.samples.json report.json'
    );
  const runs = await Promise.all(
    [baselineFile, candidateFile].map(async (file) =>
      runSchema.parse(JSON.parse(await readFile(file, 'utf8')))
    )
  );
  const identity = (r: (typeof runs)[number]['measurements'][number]) =>
    JSON.stringify([
      r.caseId,
      r.sample,
      r.level,
      r.grade || '',
      r.subject,
      r.questionType,
      r.difficulty,
      r.questionCount,
    ]);
  const keys = runs.map((r) => r.measurements.map(identity).sort());
  if (JSON.stringify(keys[0]) !== JSON.stringify(keys[1]))
    throw Error(
      'Runs must contain the same paired cases, classes, difficulties and sample counts.'
    );
  const summaries = runs.map((run) => {
    if (
      new Set(run.measurements.map(identity)).size !== run.measurements.length
    )
      throw Error('Duplicate samples in a run.');
    if (run.measurements.some((r) => r.model !== run.model))
      throw Error('Mixed models in one run.');
    const valid = run.measurements.filter((r) => r.valid);
    const accepted = valid.reduce((sum, r) => sum + r.questionCount, 0);
    const cost = run.measurements.reduce(
      (sum, r) =>
        sum +
        (r.inputTokens * run.rates.inputUSDPerMillion +
          (r.outputTokens + r.thinkingTokens) * run.rates.outputUSDPerMillion) /
          1e6,
      0
    );
    return {
      model: run.model,
      rates: run.rates,
      samples: run.measurements.length,
      validRate: valid.length / run.measurements.length,
      totalUSD: cost,
      costPerAcceptedQuestion: accepted ? cost / accepted : null,
      allMetered: run.measurements.every(
        (r) =>
          r.metered &&
          r.calls === 1 &&
          r.totalTokens >= r.inputTokens + r.outputTokens + r.thinkingTokens
      ),
      allKeysReviewed: valid.every(
        (r) =>
          r.reviewedQuestions === r.questionCount && r.inconsistentKeys === 0
      ),
    };
  });
  await writeFile(
    output,
    JSON.stringify(
      {
        purpose:
          'Paired model comparison only; does not replace the same-model cost gate.',
        selectionRequired: true,
        summaries,
      },
      null,
      2
    ) + '\n'
  );
  console.log(
    'Benchmark written. Model selection and the same-model prompt gate remain separate.'
  );
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : 'Benchmark failed');
  process.exitCode = 1;
});
