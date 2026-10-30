import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimatePaidUsageUSD, paidModelRates } from '@/services/ai/usage-cost';
import type { GenerationUsage } from '@/services/ai/generation';
const date = new Date('2026-10-30T00:00:00Z');
const usage: GenerationUsage = {
  model: 'gemini-3.8-flash',
  promptVersion: 3,
  inputTokens: 2000,
  outputTokens: 400,
  thinkingTokens: 100,
  totalTokens: 2500,
  durationMs: 100,
  valid: true,
  calls: 1,
  metered: true,
  questionCount: 1,
  level: 'SD',
  subject: 'Matematika',
  questionType: 'short_answer',
  difficulty: 'mudah',
};
test('paid estimates include input, output and thinking at the published date-dependent prices', () => {
  assert.equal(estimatePaidUsageUSD(usage, date), 0.003375);
  assert.equal(
    estimatePaidUsageUSD(
      {
        ...usage,
        outputTokens: 3000,
        thinkingTokens: 500,
        totalTokens: 5500,
        questionCount: 10,
      },
      date
    ),
    0.014625
  );
  assert.equal(
    estimatePaidUsageUSD(usage, new Date('2027-01-01T00:00:00Z')),
    0.00675
  );
  assert.deepEqual(paidModelRates('gemini-3.5-flash-lite', date), {
    input: 0.3,
    output: 2.5,
  });
});
test('fallback costs use each attempt model rate rather than applying the last model price to all tokens', () => {
  const attempts = [
    { ...usage, valid: false },
    { ...usage, model: 'gemini-3.5-flash-lite' },
  ];
  assert.ok(
    Math.abs(
      estimatePaidUsageUSD({ ...usage, calls: 2, attempts }, date)! - 0.005225
    ) < 1e-12
  );
  assert.equal(estimatePaidUsageUSD({ ...usage, calls: 2 }, date), null);
});
test('unmetered, unknown-model and invalid token usage stay unknown instead of claiming zero cost', () => {
  for (const sample of [
    { ...usage, metered: false },
    { ...usage, model: 'unknown' },
    { ...usage, inputTokens: -1 },
    { ...usage, totalTokens: 1 },
  ])
    assert.equal(estimatePaidUsageUSD(sample, date), null);
  assert.equal(
    estimatePaidUsageUSD(
      { ...usage, attempts: [{ ...usage, metered: false }, usage] },
      date
    ),
    null
  );
});
