import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatisticsView } from './statistics-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Statistik',
};

export default async function StatisticsPage() {
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
        <h1 className="text-2xl font-bold mb-6">Statistik Perkembangan</h1>
        <p className="text-surface-400">Tambahkan profil anak terlebih dahulu.</p>
      </div>
    );
  }

  // Fetch completed attempts with worksheet and subject info
  const { data: attempts } = await supabase
    .from('attempts')
    .select('*, worksheets(title, subjects(name, icon))')
    .in('child_id', childIds)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Statistik Perkembangan</h1>
      <StatisticsView attempts={attempts || []} />
    </div>
  );
}
