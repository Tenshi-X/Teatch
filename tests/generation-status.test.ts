import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readGenerationStatus } from '@/lib/learning/generation-status';
test('status recovery only reads the supplied owner/key, masks absence, and works independently of AI availability', async () => {
  let calls = 0;
  const find = async (parent: string, key: string) => {
    calls++;
    return parent === 'owner' && key === 'key'
      ? { status: 'succeeded' as const, worksheet_id: 'saved' }
      : null;
  };
  assert.equal(
    (await readGenerationStatus('owner', 'key', find)).worksheetId,
    'saved'
  );
  assert.deepEqual(
    await readGenerationStatus('other', 'key', find),
    await readGenerationStatus('owner', 'missing', find)
  );
  assert.equal(calls, 3);
  assert.equal(
    (
      await readGenerationStatus('owner', 'key', async () => ({
        status: 'failed',
        worksheet_id: null,
      }))
    ).status,
    'failed'
  );
  assert.equal(
    (
      await readGenerationStatus('owner', 'key', async () => ({
        status: 'reserved',
        worksheet_id: null,
      }))
    ).worksheetId,
    undefined
  );
  await assert.rejects(
    readGenerationStatus('owner', 'key', async () => {
      throw Error('database offline');
    })
  );
});
