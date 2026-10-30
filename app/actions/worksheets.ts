'use server';
import { z } from 'zod';
import { getOwnedWorksheet, getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';

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
