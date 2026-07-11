'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AIGeneratedWorksheet, AIGenerateParams } from '@/types';

async function getWikimediaImageUrl(keyword: string): Promise<string | null> {
  try {
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(keyword)}&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`);
    const data = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId && pageId !== '-1') {
        return pages[pageId].imageinfo?.[0]?.url || null;
      }
    }
    return null;
  } catch (e) {
    return null;
  }
}

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
  const questions = await Promise.all(aiResult.questions.map(async (q, index) => {
    let imageUrl = q.emoji || null;
    
    if (q.search_keyword) {
      const wikiUrl = await getWikimediaImageUrl(q.search_keyword);
      if (wikiUrl) {
        imageUrl = wikiUrl;
      } else {
        // Fallback
        imageUrl = `https://loremflickr.com/800/600/${encodeURIComponent(q.search_keyword)}?lock=${Math.floor(Math.random() * 10000)}`;
      }
    }

    return {
      worksheet_id: worksheet.id,
      type: q.type,
      question: q.question,
      options: q.pairs ? q.pairs : (q.options || []),
      answer: q.answer,
      explanation: q.explanation,
      image_url: imageUrl,
      order_index: index,
    };
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
