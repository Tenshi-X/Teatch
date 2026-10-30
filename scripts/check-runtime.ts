import { loadLocalEnvironment } from './environment';
import { resolveAIModel, generationModelOrder } from '@/services/ai/config';
import {
  resolveAIProvider,
  AIProviderError,
  type AIProvider,
} from '@/services/ai/billing-policy';
loadLocalEnvironment();
async function main() {
  const results: { check: string; status: string; http?: number }[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  for (const key of [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GEMINI_FREE_API_KEY',
    'GEMINI_PAID_API_KEY',
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
  const providers: AIProvider[] = [];
  for (const tier of ['free_trial', 'basic']) {
    try {
      const provider = resolveAIProvider({
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_period_end: null,
      });
      providers.push(provider);
      results.push({
        check: `routing:${provider.billingTier}`,
        status: 'configured',
      });
    } catch (error) {
      results.push({
        check: `routing:${tier === 'free_trial' ? 'free' : 'paid'}`,
        status:
          error instanceof AIProviderError
            ? error.code
            : 'invalid_configuration',
      });
    }
  }
  if (providers.length)
    results.push(
      ...(await Promise.all(
        providers.flatMap((provider) =>
          generationModelOrder(provider.model).map(async (candidate) => {
            try {
              const r = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${candidate}`,
                {
                  headers: { 'x-goog-api-key': provider.apiKey },
                  signal: AbortSignal.timeout(8000),
                }
              );
              return {
                check: `model_metadata:${provider.billingTier}:${candidate}`,
                status: r.ok ? 'reachable' : 'not_ready',
                http: r.status,
              };
            } catch (e) {
              return {
                check: `model_metadata:${provider.billingTier}:${candidate}`,
                status:
                  (e as { cause?: { code?: string } }).cause?.code ||
                  'network_unavailable',
              };
            }
          })
        )
      ))
    );
  console.log(
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        model,
        modelOrder: generationModelOrder(model),
        routing: providers.map(
          ({ billingTier, keySource, configuredProjectId }) => ({
            billingTier,
            keySource,
            configuredProjectId: configuredProjectId || null,
          })
        ),
        results,
        notes:
          'Read-only metadata checks do not prove inference eligibility or Cloud Billing linkage. Verify each key project in AI Studio and the Cloud Billing console. No generation, migration, or credential rotation.',
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
