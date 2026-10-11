import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
  SUPPORTED_TYPES,
  validateWorksheet,
  hydrateQuestion,
  generationInputSchema,
} from '@/lib/learning/contracts';
import { gradeAnswer, isAnswerComplete } from '@/lib/learning/scoring';
import { buildInsights, type AnswerEvidence } from '@/lib/learning/insights';
import { getObjectives, phaseFor } from '@/lib/learning/objectives';
import { buildGeneratePrompt, buildSystemPrompt } from '@/services/ai/prompts';
import { fixtures, correctInput } from './fixtures';
import type { Question, AIGenerateParams } from '@/types';
test('integer arithmetic checks do not erase decimal or thousands separators', () => {
  const q = fixtures[2];
  for (const sample of [
    { question: 'Berapa 2.5 + 3?', answer: '5.5' },
    { question: 'Berapa 2,5 + 3?', answer: '5,5' },
    { question: 'Berapa 1.000 + 2?', answer: '1002' },
  ])
    assert.doesNotThrow(() =>
      validateWorksheet({ title: 'Bilangan', questions: [{ ...q, ...sample }] })
    );
});
for (const fixture of fixtures)
  test(`contract and scoring: ${fixture.type} survives storage and distinguishes correct/wrong answers`, () => {
    const q = validateWorksheet(
      { title: 'Latihan', questions: [fixture] },
      { questionCount: 1, questionType: fixture.type }
    ).questions[0];
    const row: Question = {
      id: randomUUID(),
      worksheet_id: randomUUID(),
      type: q.type,
      question: q.question,
      answer: q.answer,
      explanation: q.explanation,
      options: 'pairs' in q ? q.pairs : 'options' in q ? q.options : [],
      content: JSON.parse(JSON.stringify(q)),
      schema_version: 2,
      image_url: null,
      order_index: 0,
      created_at: new Date().toISOString(),
    };
    const restored = hydrateQuestion(row);
    assert.deepEqual(restored, q);
    assert.equal(
      gradeAnswer(q, correctInput(q)),
      q.type === 'essay' ? null : true
    );
    assert.equal(gradeAnswer(q, ''), false);
    const review = ['essay', 'story_qa', 'guess_image', 'image_label'].includes(
      q.type
    );
    assert.equal(gradeAnswer(q, 'Jawaban yang salah'), review ? null : false);
  });
test('contracts reject missing payloads, duplicate questions/options, mismatched keys and preschool overload', () => {
  assert.equal(fixtures.length, SUPPORTED_TYPES.length);
  for (const q of fixtures) {
    const bad = { ...q } as Record<string, unknown>;
    const field =
      q.type === 'grouping'
        ? 'categories'
        : q.type === 'story_qa'
          ? 'story'
          : q.type === 'ordering'
            ? 'correct_order'
            : 'pairs' in q
              ? 'pairs'
              : 'asset_id' in q
                ? 'asset_id'
                : q.type === 'image_label'
                  ? 'label_target'
                  : q.type === 'choose_image'
                    ? 'image_options'
                    : 'options' in q
                      ? 'options'
                      : 'answer';
    delete bad[field];
    assert.throws(() => validateWorksheet({ title: 'Bad', questions: [bad] }));
  }
  assert.throws(
    () =>
      validateWorksheet({
        title: 'Bad',
        questions: [fixtures[0], fixtures[0]],
      }),
    /berulang/
  );
  assert.throws(
    () =>
      validateWorksheet({
        title: 'Bad',
        questions: [{ ...fixtures[0], answer: '999' }],
      }),
    /kunci|Kunci/
  );
  assert.throws(
    () =>
      validateWorksheet({
        title: 'Bad',
        questions: [{ ...fixtures[0], options: ['5', '5', '6', '7'] }],
      }),
    /berulang/
  );
  assert.throws(
    () =>
      validateWorksheet(
        {
          title: 'Bad',
          questions: [{ ...fixtures[11], count: 15, answer: '15' }],
        },
        { questionCount: 1, questionType: 'count_image', level: 'PAUD' }
      ),
    /usia dini/
  );
  assert.throws(
    () =>
      validateWorksheet({
        title: 'Bad',
        questions: [{ ...fixtures[2], answer: '6' }],
      }),
    /perhitungan/
  );
});
test('grading preserves math signs, fractions, equality and sentence punctuation; essays never pass by length', () => {
  const q = {
    type: 'short_answer' as const,
    question: 'Jawab.',
    answer: '5',
    explanation: 'Penjelasan.',
  };
  assert.equal(gradeAnswer({ ...q, answer: '-5' }, '5'), false);
  assert.equal(gradeAnswer({ ...q, answer: '1/2' }, '12'), null);
  assert.equal(gradeAnswer({ ...q, answer: 'a=b' }, 'ab'), null);
  assert.equal(
    gradeAnswer(fixtures[1], 'Sepuluh karakter yang tidak menjawab soal.'),
    null
  );
  assert.equal(gradeAnswer({ ...q, answer: 'Apel' }, '  APEL  '), true);
  const repeat = {
    ...fixtures[7],
    type: 'word_jumble' as const,
    options: ['Saya', 'suka', 'suka'],
    answer: 'Saya suka suka',
  };
  validateWorksheet({ title: 'Kata', questions: [repeat] });
  assert.equal(
    gradeAnswer(repeat, JSON.stringify(['Saya', 'suka', 'suka'])),
    true
  );
  assert.equal(gradeAnswer(repeat, JSON.stringify(['Saya', 'suka'])), false);
});
test('legacy payloads recover from retained AI content; unrecoverable questions cannot be graded', () => {
  const q = fixtures[14];
  const row: Question = {
    id: randomUUID(),
    worksheet_id: randomUUID(),
    type: q.type,
    question: q.question,
    answer: q.answer,
    explanation: q.explanation,
    options: [],
    content: JSON.parse(JSON.stringify(q)),
    schema_version: 1,
    image_url: null,
    order_index: 0,
    created_at: '',
  };
  assert.ok(hydrateQuestion(row));
  assert.ok(hydrateQuestion({ ...row, answer: null, explanation: null }));
  assert.equal(hydrateQuestion({ ...row, content: {} }), null);
});
test('generation input enforces 1–20 questions and identity keys', () => {
  const p = {
    childId: randomUUID(),
    subjectId: randomUUID(),
    requestKey: randomUUID(),
    questionType: 'short_answer',
    difficulty: 'mudah',
    questionCount: 1,
  };
  assert.ok(generationInputSchema.safeParse(p).success);
  for (const n of [0, 21, 1.5])
    assert.equal(
      generationInputSchema.safeParse({ ...p, questionCount: n }).success,
      false
    );
  assert.equal(
    generationInputSchema.safeParse({ ...p, childId: 'invalid' }).success,
    false
  );
});
test('partial structured answers never count as completed and unsafe map keys are rejected', () => {
  for (const q of fixtures) {
    assert.equal(isAnswerComplete(q, ''), false);
    assert.equal(isAnswerComplete(q, correctInput(q)), true);
  }
  assert.equal(
    isAnswerComplete(fixtures[3], JSON.stringify({ Satu: '1' })),
    false
  );
  assert.equal(
    isAnswerComplete(fixtures[9], JSON.stringify(['1', '2'])),
    false
  );
  assert.equal(
    isAnswerComplete(fixtures[14], JSON.stringify({ Apel: 'Buah' })),
    false
  );
  const q = fixtures[3];
  assert.ok(q.type === 'matching');
  assert.throws(
    () =>
      validateWorksheet({
        title: 'Bad',
        questions: [
          {
            ...q,
            pairs: [{ left: '__proto__', right: '1' }, ...q.pairs.slice(1)],
          },
        ],
      }),
    /kunci/
  );
});
test('insights require five answers per objective and compare five recent attempts with five earlier attempts', () => {
  const row: AnswerEvidence = {
    childId: 'child',
    subjectId: 'math',
    subject: 'Matematika',
    topic: 'Jumlah',
    objectiveId: 'sum',
    correct: true,
    attemptId: '1',
    score: 100,
    date: '2026-01-01',
    difficulty: 'mudah',
  };
  assert.equal(buildInsights([row])[0].status, 'insufficient');
  assert.equal(
    buildInsights(Array.from({ length: 5 }, () => row))[0].status,
    'mastered'
  );
  const rows = Array.from({ length: 10 }, (_, i) => ({
    ...row,
    attemptId: String(i),
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    score: i < 5 ? 40 : 80,
    correct: i >= 5,
  }));
  assert.equal(buildInsights(rows)[0].trend, 40);
  assert.equal(
    buildInsights([...rows, { ...row, difficulty: 'sulit' }]).length,
    2
  );
});
test('prompts omit child name and keep only useful educational context; every school phase has a local guide', () => {
  const p: AIGenerateParams = {
    age: 8,
    level: 'SD',
    grade: 'Kelas 2',
    subject: 'Matematika',
    questionType: 'short_answer',
    difficulty: 'mudah',
    questionCount: 5,
    childName: 'PRIVATE_CHILD_NAME',
    topic: 'Tambah',
    objective: 'Penjumlahan',
    interest: 'buah',
  };
  assert.ok(!buildGeneratePrompt(p).includes(p.childName!));
  assert.ok(buildGeneratePrompt(p).includes('Penjumlahan'));
  assert.ok(buildSystemPrompt().length < 500);
  assert.equal(phaseFor('SD', 'Kelas 4'), 'B');
  assert.equal(phaseFor('SMA', 'Kelas 10'), 'E');
  assert.equal(phaseFor('TK A', 'TK A'), 'Fondasi');
  assert.ok(getObjectives('Fisika', 'SMA', 'Kelas 11').length);
});
