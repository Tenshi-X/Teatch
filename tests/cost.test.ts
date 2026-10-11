import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCost, type Measurement } from '@/lib/learning/cost-evaluation';
const row: Measurement = {
  model: 'gemini-2.5-flash',
  level: 'SD',
  subject: 'Matematika',
  questionType: 'short_answer',
  difficulty: 'mudah',
  questionCount: 1,
  inputTokens: 100,
  outputTokens: 200,
  thinkingTokens: 0,
  totalTokens: 300,
  calls: 1,
  metered: true,
  valid: true,
  reviewedQuestions: 1,
  inconsistentKeys: 0,
};
const baseline = Array.from({ length: 20 }, (_, i) =>
  Array.from({ length: 20 }, () => ({
    ...row,
    questionCount: i + 1,
    reviewedQuestions: i + 1,
    inputTokens: 100 * (i + 1),
    outputTokens: 200 * (i + 1),
    totalTokens: 300 * (i + 1),
  }))
).flat();
const rates = { inputUSDPerMillion: 0.3, outputUSDPerMillion: 2.5 },
  coverage = { levels: ['SD'], types: ['short_answer'] };
test('cost gate permits measured savings with complete 1–20 coverage and reviewed keys', () => {
  assert.equal(
    evaluateCost(
      baseline,
      baseline.map((r) => ({
        ...r,
        outputTokens: r.outputTokens / 2,
        totalTokens: r.inputTokens + r.outputTokens / 2,
      })),
      rates,
      coverage
    ).passed,
    true
  );
});
test('cost gate blocks expensive prompts, thinking, extra calls, insufficient data, unseen cohorts and bad keys', () => {
  for (const change of [
    { inputTokens: 10000, totalTokens: 20000 },
    { thinkingTokens: 10000, totalTokens: 20000 },
    { calls: 2 },
    { metered: false },
    { inconsistentKeys: 1 },
    { subject: 'Tidak sebanding' },
  ])
    assert.equal(
      evaluateCost(
        baseline,
        baseline.map((r) => ({ ...r, ...change })),
        rates,
        coverage
      ).passed,
      false
    );
  assert.equal(evaluateCost([], [], rates, coverage).passed, false);
  assert.equal(
    evaluateCost(baseline, baseline.slice(0, 3), rates, coverage).passed,
    false
  );
  assert.equal(
    evaluateCost(
      baseline,
      baseline.map((r, i) => ({ ...r, valid: i % 20 > 1 })),
      rates,
      coverage
    ).passed,
    false
  );
});
