import 'server-only';
import type { AIGenerateParams } from '@/types';
import type { AIProvider } from './billing-policy';
import { generateWithProvider } from './provider-generation';
export { GenerationError } from './generation';
export async function generateWorksheet(
  params: AIGenerateParams,
  provider: AIProvider
) {
  return generateWithProvider(params, provider);
}
