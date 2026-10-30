import { GoogleGenAI } from '@google/genai';
import type { AIGenerateParams } from '@/types';
import type { AIProvider } from './billing-policy';
import { generateWorksheetWithFallback } from './fallback';
import { GenerationError, type GenerationUsage } from './generation';
import { estimatePaidUsageUSD } from './usage-cost';

export async function generateWithProvider(
  params: AIGenerateParams,
  provider: AIProvider,
  createClient = (
    apiKey: string
  ): Pick<GoogleGenAI['models'], 'generateContent'> =>
    new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 1 } } })
      .models
) {
  // One credential for the entire model chain: never cross from free to paid.
  const client = createClient(provider.apiKey);
  const annotate = (usage: GenerationUsage): GenerationUsage => ({
    ...usage,
    billingTier: provider.billingTier,
    keySource: provider.keySource,
    ...(provider.billingTier === 'paid'
      ? {
          estimatedCostUSD: estimatePaidUsageUSD(usage),
          pricingDate: new Date().toISOString().slice(0, 10),
        }
      : {}),
    ...(provider.configuredProjectId
      ? { configuredProjectId: provider.configuredProjectId }
      : {}),
  });
  try {
    const result = await generateWorksheetWithFallback(
      params,
      client,
      provider.model
    );
    return { ...result, usage: annotate(result.usage) };
  } catch (error) {
    if (error instanceof GenerationError)
      throw new GenerationError(annotate(error.usage), error.code);
    throw error;
  }
}
