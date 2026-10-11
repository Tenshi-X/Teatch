import { getParent } from '@/lib/server/ownership';
import { LearningSummary } from '@/components/learning/learning-summary';
import { StatisticsView } from './statistics-view';
import { getLearningEvidence } from '@/lib/server/learning-evidence';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Statistik' };
export default async function StatisticsPage() {
  const { supabase, profile } = await getParent();
  const { data: children, error: childError } = await supabase
    .from('children')
    .select('id,level,grade')
    .eq('parent_id', profile.id);
  if (childError) throw new Error('Profil anak belum dapat dimuat.');
  const childIds = (children || []).map((c) => c.id);
  if (!childIds.length) return <p>Tambahkan profil anak terlebih dahulu.</p>;
  const evidence = await getLearningEvidence(supabase, children || []);
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
      <LearningSummary evidence={evidence} />
      <StatisticsView attempts={recent || []} />
    </div>
  );
}
