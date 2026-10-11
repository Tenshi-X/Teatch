import 'server-only';
import { SUPPORTED_TYPES } from '@/lib/learning/contracts';
export function enabledQuestionTypes() {
  const requested = (
    process.env.TEATCH_ENABLED_TYPES ||
    'multiple_choice,short_answer,true_false'
  )
    .split(',')
    .map((s) => s.trim());
  return SUPPORTED_TYPES.filter((type) => requested.includes(type));
}
