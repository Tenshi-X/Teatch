import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';
import { parseReportResult } from '@/lib/learning/report-result';
import { LearningSummary } from '@/components/learning/learning-summary';

test('report failures preserve database diagnostics on the server without returning them to the client', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const result = parseReportResult(
    'learning_summary',
    {
      data: null,
      error: {
        code: 'PGRST202',
        message: 'Function not in schema cache',
        hint: 'Reload schema',
      },
    },
    z.array(z.string())
  );
  assert.deepEqual(result, { status: 'unavailable' });
  assert.deepEqual(log.mock.calls[0].arguments, [
    '[reports] learning_summary failed',
    {
      code: 'PGRST202',
      message: 'Function not in schema cache',
      hint: 'Reload schema',
    },
  ]);
  assert.ok(!JSON.stringify(result).includes('PGRST202'));
});

test('an unavailable report stays distinct from a successful empty report or invalid response', (t) => {
  const log = t.mock.method(console, 'error', () => {});
  const schema = z.array(z.string());
  assert.deepEqual(
    parseReportResult('learning_summary', { data: [], error: null }, schema),
    { status: 'ready', data: [] }
  );
  assert.deepEqual(
    parseReportResult('learning_summary', { data: null, error: null }, schema),
    { status: 'unavailable' }
  );
  assert.equal(log.mock.callCount(), 1);
});

test('a failed learning summary renders a status instead of an empty-history claim and disables printing', () => {
  const html = renderToStaticMarkup(
    <LearningSummary topics={[]} unavailable />
  );
  assert.ok(html.includes('role="status"'));
  assert.ok(html.includes('Ringkasan perkembangan belum dapat dimuat'));
  assert.ok(!html.includes('Belum ada jawaban yang selesai dinilai'));
  assert.match(html, /<button[^>]*disabled=""/);
  const empty = renderToStaticMarkup(<LearningSummary topics={[]} />);
  assert.ok(empty.includes('Belum ada jawaban yang selesai dinilai'));
});
