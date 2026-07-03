import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QuizEngine } from '@/components/quiz/quiz-engine';
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
  const worksheet = worksheetData as any;

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('worksheet_id', id)
    .order('order_index', { ascending: true });

  if (!questions || questions.length === 0) notFound();

  return (
    <QuizEngine
      worksheetId={worksheet.id}
      childId={worksheet.child_id}
      questions={questions}
      worksheetTitle={worksheet.title}
    />
  );
}
