import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GenerateContentResponse,
  FinishReason,
  ThinkingLevel,
} from '@google/genai';
import {
  generateWorksheetWithClient,
  GenerationError,
  AI_MODEL,
  type GenerationUsage,
} from '@/services/ai/generation';
import { fulfillGeneration, PipelineError } from '@/services/ai/pipeline';
import type { AIGenerateParams } from '@/types';
import { fixtures } from './fixtures';
import { resolveAIModel } from '@/services/ai/config';
const params: AIGenerateParams = {
  age: 8,
  level: 'SD',
  grade: 'Kelas 2',
  subject: 'Matematika',
  questionType: 'short_answer',
  difficulty: 'mudah',
  questionCount: 1,
};
function response(value: unknown, finish = FinishReason.STOP) {
  const r = new GenerateContentResponse();
  r.candidates = [
    {
      content: { parts: [{ text: JSON.stringify(value) }] },
      finishReason: finish,
    },
  ];
  r.usageMetadata = {
    promptTokenCount: 100,
    candidatesTokenCount: 60,
    thoughtsTokenCount: 0,
    totalTokenCount: 160,
  };
  return r;
}
test('generation uses the production model and exactly one structured-output call with bounded output', async () => {
  let calls = 0;
  const result = await generateWorksheetWithClient(params, {
    generateContent: async (req) => {
      calls++;
      assert.equal(req.model, AI_MODEL);
      assert.equal(req.model, 'gemini-3.8-flash');
      assert.equal(req.config?.candidateCount, undefined);
      assert.equal(req.config?.temperature, undefined);
      assert.equal(req.config?.thinkingConfig?.thinkingBudget, undefined);
      assert.equal(
        req.config?.thinkingConfig?.thinkingLevel,
        ThinkingLevel.LOW
      );
      assert.equal(req.config?.httpOptions?.retryOptions?.attempts, 1);
      assert.equal(req.config?.responseMimeType, 'application/json');
      assert.ok(Number(req.config?.maxOutputTokens) <= 16384);
      assert.ok(req.config?.responseJsonSchema);
      return response({ title: 'Tambah', questions: [fixtures[2]] });
    },
  });
  assert.equal(calls, 1);
  assert.equal(result.usage.valid, true);
  assert.equal(result.usage.metered, true);
  assert.equal(result.usage.totalTokens, 160);
});
test('single-model evaluation never retries invalid, truncated or transport-failed responses', async () => {
  for (const outcome of ['invalid', 'truncated', 'network']) {
    let calls = 0;
    await assert.rejects(
      generateWorksheetWithClient(params, {
        generateContent: async () => {
          calls++;
          if (outcome === 'network') throw new Error('network');
          return response(
            { title: 'Bad', questions: [] },
            outcome === 'truncated'
              ? FinishReason.MAX_TOKENS
              : FinishReason.STOP
          );
        },
      }),
      (e) =>
        e instanceof GenerationError && e.usage.calls === 1 && !e.usage.valid
    );
    assert.equal(calls, 1);
  }
});

test('model choice is server allowlisted and errors keep distinct codes without exposing provider text', async () => {
  assert.throws(() => resolveAIModel('arbitrary-model'), /AI_CONFIG_INVALID/);
  assert.equal(
    resolveAIModel('gemini-3.5-flash-lite'),
    'gemini-3.5-flash-lite'
  );
  for (const [failure, code] of [
    [{ status: 403, message: 'secret' }, 'AI_ACCESS_DENIED'],
    [{ status: 429 }, 'AI_RATE_LIMIT'],
    [{ name: 'TimeoutError' }, 'AI_TIMEOUT'],
    [{ message: 'offline' }, 'AI_TRANSPORT'],
  ] as const) {
    await assert.rejects(
      generateWorksheetWithClient(params, {
        generateContent: async () => {
          throw failure;
        },
      }),
      (e) =>
        e instanceof GenerationError &&
        e.code === code &&
        !e.message.includes('secret') &&
        e.usage.calls === 1
    );
  }
  let calls = 0;
  await assert.rejects(
    generateWorksheetWithClient(
      params,
      {
        generateContent: async () => {
          calls++;
          return response({});
        },
      },
      'invalid'
    ),
    (e) => e instanceof GenerationError && e.code === 'AI_CONFIG_INVALID'
  );
  assert.equal(calls, 0);
  const result = await generateWorksheetWithClient(
    params,
    {
      generateContent: async (req) => {
        assert.equal(req.model, 'gemini-3.5-flash-lite');
        return response({ title: 'Tambah', questions: [fixtures[2]] });
      },
    },
    'gemini-3.5-flash-lite'
  );
  assert.equal(result.usage.grade, 'Kelas 2');
});
const usage: GenerationUsage = {
  model: AI_MODEL,
  promptVersion: 2,
  inputTokens: 100,
  outputTokens: 60,
  thinkingTokens: 0,
  totalTokens: 160,
  durationMs: 1,
  valid: true,
  calls: 1,
  metered: true,
  questionCount: 1,
  level: 'SD',
  subject: 'Matematika',
  questionType: 'short_answer',
  difficulty: 'mudah',
};
const generated = {
  worksheet: { title: 'Latihan', questions: [fixtures[2]] },
  usage,
};
test('pipeline saves a valid draft once; failed model and failed save return the reservation with usage', async () => {
  for (const failure of ['none', 'ai', 'save']) {
    let calls = 0,
      saves = 0,
      releases = 0;
    const operation = fulfillGeneration({
      generate: async () => {
        calls++;
        if (failure === 'ai')
          throw new GenerationError(
            { ...usage, valid: false },
            'GENERATION_INVALID'
          );
        return generated;
      },
      save: async () => {
        saves++;
        if (failure === 'save') throw new Error('save');
        return 'worksheet';
      },
      release: async (code, meter) => {
        releases++;
        assert.equal(
          code,
          failure === 'ai' ? 'GENERATION_INVALID' : 'SAVE_FAILED'
        );
        assert.equal(meter?.totalTokens, 160);
        return { status: 'failed' };
      },
    });
    if (failure === 'none') {
      assert.equal(await operation, 'worksheet');
      assert.equal(releases, 0);
    } else {
      await assert.rejects(operation, PipelineError);
      assert.equal(releases, 1);
    }
    assert.equal(calls, 1);
    assert.equal(saves, failure === 'ai' ? 0 : 1);
  }
});
test('lost database response recovers committed worksheet; refund failure is reported without claiming success', async () => {
  const common = {
    generate: async () => generated,
    save: async () => {
      throw new Error('HTTP response lost');
    },
  };
  assert.equal(
    await fulfillGeneration({
      ...common,
      release: async () => ({ status: 'succeeded', worksheetId: 'committed' }),
    }),
    'committed'
  );
  await assert.rejects(
    fulfillGeneration({
      ...common,
      release: async () => {
        throw new Error('db unreachable');
      },
    }),
    /15 menit/
  );
});
