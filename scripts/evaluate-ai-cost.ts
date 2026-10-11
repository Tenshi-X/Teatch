import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';
import {
  measurementSchema,
  evaluateCost,
} from '@/lib/learning/cost-evaluation';
const schema = z.object({
  baseline: z.array(measurementSchema),
  candidate: z.array(measurementSchema),
  rates: z.object({
    inputUSDPerMillion: z.number().positive(),
    outputUSDPerMillion: z.number().positive(),
  }),
  coverage: z.object({
    levels: z.array(z.string()).min(1),
    types: z.array(z.string()).min(1),
  }),
});
async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output)
    throw new Error(
      'Penggunaan: npm run evaluate:cost -- pengukuran.json laporan.json'
    );
  const data = schema.parse(JSON.parse(await readFile(input, 'utf8')));
  const result = evaluateCost(
    data.baseline,
    data.candidate,
    data.rates,
    data.coverage
  );
  await writeFile(output, JSON.stringify(result, null, 2) + '\n');
  console.log(
    result.passed
      ? 'LULUS: biaya, token dan mutu memenuhi ambang.'
      : `BELUM LULUS: ${result.issues.length} syarat belum terpenuhi. Lihat laporan.`
  );
  if (!result.passed) process.exitCode = 1;
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : 'Evaluasi gagal.');
  process.exitCode = 1;
});
