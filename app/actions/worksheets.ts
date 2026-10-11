'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getOwnedWorksheet, getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateWorksheet } from '@/lib/learning/contracts';
import type { Json } from '@/types/database';

export async function publishWorksheet(id: string, value: unknown) {
  z.uuid().parse(id);
  const { profile, worksheet } = await getOwnedWorksheet(id);
  const result = validateWorksheet(value, {
    questionCount: worksheet.question_count,
    questionType: worksheet.question_type,
  });
  const { error } = await createAdminClient().rpc('update_worksheet_content', {
    p_parent: profile.id,
    p_worksheet: id,
    p_result: JSON.parse(JSON.stringify(result)) as Json,
  });
  if (error)
    throw new Error(
      error.message.includes('ALREADY_ATTEMPTED')
        ? 'Latihan yang sudah dikerjakan tidak dapat diubah.'
        : 'Perubahan belum tersimpan.'
    );
  revalidatePath(`/worksheets/${id}`);
  revalidatePath('/history');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function reportQuestion(questionId: string, reason: string) {
  z.uuid().parse(questionId);
  const text = z.string().trim().min(5).max(1000).parse(reason);
  const { supabase, profile } = await getParent();
  const { data: question } = await supabase
    .from('questions')
    .select('worksheet_id')
    .eq('id', questionId)
    .single();
  if (!question) throw new Error('Soal tidak ditemukan.');
  await getOwnedWorksheet(question.worksheet_id);
  const { error } = await createAdminClient()
    .from('question_reports')
    .insert({ parent_id: profile.id, question_id: questionId, reason: text });
  if (error) throw new Error('Laporan belum tersimpan.');
  return { success: true };
}
