import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluationBudget,
  evaluationManifestSchema,
} from '@/lib/learning/evaluation-plan';
import { generationOutputTokenLimit } from '@/services/ai/config';
test('evaluation cannot send samples without verified rates or beyond request/cost budgets', () => {
  const manifest = evaluationManifestSchema.parse({
    model: 'gemini-3.8-flash',
    repeats: 20,
    rates: {
      inputUSDPerMillion: 0,
      outputUSDPerMillion: 0,
      verifiedAt: '',
      source: '',
    },
    budget: { maxRequests: 20, maxUSD: 1, inputTokenCeiling: 6000 },
    cases: [
      {
        id: 'one',
        params: {
          age: 8,
          level: 'SD',
          grade: 'Kelas 2',
          subject: 'Matematika',
          questionType: 'short_answer',
          difficulty: 'mudah',
          questionCount: 10,
          topic: 'Penjumlahan',
        },
      },
    ],
  });
  assert.equal(evaluationBudget(manifest).allowed, false);
  manifest.rates = {
    inputUSDPerMillion: 1,
    outputUSDPerMillion: 1,
    verifiedAt: '2026-10-30',
    source: 'fixture tariff, not provider rates',
  };
  assert.equal(evaluationBudget(manifest).plannedRequests, 20);
  assert.equal(
    evaluationBudget(manifest).estimatedCeilingUSD,
    (20 * (6000 + generationOutputTokenLimit(manifest.cases[0].params))) / 1e6
  );
  assert.equal(evaluationBudget(manifest).allowed, true);
  manifest.budget.maxRequests = 19;
  assert.equal(evaluationBudget(manifest).allowed, false);
  manifest.budget.maxRequests = 20;
  manifest.budget.maxUSD = 0.001;
  assert.equal(evaluationBudget(manifest).allowed, false);
});
