import { resolveAIModel, type AIModel } from './config';

export type AIBillingTier = 'free' | 'paid';
export type AIKeySource = 'GEMINI_FREE_API_KEY' | 'GEMINI_PAID_API_KEY';
export interface AISubscription {
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_period_end: string | null;
}
export interface AIProvider {
  billingTier: AIBillingTier;
  keySource: AIKeySource;
  apiKey: string;
  model: AIModel;
  // Operator-supplied identity; not a claim that Google billing was verified.
  configuredProjectId?: string;
}
export class AIProviderError extends Error {
  constructor(
    public code: string,
    message: string,
    public status = 503
  ) {
    super(message);
  }
}

// Only call with the authenticated parent's database subscription, never request JSON.
export function resolveAIProvider(
  subscription: AISubscription,
  env: NodeJS.ProcessEnv = process.env,
  now = Date.now()
): AIProvider {
  const tier = subscription.subscription_tier;
  if (!['free_trial', 'basic', 'pro', 'family', 'teacher'].includes(tier || ''))
    throw new AIProviderError(
      'AI_BILLING_CONFIG_INVALID',
      'Paket akun belum dapat diverifikasi.'
    );
  const expiry = subscription.subscription_period_end;
  if (
    subscription.subscription_status !== 'active' ||
    (expiry !== null &&
      (!Number.isFinite(Date.parse(expiry)) || Date.parse(expiry) <= now))
  )
    throw new AIProviderError(
      'SUBSCRIPTION_INACTIVE',
      'Masa aktif paket telah berakhir atau paket tidak aktif.',
      403
    );

  const billingTier = tier === 'free_trial' ? 'free' : 'paid';
  const keySource =
    billingTier === 'free' ? 'GEMINI_FREE_API_KEY' : 'GEMINI_PAID_API_KEY';
  const apiKey = env[keySource]?.trim();
  if (!apiKey)
    throw new AIProviderError(
      billingTier === 'free'
        ? 'AI_FREE_CONFIG_MISSING'
        : 'AI_PAID_CONFIG_MISSING',
      billingTier === 'free'
        ? 'Layanan AI gratis untuk trial belum dikonfigurasi. Hubungi pengelola.'
        : 'Layanan AI untuk pelanggan belum dikonfigurasi. Hubungi pengelola.'
    );
  const freeKey = env.GEMINI_FREE_API_KEY?.trim();
  const paidKey = env.GEMINI_PAID_API_KEY?.trim();
  const freeProject = env.GEMINI_FREE_PROJECT_ID?.trim();
  const paidProject = env.GEMINI_PAID_PROJECT_ID?.trim();
  if (
    (freeKey && paidKey && freeKey === paidKey) ||
    (freeProject && paidProject && freeProject === paidProject)
  )
    throw new AIProviderError(
      'AI_BILLING_CONFIG_INVALID',
      'Pemisahan layanan AI belum dikonfigurasi dengan benar. Hubungi pengelola.'
    );

  return {
    billingTier,
    keySource,
    apiKey,
    model: resolveAIModel(env.TEATCH_AI_MODEL),
    configuredProjectId:
      billingTier === 'free'
        ? freeProject || undefined
        : paidProject || undefined,
  };
}
