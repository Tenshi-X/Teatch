import type { GenerationUsage } from './generation';

export const GEMINI_PRICING_SOURCE =
  'https://ai.google.dev/gemini-api/docs/pricing';

// Standard text generation, no tools or explicit caching. USD per million tokens.
// Review these prices when Google changes its published tariff.
export function paidModelRates(model: string, at: Date) {
  if (!Number.isFinite(at.getTime())) return null;
  if (model === 'gemini-3.5-flash-lite') return { input: 0.3, output: 2.5 };
  if (model === 'gemini-3.8-flash' || model === 'gemini-3.6-flash') {
    const introductory = at.getTime() < Date.parse('2027-01-01T00:00:00Z');
    return introductory
      ? { input: 0.75, output: 3.75 }
      : { input: 1.5, output: 7.5 };
  }
  return null;
}

// Missing usage must remain unknown, especially after timeouts and fallbacks.
// This is a token-price estimate, not a provider invoice or a cost guarantee.
export function estimatePaidUsageUSD(
  usage: GenerationUsage,
  at = new Date()
): number | null {
  const attempts = usage.attempts?.length ? usage.attempts : [usage];
  let cost = 0;
  for (const attempt of attempts) {
    if (attempt.calls === 0) continue;
    if (!attempt.metered || attempt.calls !== 1) return null;
    const rates = paidModelRates(attempt.model, at);
    if (!rates) return null;
    const tokens = [
      attempt.inputTokens,
      attempt.outputTokens,
      attempt.thinkingTokens,
      attempt.totalTokens,
    ];
    if (
      tokens.some((n) => !Number.isFinite(n) || n < 0) ||
      attempt.totalTokens <
        attempt.inputTokens + attempt.outputTokens + attempt.thinkingTokens
    )
      return null;
    cost +=
      (attempt.inputTokens * rates.input +
        (attempt.outputTokens + attempt.thinkingTokens) * rates.output) /
      1_000_000;
  }
  return cost;
}
