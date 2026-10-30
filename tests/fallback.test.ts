import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import {
  GenerateContentResponse,
  FinishReason,
  ThinkingLevel,
  GoogleGenAI,
} from '@google/genai';
import { generateWorksheetWithFallback } from '@/services/ai/fallback';
import { GenerationError } from '@/services/ai/generation';
import { fulfillGeneration, PipelineError } from '@/services/ai/pipeline';
import {
  AI_MODEL,
  SUPPORTED_AI_MODELS,
  generationModelOrder,
} from '@/services/ai/config';
import type { AIGenerateParams } from '@/types';
import { fixtures } from './fixtures';

const params: AIGenerateParams = {
  age: 8,
  level: 'SD',
  grade: 'Kelas 2',
  subject: 'Matematika',
  questionType: 'short_answer',
  difficulty: 'mudah',
  questionCount: 1,
};
function validResponse() {
  const response = new GenerateContentResponse();
  response.candidates = [
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
  response.usageMetadata = {
    promptTokenCount: 100,
    candidatesTokenCount: 60,
    thoughtsTokenCount: 20,
    totalTokenCount: 180,
  };
  return response;
}

test('the primary returns immediately without calling either fallback', async () => {
  const models: string[] = [];
  const result = await generateWorksheetWithFallback(params, {
    generateContent: async (request) => {
      models.push(request.model);
      return validResponse();
    },
  });
  assert.deepEqual(models, ['gemini-3.8-flash']);
  assert.equal(result.usage.model, AI_MODEL);
  assert.equal(result.usage.requestedModel, AI_MODEL);
  assert.equal(result.usage.calls, 1);
  assert.equal(result.usage.metered, true);
  assert.equal(result.usage.totalTokens, 180);
  assert.equal(result.usage.attempts?.length, 1);
});

test('model access, capacity and network failures switch to Flash-Lite and stop after success', async () => {
  for (const failure of [
    { status: 403 },
    { status: 404 },
    { status: 429 },
    { status: 503 },
    new Error('offline'),
  ]) {
    const models: string[] = [];
    const result = await generateWorksheetWithFallback(params, {
      generateContent: async (request) => {
        models.push(request.model);
        if (models.length === 1) throw failure;
        assert.equal(
          request.config?.thinkingConfig?.thinkingLevel,
          ThinkingLevel.MINIMAL
        );
        assert.equal(request.config?.thinkingConfig?.thinkingBudget, undefined);
        assert.equal(request.config?.httpOptions?.retryOptions?.attempts, 1);
        return validResponse();
      },
    });
    assert.deepEqual(models, ['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
    assert.equal(result.usage.model, 'gemini-3.5-flash-lite');
    assert.equal(result.usage.calls, 2);
    assert.equal(result.usage.totalTokens, 180);
    // Missing usage on the failed call must not be represented as measured zero cost.
    assert.equal(result.usage.metered, false);
    assert.equal(result.usage.attempts?.[1].totalTokens, 180);
    assert.ok(result.usage.attempts?.[0].errorCode);
  }
});

test('both earlier models failing reaches 3.6 once, and all failures return every attempt', async () => {
  for (const succeeds of [true, false]) {
    const models: string[] = [];
    const pending = generateWorksheetWithFallback(params, {
      generateContent: async (request) => {
        models.push(request.model);
        if (models.length < 3 || !succeeds)
          throw { status: 503, message: 'private provider text' };
        assert.equal(
          request.config?.thinkingConfig?.thinkingLevel,
          ThinkingLevel.MEDIUM
        );
        return validResponse();
      },
    });
    if (succeeds) {
      const result = await pending;
      assert.equal(result.usage.model, 'gemini-3.6-flash');
      assert.equal(result.usage.calls, 3);
      assert.equal(result.usage.attempts?.length, 3);
    } else {
      await assert.rejects(pending, (error) => {
        assert.ok(error instanceof GenerationError);
        assert.equal(error.usage.calls, 3);
        assert.equal(error.usage.attempts?.length, 3);
        assert.equal(error.usage.valid, false);
        assert.ok(
          !JSON.stringify(error.usage).includes('private provider text')
        );
        return true;
      });
    }
    assert.deepEqual(models, [...SUPPORTED_AI_MODELS]);
  }
});

test('bad credentials, invalid requests, blocked responses and invalid questions do not trigger fallback', async () => {
  for (const outcome of [
    'credentials',
    'request',
    'safety',
    'truncated',
    'invalid',
  ]) {
    let calls = 0;
    await assert.rejects(
      generateWorksheetWithFallback(params, {
        generateContent: async () => {
          calls++;
          if (outcome === 'credentials') throw { status: 401 };
          if (outcome === 'request') throw { status: 400 };
          const response = validResponse();
          if (outcome === 'safety')
            response.candidates![0].finishReason = FinishReason.SAFETY;
          if (outcome === 'truncated')
            response.candidates![0].finishReason = FinishReason.MAX_TOKENS;
          if (outcome === 'invalid')
            response.candidates![0].content!.parts = [
              { text: '{"title":"Bad","questions":[]}' },
            ];
          return response;
        },
      }),
      GenerationError
    );
    assert.equal(calls, 1);
  }
  let calls = 0;
  await assert.rejects(
    generateWorksheetWithFallback(
      params,
      {
        generateContent: async () => {
          calls++;
          return validResponse();
        },
      },
      'gemini-2.5-flash'
    ),
    /AI_CONFIG_INVALID/
  );
  assert.equal(calls, 0);
  assert.deepEqual(generationModelOrder('gemini-3.5-flash-lite'), [
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
  ]);
});

test('timeouts abort each request and exhaust the entire chain within 45 seconds', async (t) => {
  t.mock.timers.enable({ apis: ['Date', 'setTimeout'], now: 0 });
  const models: string[] = [];
  const signals: AbortSignal[] = [];
  const deadlines: number[] = [];
  const pending = generateWorksheetWithFallback(params, {
    generateContent: async (request) => {
      models.push(request.model);
      signals.push(request.config!.abortSignal!);
      deadlines.push(request.config!.httpOptions!.timeout!);
      return new Promise<GenerateContentResponse>(() => {});
    },
  });
  // Attach the rejection observer before advancing any timers.
  const rejected = assert.rejects(pending, (error) => {
    assert.ok(error instanceof GenerationError);
    assert.equal(error.code, 'AI_TIMEOUT');
    assert.equal(error.usage.durationMs, 45_000);
    assert.equal(error.usage.calls, 3);
    assert.equal(error.usage.metered, false);
    return true;
  });
  for (const elapsed of [20_000, 10_000, 15_000]) {
    t.mock.timers.tick(elapsed);
    await setImmediate();
  }
  await rejected;
  assert.deepEqual(models, [...SUPPORTED_AI_MODELS]);
  assert.deepEqual(deadlines, [20_000, 10_000, 15_000]);
  assert.ok(signals.every((signal) => signal.aborted));
});

test('a fallback within one pipeline saves once, or refunds once if every model fails', async () => {
  for (const succeeds of [true, false]) {
    let calls = 0,
      saves = 0,
      refunds = 0;
    const pending = fulfillGeneration({
      generate: () =>
        generateWorksheetWithFallback(params, {
          generateContent: async () => {
            calls++;
            if (calls === 1 || !succeeds) throw { status: 429 };
            return validResponse();
          },
        }),
      save: async ({ usage }) => {
        saves++;
        assert.equal(usage.calls, 2);
        assert.equal(usage.model, 'gemini-3.5-flash-lite');
        return 'one-worksheet';
      },
      release: async (_code, usage) => {
        refunds++;
        assert.equal(usage?.calls, 3);
        assert.equal(usage?.attempts?.length, 3);
        return { status: 'failed' };
      },
    });
    if (succeeds) assert.equal(await pending, 'one-worksheet');
    else await assert.rejects(pending, PipelineError);
    assert.equal(calls, succeeds ? 2 : 3);
    assert.equal(saves, succeeds ? 1 : 0);
    assert.equal(refunds, succeeds ? 0 : 1);
  }
});

test('the real SDK sends compatible Gemini 3 payloads and does not retry before switching models', async () => {
  const requests: {
    url: string;
    body: { generationConfig: Record<string, unknown> };
  }[] = [];
  const client = new GoogleGenAI({
    apiKey: 'local-test-key',
    httpOptions: {
      fetch: async (url, init) => {
        requests.push({
          url: String(url),
          body: JSON.parse(String(init?.body)),
        });
        const code =
          requests.length === 1 ? 429 : requests.length === 2 ? 503 : 200;
        return new Response(
          JSON.stringify(
            code === 200
              ? validResponse()
              : {
                  error: {
                    code,
                    message: 'Model unavailable',
                    status: code === 429 ? 'RESOURCE_EXHAUSTED' : 'UNAVAILABLE',
                  },
                }
          ),
          { status: code, headers: { 'Content-Type': 'application/json' } }
        );
      },
    },
  });
  const result = await generateWorksheetWithFallback(params, client.models);
  assert.equal(result.usage.calls, 3);
  assert.deepEqual(
    requests.map(({ url }) => /models\/([^:]+):generateContent/.exec(url)?.[1]),
    [...SUPPORTED_AI_MODELS]
  );
  for (const [index, { body }] of requests.entries()) {
    const config = body.generationConfig;
    assert.equal(config.candidateCount, undefined);
    assert.equal(config.temperature, undefined);
    assert.equal(config.responseMimeType, 'application/json');
    assert.ok(config.responseJsonSchema);
    assert.deepEqual(config.thinkingConfig, {
      thinkingLevel: [
        ThinkingLevel.LOW,
        ThinkingLevel.MINIMAL,
        ThinkingLevel.MEDIUM,
      ][index],
    });
    assert.equal(config.maxOutputTokens, 4592);
  }
});
