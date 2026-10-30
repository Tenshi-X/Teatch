import { z } from 'zod';
import type { Question } from '@/types';
import { ASSET_IDS, ASSETS, PLANT_PARTS } from './assets';

export const SUPPORTED_TYPES = [
  'multiple_choice',
  'essay',
  'short_answer',
  'matching',
  'guess_image',
  'image_matching',
  'true_false',
  'word_jumble',
  'sentence_jumble',
  'ordering',
  'pattern_completion',
  'count_image',
  'choose_image',
  'image_label',
  'grouping',
  'story_qa',
] as const;
export const generationInputSchema = z.object({
  childId: z.uuid(),
  subjectId: z.uuid(),
  requestKey: z.uuid(),
  questionType: z.enum(SUPPORTED_TYPES),
  difficulty: z.enum(['mudah', 'sedang', 'sulit']),
  questionCount: z.number().int().min(1).max(20),
  topic: z.string().trim().max(200).default(''),
  objectiveId: z.string().trim().min(1).max(150).optional(),
});
const text = z.string().trim().min(1).max(1500);
const base = {
  question: text,
  answer: z.string().trim().min(1).max(3000),
  explanation: z.string().trim().min(1).max(1000),
};
const options = z.array(z.string().trim().min(1).max(300)).min(2).max(8);
const asset = z.enum(ASSET_IDS);
export const questionSchemas = {
  multiple_choice: z.object({
    ...base,
    type: z.literal('multiple_choice'),
    options: options.length(4),
  }),
  essay: z.object({
    ...base,
    type: z.literal('essay'),
    rubric: z.array(z.string().trim().min(1).max(200)).min(2).max(4),
  }),
  short_answer: z.object({ ...base, type: z.literal('short_answer') }),
  matching: z.object({
    ...base,
    type: z.literal('matching'),
    pairs: z
      .array(z.object({ left: text, right: text }))
      .min(4)
      .max(6),
  }),
  guess_image: z.object({
    ...base,
    type: z.literal('guess_image'),
    asset_id: asset,
  }),
  image_matching: z.object({
    ...base,
    type: z.literal('image_matching'),
    pairs: z
      .array(z.object({ left: asset, right: text }))
      .min(4)
      .max(6),
  }),
  true_false: z.object({
    ...base,
    type: z.literal('true_false'),
    answer: z.enum(['Benar', 'Salah']),
  }),
  word_jumble: z.object({ ...base, type: z.literal('word_jumble'), options }),
  sentence_jumble: z.object({
    ...base,
    type: z.literal('sentence_jumble'),
    options,
  }),
  ordering: z.object({
    ...base,
    type: z.literal('ordering'),
    options,
    correct_order: options,
  }),
  pattern_completion: z.object({
    ...base,
    type: z.literal('pattern_completion'),
  }),
  count_image: z.object({
    ...base,
    type: z.literal('count_image'),
    asset_id: asset,
    count: z.number().int().min(1).max(20),
  }),
  choose_image: z.object({
    ...base,
    type: z.literal('choose_image'),
    image_options: z.array(asset).min(3).max(4),
  }),
  image_label: z.object({
    ...base,
    type: z.literal('image_label'),
    label_target: z.enum(['leaf', 'stem', 'root']),
  }),
  grouping: z.object({
    ...base,
    type: z.literal('grouping'),
    categories: z.array(text).min(2).max(4),
    items: z
      .array(z.object({ name: text, category: text }))
      .min(4)
      .max(8),
  }),
  story_qa: z.object({
    ...base,
    type: z.literal('story_qa'),
    story: z.string().trim().min(20).max(2500),
  }),
};
export const generatedQuestionSchema = z.discriminatedUnion('type', [
  questionSchemas.multiple_choice,
  questionSchemas.essay,
  questionSchemas.short_answer,
  questionSchemas.matching,
  questionSchemas.guess_image,
  questionSchemas.image_matching,
  questionSchemas.true_false,
  questionSchemas.word_jumble,
  questionSchemas.sentence_jumble,
  questionSchemas.ordering,
  questionSchemas.pattern_completion,
  questionSchemas.count_image,
  questionSchemas.choose_image,
  questionSchemas.image_label,
  questionSchemas.grouping,
  questionSchemas.story_qa,
]);
export const worksheetSchema = z.object({
  title: z.string().trim().min(1).max(150),
  questions: z.array(generatedQuestionSchema).min(1).max(20),
});
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type GeneratedWorksheet = z.infer<typeof worksheetSchema>;
export type GenerationInput = z.infer<typeof generationInputSchema>;
const normalized = (s: string) =>
  s.normalize('NFKC').trim().toLocaleLowerCase('id').replace(/\s+/g, ' ');
const sameItems = (a: string[], b: string[]) =>
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
const unique = (a: string[]) => new Set(a.map(normalized)).size === a.length;

/** Local visual questions use known assets, so an image can never disagree with its key. */
export function finalizeVisual(
  q: GeneratedQuestion,
  english = false
): GeneratedQuestion {
  const label = (id: (typeof ASSET_IDS)[number]) =>
    english ? id : ASSETS[id].label;
  switch (q.type) {
    case 'guess_image':
      return {
        ...q,
        question: english
          ? 'What is shown in the picture?'
          : 'Apa nama objek pada gambar?',
        answer: label(q.asset_id),
        explanation: `Gambar menunjukkan ${label(q.asset_id)}.`,
      };
    case 'count_image':
      return {
        ...q,
        question: `Ada berapa ${label(q.asset_id)} pada gambar?`,
        answer: String(q.count),
        explanation: `Hitung satu per satu. Ada ${q.count} ${label(q.asset_id)}.`,
      };
    case 'choose_image':
      return q.image_options.includes(q.answer as (typeof ASSET_IDS)[number])
        ? {
            ...q,
            question: `Pilih gambar ${label(q.answer as (typeof ASSET_IDS)[number])}.`,
            explanation: `Gambar yang benar adalah ${label(q.answer as (typeof ASSET_IDS)[number])}.`,
          }
        : q;
    case 'image_matching':
      return {
        ...q,
        question: 'Pasangkan setiap gambar dengan namanya.',
        pairs: q.pairs.map((p) => ({ ...p, right: label(p.left) })),
        answer: q.pairs.map((p) => `${p.left}: ${label(p.left)}`).join('; '),
        explanation: 'Cocokkan ciri setiap objek dengan namanya.',
      };
    case 'image_label':
      return {
        ...q,
        question: 'Apa nama bagian tumbuhan yang diberi lingkaran?',
        answer: PLANT_PARTS[q.label_target],
        explanation: `Bagian yang ditandai adalah ${PLANT_PARTS[q.label_target]}.`,
      };
    default:
      return q;
  }
}

export function validateWorksheet(
  value: unknown,
  expected?: { questionCount: number; questionType: string; level?: string }
): GeneratedWorksheet {
  const result = worksheetSchema.parse(value);
  if (
    expected &&
    (result.questions.length !== expected.questionCount ||
      result.questions.some((q) => q.type !== expected.questionType))
  )
    throw new Error('Jumlah atau tipe soal tidak sesuai permintaan.');
  if (
    !unique(
      result.questions.map((q) =>
        JSON.stringify({ ...q, answer: undefined, explanation: undefined })
      )
    )
  )
    throw new Error('Terdapat soal berulang.');
  for (const q of result.questions) {
    const keys =
      'pairs' in q
        ? q.pairs.map((p) => p.left)
        : q.type === 'grouping'
          ? q.items.map((i) => i.name)
          : [];
    if (
      keys.some((key) =>
        ['__proto__', 'constructor', 'prototype'].includes(key)
      )
    )
      throw new Error('Nama objek tidak dapat dipakai sebagai kunci jawaban.');
    if (
      expected?.level &&
      ['PAUD', 'TK A', 'TK B'].includes(expected.level) &&
      (q.question.length > 350 ||
        ('story' in q && q.story.length > 700) ||
        (q.type === 'count_image' && q.count > 10))
    )
      throw new Error(
        'Instruksi atau jumlah objek terlalu besar untuk usia dini.'
      );
    if (q.type === 'short_answer' || q.type === 'multiple_choice')
      checkSimpleArithmetic(q);
    if ('options' in q && !unique(q.options) && q.type !== 'word_jumble')
      throw new Error('Pilihan soal berulang.');
    if (q.type === 'multiple_choice' && !q.options.includes(q.answer))
      throw new Error('Kunci tidak terdapat pada pilihan.');
    if (
      'pairs' in q &&
      (!unique(q.pairs.map((p) => p.left)) ||
        !unique(q.pairs.map((p) => p.right)))
    )
      throw new Error('Pasangan soal harus unik.');
    if (q.type === 'ordering' && !sameItems(q.options, q.correct_order))
      throw new Error('Urutan benar harus memuat seluruh pilihan.');
    if (
      (q.type === 'word_jumble' || q.type === 'sentence_jumble') &&
      !sameItems(q.options, splitJumbleAnswer(q))
    )
      throw new Error('Kunci susunan tidak sesuai potongan.');
    if (
      q.type === 'grouping' &&
      (!unique(q.categories) ||
        !unique(q.items.map((i) => i.name)) ||
        q.items.some((i) => !q.categories.includes(i.category)))
    )
      throw new Error('Kategori soal tidak sesuai.');
    if (
      q.type === 'choose_image' &&
      (!unique(q.image_options) ||
        !q.image_options.includes(q.answer as (typeof ASSET_IDS)[number]))
    )
      throw new Error('Kunci gambar tidak sesuai.');
    if (q.type === 'count_image' && q.answer !== String(q.count))
      throw new Error('Jumlah gambar tidak sesuai kunci.');
    if (
      q.type === 'guess_image' &&
      ![ASSETS[q.asset_id].label, q.asset_id].includes(q.answer)
    )
      throw new Error('Nama gambar tidak sesuai.');
    if (q.type === 'image_label' && q.answer !== PLANT_PARTS[q.label_target])
      throw new Error('Label gambar tidak sesuai.');
    if (
      q.type === 'image_matching' &&
      q.pairs.some((p) => ![ASSETS[p.left].label, p.left].includes(p.right))
    )
      throw new Error('Nama pasangan gambar tidak sesuai.');
  }
  // Canonical answers for structured tasks are computed locally from their payload.
  return {
    ...result,
    questions: result.questions.map((q) =>
      q.type === 'ordering'
        ? { ...q, answer: q.correct_order.join(', ') }
        : q.type === 'grouping'
          ? {
              ...q,
              answer: q.items.map((i) => `${i.name}: ${i.category}`).join('; '),
            }
          : 'pairs' in q
            ? {
                ...q,
                answer: q.pairs.map((p) => `${p.left}: ${p.right}`).join('; '),
              }
            : q
    ),
  };
}

function checkSimpleArithmetic(q: GeneratedQuestion) {
  const prompt = q.question
    .replace(/\$/g, '')
    .replace(
      /(?:berapa(?:kah)?(?: hasil(?: dari)?)?|hitung(?:lah)?|tentukan(?: hasil(?: dari)?)?)\s*/gi,
      ''
    )
    .replace(/[=?!]/g, '')
    .replace(/\.\s*$/, '')
    .trim();
  const match = prompt.match(/^(-?\d+)\s*([+−×÷*/-])\s*(-?\d+)$/);
  if (!match || !/^[+-]?\d+(?:[.,]\d+)?$/.test(q.answer)) return;
  const a = Number(match[1]),
    b = Number(match[3]),
    op = match[2];
  const expected =
    op === '+'
      ? a + b
      : ['-', '−'].includes(op)
        ? a - b
        : ['*', '×'].includes(op)
          ? a * b
          : a / b;
  if (
    !Number.isFinite(expected) ||
    Math.abs(expected - Number(q.answer.replace(',', '.'))) > 1e-9
  )
    throw new Error('Kunci perhitungan sederhana tidak konsisten.');
}

export function splitJumbleAnswer(
  q: Extract<GeneratedQuestion, { type: 'word_jumble' | 'sentence_jumble' }>
): string[] {
  if (q.type === 'word_jumble') return q.answer.trim().split(/\s+/);
  // Sentence boundaries come from options, not punctuation or spaces inside a sentence.
  let remaining = q.answer.trim();
  const found: string[] = [];
  while (remaining) {
    const next = [...q.options]
      .sort((a, b) => b.length - a.length)
      .find((s) => remaining.startsWith(s) && !found.includes(s));
    if (!next) return [];
    found.push(next);
    remaining = remaining.slice(next.length).trim();
  }
  return found;
}

export function hydrateQuestion(row: Question): GeneratedQuestion | null {
  const content =
    row.content &&
    typeof row.content === 'object' &&
    !Array.isArray(row.content)
      ? row.content
      : {};
  const restoredOptions =
    row.schema_version === 1 && content.options ? content.options : row.options;
  const restoredPairs =
    row.schema_version === 1 && content.pairs ? content.pairs : row.options;
  const value = {
    ...content,
    type: row.type,
    question: row.question,
    answer: row.answer || (row.schema_version === 1 ? content.answer : null),
    explanation:
      row.explanation ||
      (row.schema_version === 1 ? content.explanation : null),
    ...(['matching', 'image_matching'].includes(row.type)
      ? { pairs: restoredPairs }
      : { options: restoredOptions }),
  };
  const parsed = generatedQuestionSchema.safeParse(value);
  if (!parsed.success) return null;
  try {
    return validateWorksheet({ title: 'Latihan', questions: [parsed.data] })
      .questions[0];
  } catch {
    return null;
  }
}

export function canAttempt(questions: Question[]): boolean {
  return (
    questions.length > 0 && questions.every((q) => hydrateQuestion(q) !== null)
  );
}
