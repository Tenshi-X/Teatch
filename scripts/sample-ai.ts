import { GoogleGenAI } from '@google/genai';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { loadLocalEnvironment } from './environment';
import {
  AI_MODEL,
  resolveAIModel,
  generationOutputTokenLimit,
} from '@/services/ai/config';
import {
  generateWorksheetWithClient,
  GenerationError,
} from '@/services/ai/generation';
import {
  evaluationManifestSchema,
  evaluationBudget,
} from '@/lib/learning/evaluation-plan';
import { getObjectives } from '@/lib/learning/objectives';
loadLocalEnvironment();
async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  if (!file)
    throw Error(
      'Usage: npm run evaluate:sample -- evaluation-results/manifest.json [--init|--run]'
    );
  if (args.includes('--init')) {
    const cases = [];
    for (let grade = 1; grade <= 4; grade++)
      for (const subject of ['Matematika', 'Bahasa Indonesia'])
        for (const questionType of [
          'multiple_choice',
          'short_answer',
          'true_false',
        ]) {
          const objective = getObjectives(subject, 'SD', `Kelas ${grade}`)[0];
          cases.push({
            id: `case-${cases.length + 1}`,
            params: {
              age: grade + 6,
              level: 'SD',
              grade: `Kelas ${grade}`,
              subject,
              questionType,
              difficulty: 'mudah',
              questionCount: (cases.length % 20) + 1,
              topic: objective.label,
              objectiveId: objective.id,
            },
          });
        }
    await mkdir(dirname(file), { recursive: true });
    await writeFile(
      file,
      JSON.stringify(
        {
          model: AI_MODEL,
          repeats: 20,
          rates: {
            inputUSDPerMillion: 0,
            outputUSDPerMillion: 0,
            verifiedAt: '',
            source: 'https://ai.google.dev/gemini-api/docs/pricing',
          },
          budget: { maxRequests: 20, maxUSD: 1, inputTokenCeiling: 6000 },
          cases,
        },
        null,
        2
      ) + '\n',
      { flag: 'wx' }
    );
    console.log(
      'Manifest created with unverified rates and a deliberately small budget. Review coverage, rates and budget before --run.'
    );
    return;
  }
  const manifest = evaluationManifestSchema.parse(
    JSON.parse(await readFile(file, 'utf8'))
  );
  resolveAIModel(manifest.model);
  const budget = evaluationBudget(manifest);
  console.log(
    JSON.stringify(
      { mode: args.includes('--run') ? 'run' : 'dry-run', ...budget },
      null,
      2
    )
  );
  if (!args.includes('--run')) return;
  if (!budget.allowed)
    throw Error('Budget/rate checks failed. No model request was sent.');
  if (!process.env.GEMINI_API_KEY) throw Error('GEMINI_API_KEY is missing.');
  const output = file.replace(/\.json$/, '') + '.samples.json';
  const manifestHash = createHash('sha256')
    .update(JSON.stringify(manifest))
    .digest('hex');
  type Row = { caseId: string; sample: number; [key: string]: unknown };
  let saved: {
    manifestHash: string;
    model: string;
    rates: typeof manifest.rates;
    measurements: Row[];
    spentUSD: number;
    halted?: string;
  } = {
    manifestHash,
    model: manifest.model,
    rates: manifest.rates,
    measurements: [],
    spentUSD: 0,
  };
  try {
    saved = JSON.parse(await readFile(output, 'utf8'));
    if (saved.manifestHash !== manifestHash) throw Error('MANIFEST_CHANGED');
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  if (saved.halted)
    throw Error(
      'Checkpoint requires reconciliation before resuming: ' + saved.halted
    );
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { timeout: 55000, retryOptions: { attempts: 1 } },
  });
  for (const item of manifest.cases)
    for (let sample = 0; sample < manifest.repeats; sample++) {
      if (
        saved.measurements.some(
          (r) => r.caseId === item.id && r.sample === sample
        )
      )
        continue;
      if (saved.measurements.length >= manifest.budget.maxRequests)
        throw Error('Request budget reached.');
      const callCeiling =
        (manifest.budget.inputTokenCeiling * manifest.rates.inputUSDPerMillion +
          generationOutputTokenLimit(item.params) *
            manifest.rates.outputUSDPerMillion) /
        1e6;
      if (saved.spentUSD + callCeiling > manifest.budget.maxUSD)
        throw Error('Cost budget reached.');
      let row: Row;
      try {
        const result = await generateWorksheetWithClient(
          item.params,
          client.models,
          manifest.model
        );
        row = {
          ...result.usage,
          caseId: item.id,
          sample,
          reviewedQuestions: 0,
          inconsistentKeys: 0,
          worksheet: result.worksheet,
        };
      } catch (e) {
        if (!(e instanceof GenerationError)) throw e;
        row = {
          ...e.usage,
          caseId: item.id,
          sample,
          errorCode: e.code,
          reviewedQuestions: 0,
          inconsistentKeys: 0,
        };
      }
      saved.measurements.push(row);
      saved.spentUSD +=
        (Number(row.inputTokens) * manifest.rates.inputUSDPerMillion +
          (Number(row.outputTokens) + Number(row.thinkingTokens)) *
            manifest.rates.outputUSDPerMillion) /
        1e6;
      if (!row.metered)
        saved.halted =
          'Unmetered request; reconcile usage with provider. Do not retry this sample automatically.';
      if (Number(row.inputTokens) > manifest.budget.inputTokenCeiling)
        saved.halted =
          'Input token ceiling exceeded; revise budget after reviewing provider usage.';
      await writeFile(output + '.tmp', JSON.stringify(saved, null, 2) + '\n');
      await rename(output + '.tmp', output);
      console.log(
        `${item.id} sample ${sample + 1}: ${row.valid ? 'valid, awaiting review' : 'failed'}`
      );
      if (saved.halted) throw Error(saved.halted);
    }
  console.log(
    'Sampling complete. Review all keys, set reviewedQuestions, then compare against a separately identified baseline.'
  );
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : 'Sampling failed');
  process.exitCode = 1;
});
