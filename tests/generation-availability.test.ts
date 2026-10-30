import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveGenerationAvailability,
  generationScopeMessage,
} from '@/lib/learning/generation-availability';

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
  assert.equal(
    resolveGenerationAvailability(true, [], 'parent').enabled,
    false
  );
  assert.deepEqual(
    resolveGenerationAvailability(true, [], 'parent', 'public'),
    {
      enabled: true,
      message: null,
    }
  );
});

test('pilot scopes are enforced for class and subject, while internal/public testing retains all supported levels', () => {
  assert.equal(
    generationScopeMessage('SD', 'Kelas 2', 'Matematika', 'pilot'),
    null
  );
  assert.ok(generationScopeMessage('SMA', 'Kelas 10', 'Matematika', 'pilot'));
  assert.ok(generationScopeMessage('SD', null, 'Matematika', 'pilot'));
  assert.ok(generationScopeMessage('SD', 'Kelas 2', 'IPA', 'pilot'));
  assert.equal(
    generationScopeMessage('SMA', 'Kelas 10', 'Fisika', 'public'),
    null
  );
  assert.equal(
    resolveGenerationAvailability(false, [], 'parent', 'public').enabled,
    false
  );
  assert.equal(
    resolveGenerationAvailability(true, [], 'parent', 'unknown').enabled,
    false
  );
});
