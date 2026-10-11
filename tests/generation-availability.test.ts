import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveGenerationAvailability } from '@/lib/learning/generation-availability';

test('disabled generation is explicitly unavailable before a request is saved or submitted', () => {
  const result = resolveGenerationAvailability(false, [], 'parent');
  assert.equal(result.enabled, false);
  assert.match(result.message || '', /belum diaktifkan/);
});

test('pilot restrictions and enabled generation agree for the form and API', () => {
  assert.equal(
    resolveGenerationAvailability(true, ['pilot'], 'other').enabled,
    false
  );
  assert.deepEqual(resolveGenerationAvailability(true, ['pilot'], 'pilot'), {
    enabled: true,
    message: null,
  });
  assert.deepEqual(resolveGenerationAvailability(true, [], 'parent'), {
    enabled: true,
    message: null,
  });
});
