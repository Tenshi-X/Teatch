import { GoogleGenAI } from '@google/genai';
import { mkdir, writeFile } from 'node:fs/promises';
import { loadLocalEnvironment } from './environment';
import { resolveAIProvider } from '@/services/ai/billing-policy';
import {
  generateWorksheetWithClient,
  GenerationError,
} from '@/services/ai/generation';
import {
  estimatePaidUsageUSD,
  paidModelRates,
  GEMINI_PRICING_SOURCE,
} from '@/services/ai/usage-cost';
import { getObjectives } from '@/lib/learning/objectives';
import type { AIGenerateParams } from '@/types';

// Explicitly invoked paid probe: one inference, no retry, no model failover,
// no user quota changes. Never log credentials or raw SDK errors.
async function main() {
  loadLocalEnvironment();
  const provider = resolveAIProvider({
    subscription_tier: 'basic',
    subscription_status: 'active',
    subscription_period_end: null,
  });
  const objective = getObjectives('Matematika', 'SD', 'Kelas 2')[0];
  const params: AIGenerateParams = {
    age: 8,
    level: 'SD',
    grade: 'Kelas 2',
    subject: 'Matematika',
    questionType: 'multiple_choice',
    difficulty: 'mudah',
    questionCount: 10,
    topic: objective.label,
    objective: objective.label,
    objectiveId: objective.id,
  };
  const client = new GoogleGenAI({
    apiKey: provider.apiKey,
    httpOptions: { retryOptions: { attempts: 1 } },
  });
  let networkCalls = 0;
  let transportError: object | undefined;
  const transport = {
    generateContent: async (
      request: Parameters<typeof client.models.generateContent>[0]
    ) => {
      if (++networkCalls > 1) throw Error('PROBE_REQUEST_LIMIT');
      try {
        return await client.models.generateContent(request);
      } catch (error) {
        const e = error as {
          status?: number;
          cause?: { code?: string };
          code?: string;
          name?: string;
        };
        transportError = {
          status: e.status,
          code: e.cause?.code || e.code,
          name: e.name,
        };
        throw error;
      }
    },
  };
  const at = new Date();
  let report: object;
  try {
    const result = await generateWorksheetWithClient(
      params,
      transport,
      provider.model
    );
    const usd = estimatePaidUsageUSD(result.usage, at);
    const futureUSD = estimatePaidUsageUSD(
      result.usage,
      new Date('2027-01-01T00:00:00Z')
    );
    const usdIDR = 18138; // BI JISDOR, 30 October 2026; not the card settlement rate.
    report = {
      testedAt: at.toISOString(),
      keySource: provider.keySource,
      networkCalls,
      params,
      usage: result.usage,
      rates: paidModelRates(provider.model, at),
      ratesSource: GEMINI_PRICING_SOURCE,
      usdIDR,
      exchangeRateSource:
        'https://www.bi.go.id/en/statistik/informasi-kurs/jisdor/Default.aspx',
      estimatedUSD: usd,
      estimatedIDR: usd === null ? null : usd * usdIDR,
      estimatedIDRPerQuestion:
        usd === null
          ? null
          : (usd * usdIDR) / result.worksheet.questions.length,
      january2027IDRPerQuestion:
        futureUSD === null
          ? null
          : (futureUSD * usdIDR) / result.worksheet.questions.length,
      worksheet: result.worksheet,
    };
  } catch (error) {
    if (!(error instanceof GenerationError)) throw error;
    report = {
      testedAt: at.toISOString(),
      keySource: provider.keySource,
      networkCalls,
      params,
      usage: error.usage,
      errorCode: error.code,
      transportError,
      estimatedUSD: estimatePaidUsageUSD(error.usage, at),
    };
    process.exitCode = 1;
  }
  await mkdir('evaluation-results', { recursive: true });
  await writeFile(
    'evaluation-results/paid-cost-probe.json',
    JSON.stringify(report, null, 2) + '\n'
  );
  const summary = { ...report } as Record<string, unknown>;
  delete summary.worksheet;
  console.log(JSON.stringify(summary, null, 2));
}
main().catch(() => {
  console.error(
    'Probe configuration or local setup failed; no secrets logged.'
  );
  process.exitCode = 1;
});
