'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getOwnedWorksheet, getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';
import { hydrateQuestion } from '@/lib/learning/contracts';
import { gradeAnswer } from '@/lib/learning/scoring';
import type { Json } from '@/types/database';

const submissionSchema = z.object({
  worksheetId: z.uuid(),
  requestKey: z.uuid(),
  duration: z.number().int().min(0).max(86400),
  answers: z.record(z.uuid(), z.string().max(5000)),
});
const resultSchema = z.object({
  id: z.uuid(),
  score: z.number().nullable(),
  correct_answers: z.number(),
  total_questions: z.number(),
  duration: z.number().nullable(),
  status: z.enum(['completed', 'pending_review']),
});
export async function submitAttempt(value: unknown) {
  const input = submissionSchema.parse(value);
  const { profile, worksheet, questions } = await getOwnedWorksheet(
    input.worksheetId
  );
  if (worksheet.status !== 'generated')
    throw new Error('Setujui draf sebelum mulai latihan.');
  if (
    Object.keys(input.answers).some((id) => !questions.some((q) => q.id === id))
  )
    throw new Error('Jawaban tidak sesuai latihan.');
  const records = questions.map((row) => {
    const q = hydrateQuestion(row);
    if (!q) throw new Error('Soal lama belum mendukung penilaian baru.');
    const userAnswer = input.answers[row.id] || '';
    return {
      question_id: row.id,
      user_answer: userAnswer,
      is_correct: gradeAnswer(q, userAnswer),
    };
  });
  const { data, error } = await createAdminClient().rpc('save_scored_attempt', {
    p_parent: profile.id,
    p_worksheet: worksheet.id,
    p_key: input.requestKey,
    p_duration: input.duration,
    p_answers: records as Json,
  });
  if (error)
    throw new Error(
      'Hasil belum tersimpan. Jawaban tetap tersimpan pada perangkat ini; coba kirim lagi.'
    );
  revalidatePath('/statistics');
  revalidatePath('/history');
  revalidatePath('/review');
  revalidatePath('/dashboard');
  return resultSchema.parse(data);
}
export async function reviewAnswer(answerId: string, correct: boolean) {
  z.uuid().parse(answerId);
  z.boolean().parse(correct);
  const { profile } = await getParent();
  const { error } = await createAdminClient().rpc('review_attempt_answer', {
    p_parent: profile.id,
    p_answer: answerId,
    p_correct: correct,
  });
  if (error) throw new Error('Penilaian belum tersimpan.');
  revalidatePath('/review');
  revalidatePath('/statistics');
  revalidatePath('/history');
  revalidatePath('/dashboard');
}
