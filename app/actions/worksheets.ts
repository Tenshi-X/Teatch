'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AIGeneratedWorksheet, AIGenerateParams } from '@/types';

export async function saveWorksheet(
  params: AIGenerateParams & { subjectId: string; childId: string },
  aiResult: AIGeneratedWorksheet,
  aiPrompt: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // Create worksheet
  const { data: worksheetData, error: wsError } = await (supabase as any)
    .from('worksheets')
    .insert({
      child_id: params.childId,
      subject_id: params.subjectId,
      title: aiResult.title,
      difficulty: params.difficulty,
      question_type: params.questionType,
      question_count: params.questionCount,
      topic: params.topic || null,
      ai_prompt: aiPrompt,
      ai_response: aiResult as unknown as Record<string, unknown>,
      status: 'generated',
    })
    .select()
    .single();

  if (wsError || !worksheetData) {
    throw new Error(wsError?.message || 'Failed to save worksheet');
  }
  const worksheet = worksheetData as any;

  // Create questions
  const questions = aiResult.questions.map((q, index) => ({
    worksheet_id: worksheet.id,
    type: q.type,
    question: q.question,
    options: q.options || [],
    answer: q.answer,
    explanation: q.explanation,
    order_index: index,
  }));

  const { error: qError } = await (supabase as any).from('questions').insert(questions);

  if (qError) {
    // Cleanup worksheet if questions fail
    await supabase.from('worksheets').delete().eq('id', worksheet.id);
    throw new Error(qError.message);
  }

  revalidatePath('/dashboard');
  revalidatePath('/history');

  return worksheet;
}
