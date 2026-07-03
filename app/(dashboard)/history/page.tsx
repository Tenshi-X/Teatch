import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HistoryList } from './history-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Riwayat Belajar',
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
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', profile.id);

  const childIds = (children as any[])?.map((c) => c.id) || [];

  if (childIds.length === 0) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in">
        <h1 className="text-2xl font-bold mb-6">Riwayat Belajar</h1>
        <p className="text-surface-400">Tambahkan profil anak terlebih dahulu.</p>
      </div>
    );
  }

  // Fetch worksheets with attempts
  const { data: worksheets } = await supabase
    .from('worksheets')
    .select('*, subjects(name, icon, color), children(name)')
    .in('child_id', childIds)
    .order('created_at', { ascending: false })
    .limit(50);

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*')
    .in('child_id', childIds)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <HistoryList
      worksheets={worksheets || []}
      attempts={attempts || []}
    />
  );
}
