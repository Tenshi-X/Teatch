import { loadLocalEnvironment } from './environment';
import { resolveAIModel } from '@/services/ai/config';
loadLocalEnvironment();
async function main() {
  const results: { check: string; status: string; http?: number }[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  for (const key of [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_API_KEY',
  ])
    results.push({
      check: key,
      status: process.env[key] ? 'configured' : 'missing',
    });
  let model: string;
  try {
    model = resolveAIModel(process.env.TEATCH_AI_MODEL);
  } catch {
    results.push({ check: 'model', status: 'invalid_configuration' });
    console.log(JSON.stringify(results, null, 2));
    process.exitCode = 1;
    return;
  }
  if (url && service)
    for (const table of [
      'profiles',
      'generation_requests',
      'product_feedback',
      'product_events',
    ]) {
      try {
        const r = await fetch(`${url}/rest/v1/${table}?select=id&limit=0`, {
          headers: { apikey: service, Authorization: `Bearer ${service}` },
          signal: AbortSignal.timeout(8000),
        });
        results.push({
          check: `database:${table}`,
          status: r.ok ? 'reachable' : 'not_ready',
          http: r.status,
        });
      } catch (e) {
        results.push({
          check: `database:${table}`,
          status:
            (e as { cause?: { code?: string } }).cause?.code ||
            'network_unavailable',
        });
        break;
      }
    }
  if (process.env.GEMINI_API_KEY)
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}`,
        {
          headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY },
          signal: AbortSignal.timeout(8000),
        }
      );
      results.push({
        check: 'model_metadata',
        status: r.ok ? 'reachable' : 'not_ready',
        http: r.status,
      });
    } catch (e) {
      results.push({
        check: 'model_metadata',
        status:
          (e as { cause?: { code?: string } }).cause?.code ||
          'network_unavailable',
      });
    }
  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        model,
        results,
        notes:
          'Read-only checks; no generation, migration, or credential rotation.',
      },
      null,
      2
    )
  );
  if (results.some((r) => !['configured', 'reachable'].includes(r.status)))
    process.exitCode = 1;
}
main().catch(() => {
  console.error(
    'Runtime check failed. Check configuration without sharing credentials.'
  );
  process.exitCode = 1;
});
