import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QuizEngine } from '@/components/quiz/quiz-engine';
import { hydrateQuestion } from '@/lib/learning/contracts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kerjakan Latihan',
};

export default async function AttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: worksheetData } = await supabase
    .from('worksheets')
    .select('*')
    .eq('id', id)
    .single();

  if (!worksheetData) notFound();
  const worksheet = worksheetData;
  if (worksheet.status !== 'generated') notFound();

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('worksheet_id', id)
    .order('order_index', { ascending: true });

  if (!questions || questions.length === 0) notFound();
  const practice = questions.map((row) => {
    const question = hydrateQuestion(row);
    return question ? { ...question, id: row.id } : null;
  });
  if (
    practice.some((q) => q === null) ||
    practice.length !== worksheet.question_count
  )
    notFound();

  return (
    <QuizEngine
      worksheetId={worksheet.id}
      childId={worksheet.child_id}
      questions={practice.filter((q) => q !== null)}
      worksheetTitle={worksheet.title}
    />
  );
}
