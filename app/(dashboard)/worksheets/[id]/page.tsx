import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { WorksheetDetail } from './worksheet-detail';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detail Worksheet',
};

export default async function WorksheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: worksheetData } = await supabase
    .from('worksheets')
    .select('*, subjects(name, icon, color)')
    .eq('id', id)
    .single();

  if (!worksheetData) notFound();
  const worksheet = worksheetData as any;

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('worksheet_id', id)
    .order('order_index', { ascending: true });

  return (
    <WorksheetDetail
      worksheet={worksheet}
      questions={questions || []}
    />
  );
}
