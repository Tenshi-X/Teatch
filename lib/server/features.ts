import 'server-only';
import { SUPPORTED_TYPES } from '@/lib/learning/contracts';
import { resolveGenerationAvailability } from '@/lib/learning/generation-availability';
export function generationAvailability(parentId: string) {
  return resolveGenerationAvailability(
    process.env.TEATCH_AI_ENABLED === 'true',
    (process.env.TEATCH_AI_PILOT_PARENT_IDS || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
    parentId,
    generationAccessMode()
  );
}
export function generationAccessMode() {
  return process.env.TEATCH_AI_ACCESS_MODE || 'pilot';
}
export function enabledQuestionTypes() {
  const requested = (
    process.env.TEATCH_ENABLED_TYPES ||
    'multiple_choice,short_answer,true_false'
  )
    .split(',')
    .map((s) => s.trim());
  return SUPPORTED_TYPES.filter((type) => requested.includes(type));
}
