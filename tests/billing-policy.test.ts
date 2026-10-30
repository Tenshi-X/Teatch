import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GenerateContentResponse, FinishReason } from '@google/genai';
import {
  resolveAIProvider,
  AIProviderError,
  type AISubscription,
} from '@/services/ai/billing-policy';
import { generateWithProvider } from '@/services/ai/provider-generation';
import { GenerationError } from '@/services/ai/generation';
import { generationInputSchema } from '@/lib/learning/contracts';
import type { AIGenerateParams } from '@/types';
import { fixtures } from './fixtures';

const env: NodeJS.ProcessEnv = {
  NODE_ENV: 'test',
  GEMINI_FREE_API_KEY: 'test-free-credential',
  GEMINI_FREE_PROJECT_ID: 'teatch-free-test',
  GEMINI_PAID_API_KEY: 'test-paid-credential',
  GEMINI_PAID_PROJECT_ID: 'teatch-paid-test',
  GEMINI_API_KEY: 'test-legacy-credential',
  TEATCH_AI_MODEL: 'gemini-3.8-flash',
};
const subscription = (tier = 'free_trial'): AISubscription => ({
  subscription_tier: tier,
  subscription_status: 'active',
  subscription_period_end: null,
});
const params: AIGenerateParams = {
  age: 8,
  level: 'SD',
  grade: 'Kelas 2',
  subject: 'Matematika',
  questionType: 'short_answer',
  difficulty: 'mudah',
  questionCount: 1,
};
function response() {
  const result = new GenerateContentResponse();
  result.candidates = [
    {
      content: {
        parts: [
          {
            text: JSON.stringify({ title: 'Tambah', questions: [fixtures[2]] }),
          },
        ],
      },
      finishReason: FinishReason.STOP,
    },
  ];
  result.usageMetadata = {
    promptTokenCount: 2000,
    candidatesTokenCount: 400,
    thoughtsTokenCount: 100,
    totalTokenCount: 2500,
  };
  return result;
}

test('trial and every active paid plan use separate credentials selected from the database tier', () => {
  const free = resolveAIProvider(subscription(), env);
  assert.equal(free.billingTier, 'free');
  assert.equal(free.apiKey, env.GEMINI_FREE_API_KEY);
  assert.equal(free.keySource, 'GEMINI_FREE_API_KEY');
  for (const tier of ['basic', 'pro', 'family', 'teacher']) {
    const paid = resolveAIProvider(subscription(tier), env);
    assert.equal(paid.billingTier, 'paid');
    assert.equal(paid.apiKey, env.GEMINI_PAID_API_KEY);
    assert.equal(paid.keySource, 'GEMINI_PAID_API_KEY');
  }
});

test('missing trial credentials never fall through to paid or legacy keys, and vice versa', () => {
  for (const value of [undefined, '', '   ']) {
    assert.throws(
      () =>
        resolveAIProvider(subscription(), {
          ...env,
          GEMINI_FREE_API_KEY: value,
        }),
      (error) =>
        error instanceof AIProviderError &&
        error.code === 'AI_FREE_CONFIG_MISSING'
    );
    assert.throws(
      () =>
        resolveAIProvider(subscription('basic'), {
          ...env,
          GEMINI_PAID_API_KEY: value,
        }),
      (error) =>
        error instanceof AIProviderError &&
        error.code === 'AI_PAID_CONFIG_MISSING'
    );
  }
  assert.equal(
    resolveAIProvider(subscription(), {
      ...env,
      GEMINI_PAID_API_KEY: undefined,
    }).billingTier,
    'free'
  );
  assert.equal(
    resolveAIProvider(subscription('basic'), {
      ...env,
      GEMINI_FREE_API_KEY: undefined,
    }).billingTier,
    'paid'
  );
});

test('identical keys or declared project IDs are refused rather than charging a shared project', () => {
  for (const config of [
    { ...env, GEMINI_PAID_API_KEY: '  test-free-credential  ' },
    { ...env, GEMINI_PAID_PROJECT_ID: '  teatch-free-test  ' },
  ])
    for (const tier of ['free_trial', 'basic']) {
      assert.throws(
        () => resolveAIProvider(subscription(tier), config),
        (error) =>
          error instanceof AIProviderError &&
          error.code === 'AI_BILLING_CONFIG_INVALID' &&
          !error.message.includes('credential')
      );
    }
});

test('unknown, canceled, past-due and expired subscriptions cannot use the paid key', () => {
  for (const tier of [null, '', 'admin', 'enterprise'])
    assert.throws(
      () =>
        resolveAIProvider({ ...subscription(), subscription_tier: tier }, env),
      AIProviderError
    );
  for (const status of ['canceled', 'past_due', null])
    assert.throws(
      () =>
        resolveAIProvider(
          { ...subscription('pro'), subscription_status: status },
          env
        ),
      (error) => error instanceof AIProviderError && error.status === 403
    );
  for (const expiry of [
    '2026-01-01T00:00:00Z',
    'bad-date',
    '2026-10-30T00:00:00Z',
  ])
    assert.throws(
      () =>
        resolveAIProvider(
          { ...subscription('pro'), subscription_period_end: expiry },
          env,
          Date.parse('2026-10-30T00:00:00Z')
        ),
      AIProviderError
    );
});

test('browser-supplied tier, key and model cannot be added to generation input', () => {
  const input = generationInputSchema.parse({
    childId: '11111111-1111-4111-8111-111111111111',
    subjectId: '22222222-2222-4222-8222-222222222222',
    requestKey: '33333333-3333-4333-8333-333333333333',
    questionCount: 1,
    questionType: 'short_answer',
    difficulty: 'mudah',
    subscription_tier: 'pro',
    billingTier: 'paid',
    apiKey: 'browser-key',
    model: 'another-model',
  });
  for (const key of ['subscription_tier', 'billingTier', 'apiKey', 'model'])
    assert.ok(!(key in input));
});

test('all trial fallback attempts stay on the free credential, and failure usage never contains secrets', async () => {
  const provider = resolveAIProvider(subscription(), env);
  const keys: string[] = [],
    models: string[] = [];
  await assert.rejects(
    generateWithProvider(params, provider, (key) => {
      keys.push(key);
      return {
        generateContent: async ({ model }) => {
          models.push(model);
          throw { status: 429 };
        },
      };
    }),
    (error) => {
      assert.ok(error instanceof GenerationError);
      assert.equal(error.usage.billingTier, 'free');
      assert.equal(error.usage.keySource, 'GEMINI_FREE_API_KEY');
      assert.equal(error.usage.calls, 3);
      assert.equal(error.usage.configuredProjectId, 'teatch-free-test');
      assert.ok(!JSON.stringify(error.usage).includes('credential'));
      return true;
    }
  );
  assert.deepEqual(keys, [env.GEMINI_FREE_API_KEY]);
  assert.deepEqual(models, [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
  ]);
});

test('paid successes record token cost and routing without saving the key', async () => {
  const provider = resolveAIProvider(subscription('basic'), env);
  const result = await generateWithProvider(params, provider, (key) => {
    assert.equal(key, env.GEMINI_PAID_API_KEY);
    return { generateContent: async () => response() };
  });
  assert.equal(result.usage.billingTier, 'paid');
  assert.equal(result.usage.keySource, 'GEMINI_PAID_API_KEY');
  assert.equal(typeof result.usage.estimatedCostUSD, 'number');
  assert.equal(result.usage.pricingDate?.length, 10);
  assert.ok(!JSON.stringify(result.usage).includes('test-paid-credential'));
});
