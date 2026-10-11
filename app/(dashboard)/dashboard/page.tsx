import { getParent } from '@/lib/server/ownership';
import { DashboardView } from './dashboard-view';
import type { RecentActivity, DashboardStats } from '@/types';
export default async function DashboardPage() {
  const { supabase, profile } = await getParent();
  const { data: children, error } = await supabase
    .from('children')
    .select('id')
    .eq('parent_id', profile.id);
  if (error) throw new Error('Profil anak belum dapat dimuat.');
  const results = await Promise.all(
    (children || []).map(async (child) => {
      const { count, error: countError } = await supabase
        .from('worksheets')
        .select('id', { count: 'exact', head: true })
        .eq('child_id', child.id);
      if (countError) throw new Error('Jumlah latihan belum dapat dimuat.');
      const stats: DashboardStats = {
        totalWorksheets: count || 0,
        totalAttempts: 0,
        averageScore: 0,
        totalQuestions: 0,
      };
      let scores = 0;
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase
          .from('attempts')
          .select('score,total_questions')
          .eq('child_id', child.id)
          .eq('status', 'completed')
          .eq('scoring_version', 2)
          .order('id')
          .range(offset, offset + 499);
        if (error) throw new Error('Nilai belum dapat dimuat.');
        for (const a of data || []) {
          stats.totalAttempts++;
          stats.totalQuestions += a.total_questions;
          scores += a.score || 0;
        }
        if (!data || data.length < 500) break;
      }
      stats.averageScore = stats.totalAttempts
        ? Math.round(scores / stats.totalAttempts)
        : 0;
      const activities: RecentActivity[] = [];
      const { data: ws, error: wsError } = await supabase
        .from('worksheets')
        .select('id,title,created_at,subjects(name)')
        .eq('child_id', child.id)
        .order('created_at', { ascending: false })
        .limit(5);
      const { data: attempts, error: attError } = await supabase
        .from('attempts')
        .select('id,score,created_at,worksheets(title,subjects(name))')
        .eq('child_id', child.id)
        .eq('status', 'completed')
        .eq('scoring_version', 2)
        .order('created_at', { ascending: false })
        .limit(5);
      if (wsError || attError) throw new Error('Aktivitas belum dapat dimuat.');
      for (const w of ws || [])
        activities.push({
          id: `ws-${w.id}`,
          type: 'worksheet_created',
          title: w.title,
          subject: w.subjects?.name || 'Latihan',
          createdAt: w.created_at,
        });
      for (const a of attempts || [])
        activities.push({
          id: `att-${a.id}`,
          type: 'attempt_completed',
          title: a.worksheets?.title || 'Latihan',
          subject: a.worksheets?.subjects?.name || 'Pelajaran',
          score: a.score || 0,
          createdAt: a.created_at,
        });
      activities.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return [child.id, { stats, activities: activities.slice(0, 5) }] as const;
    })
  );
  return <DashboardView byChild={Object.fromEntries(results)} />;
}
