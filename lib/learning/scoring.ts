import type { GeneratedQuestion } from './contracts';
import { splitJumbleAnswer } from './contracts';
export type AnswerValue = string | string[] | Record<string, string>;
const normalize = (v: string) =>
  v.normalize('NFKC').toLocaleLowerCase('id').trim().replace(/\s+/g, ' ');
const parse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};
const isMap = (value: unknown): value is Record<string, string> =>
  !!value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.values(value).every((v) => typeof v === 'string');
export function isAnswerComplete(q: GeneratedQuestion, raw: string): boolean {
  if (!raw.trim()) return false;
  if (
    q.type === 'matching' ||
    q.type === 'image_matching' ||
    q.type === 'grouping'
  ) {
    const value = parse(raw);
    const keys =
      q.type === 'grouping'
        ? q.items.map((i) => i.name)
        : q.pairs.map((p) => p.left);
    return (
      isMap(value) &&
      Object.keys(value).length === keys.length &&
      keys.every((k) => Object.hasOwn(value, k) && !!value[k].trim())
    );
  }
  if (
    q.type === 'ordering' ||
    q.type === 'word_jumble' ||
    q.type === 'sentence_jumble'
  ) {
    const value = parse(raw);
    return (
      Array.isArray(value) &&
      value.length === q.options.length &&
      value.every((v) => typeof v === 'string' && !!v.trim())
    );
  }
  return true;
}
/** null means an adult must review, never an automatic pass. Math punctuation is preserved. */
export function gradeAnswer(q: GeneratedQuestion, raw: string): boolean | null {
  if (!raw.trim()) return false;
  if (q.type === 'essay') return null;
  if (
    q.type === 'matching' ||
    q.type === 'image_matching' ||
    q.type === 'grouping'
  ) {
    const value = parse(raw);
    if (!isMap(value)) return false;
    const expected =
      q.type === 'grouping'
        ? q.items.map((i) => [i.name, i.category])
        : q.pairs.map((p) => [p.left, p.right]);
    return (
      Object.keys(value).length === expected.length &&
      expected.every(([key, answer]) => value[key] === answer)
    );
  }
  if (
    q.type === 'ordering' ||
    q.type === 'word_jumble' ||
    q.type === 'sentence_jumble'
  ) {
    const value = parse(raw);
    const expected =
      q.type === 'ordering' ? q.correct_order : splitJumbleAnswer(q);
    return (
      Array.isArray(value) &&
      value.length === expected.length &&
      value.every((v, i) => v === expected[i])
    );
  }
  if (
    q.type === 'multiple_choice' ||
    q.type === 'choose_image' ||
    q.type === 'true_false'
  )
    return raw === q.answer;
  if (normalize(raw) === normalize(q.answer)) return true;
  // Text answers may have legitimate synonyms. Wrong numeric answers are unambiguous.
  if (
    ['short_answer', 'story_qa', 'guess_image', 'image_label'].includes(
      q.type
    ) &&
    !/^[+-]?\d+(?:[.,]\d+)?$/.test(q.answer)
  )
    return null;
  return false;
}
