import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeRedirectPath } from '@/lib/auth-redirect';
test('authentication redirects only to local paths', () => {
  for (const value of [
    null,
    'https://outside.test',
    '@outside.test',
    '//outside.test',
    '/\\outside.test',
    '/\n/outside.test',
    '/foo/..//outside.test',
  ])
    assert.equal(safeRedirectPath(value), '/dashboard');
  assert.equal(
    safeRedirectPath('/worksheets/new?topic=Tambah#form'),
    '/worksheets/new?topic=Tambah#form'
  );
});
