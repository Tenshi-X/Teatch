import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ChildForm } from '@/components/children/child-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Anak',
};

export default async function EditChildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: childData } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();

  if (!childData) notFound();
  const child = childData as any;

  return (
    <div className="animate-fade-in-up">
      <ChildForm mode="edit" child={child} />
    </div>
  );
}
