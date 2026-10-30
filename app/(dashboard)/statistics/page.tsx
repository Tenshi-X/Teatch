import { getParent, getChildren } from '@/lib/server/ownership';
import { LearningSummary } from '@/components/learning/learning-summary';
import { StatisticsView } from './statistics-view';
import { getLearningSummary } from '@/lib/server/learning-summary';
import type { Metadata } from 'next';
import { getSubscriptionAccess } from '@/lib/subscription';
import { PlanUpgrade } from '@/components/subscription/plan-upgrade';

export const metadata: Metadata = { title: 'Statistik' };
export default async function StatisticsPage() {
  const { supabase, profile } = await getParent();
  if (!getSubscriptionAccess(profile).progressCharts)
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Statistik Perkembangan</h1>
        <PlanUpgrade
          tier="basic"
          title="Pantau perkembangan nilai setiap anak"
          description="Grafik nilai tersedia untuk Basic dan Pro selama paket aktif. Mulai dari riwayat latihan untuk melihat nilai dan pembahasan yang sudah tersimpan."
        />
      </div>
    );
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
      {summary.status === 'locked' ? (
        <PlanUpgrade
          tier="pro"
          title="Kenali materi yang perlu dilatih lagi"
          description="Pro mencakup analisis penguasaan materi per topik, tren belajar, cetak laporan perkembangan, dan tautan membuat latihan lanjutan."
        />
      ) : (
        <LearningSummary
          topics={summary.status === 'ready' ? summary.data : []}
          unavailable={summary.status === 'unavailable'}
        />
      )}
      <StatisticsView attempts={recent || []} />
    </div>
  );
}
