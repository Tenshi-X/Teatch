import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HistoryList } from './history-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Soal Saya',
};

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profileData) redirect('/login');
  const profile = profileData as { id: string };

  // Fetch children IDs
  const { data: children, error: childError } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', profile.id);
  if (childError) throw new Error('Profil anak belum dapat dimuat.');

  const childIds = children?.map((c) => c.id) || [];

  if (childIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Soal Saya</h1>
        <p className="text-[var(--text-muted)]">
          Tambahkan profil anak terlebih dahulu.
        </p>
      </div>
    );
  }

  // Fetch worksheets with attempts
  const { data: worksheets, error: worksheetError } = await supabase
    .from('worksheets')
    .select('*, subjects(name, icon, color), children(name)')
    .in('child_id', childIds)
    .order('created_at', { ascending: false })
    .limit(100);

  const { data: attempts, error: attemptError } = await supabase
    .from('attempts')
    .select('*')
    .in('child_id', childIds)
    .order('created_at', { ascending: false })
    .limit(100);
  if (worksheetError || attemptError)
    throw new Error('Riwayat belum dapat dimuat.');

  return (
    <HistoryList
      worksheets={worksheets || []}
      attempts={attempts || []}
      childrenData={children || []}
    />
  );
}
