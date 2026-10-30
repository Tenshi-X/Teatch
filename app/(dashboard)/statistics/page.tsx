import { getParent, getChildren } from '@/lib/server/ownership';
import { LearningSummary } from '@/components/learning/learning-summary';
import { StatisticsView } from './statistics-view';
import { getLearningSummary } from '@/lib/server/learning-summary';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Statistik' };
export default async function StatisticsPage() {
  const { supabase } = await getParent();
  const children = await getChildren();
  const childIds = (children || []).map((c) => c.id);
  if (!childIds.length) return <p>Tambahkan profil anak terlebih dahulu.</p>;
  const summary = await getLearningSummary();
  const { data: recent, error } = await supabase
    .from('attempts')
    .select('*, worksheets(title, subjects(name, icon))')
    .in('child_id', childIds)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error('Riwayat nilai belum dapat dimuat.');
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Statistik Perkembangan</h1>
      <LearningSummary
        topics={summary.status === 'ready' ? summary.data : []}
        unavailable={summary.status === 'unavailable'}
      />
      <StatisticsView attempts={recent || []} />
    </div>
  );
}
