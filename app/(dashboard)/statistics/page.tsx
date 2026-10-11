import { getParent } from '@/lib/server/ownership';
import { LearningSummary } from '@/components/learning/learning-summary';
import { StatisticsView } from './statistics-view';
import type { AnswerEvidence } from '@/lib/learning/insights';
import { getObjectives } from '@/lib/learning/objectives';
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
  const start = new Date();
  start.setDate(start.getDate() - 90);
  const since = start.toISOString();
  const evidence: AnswerEvidence[] = [];
  // Page through answers instead of silently truncating Supabase's default 1,000 rows.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase
      .from('answers')
      .select(
        'is_correct, attempts!inner(id, child_id, score, status, scoring_version, created_at, worksheets!inner(subject_id, topic, title, objective_id, difficulty, subjects(name)))'
      )
      .in('attempts.child_id', childIds)
      .eq('attempts.status', 'completed')
      .eq('attempts.scoring_version', 2)
      .gte('attempts.created_at', since)
      .order('id')
      .range(offset, offset + 499);
    if (error) throw new Error('Data perkembangan belum dapat dimuat.');
    for (const row of data || []) {
      const a = row.attempts,
        w = a.worksheets;
      const child = children?.find((c) => c.id === a.child_id);
      const objective =
        child && w.objective_id
          ? getObjectives(
              w.subjects?.name || '',
              child.level,
              child.grade || ''
            ).find((o) => o.id === w.objective_id)
          : undefined;
      if (typeof row.is_correct === 'boolean')
        evidence.push({
          childId: a.child_id,
          subjectId: w.subject_id,
          subject: w.subjects?.name || 'Pelajaran',
          topic: objective?.label || w.topic || w.title,
          objectiveId: w.objective_id,
          difficulty: w.difficulty,
          correct: row.is_correct,
          attemptId: a.id,
          score: a.score || 0,
          date: a.created_at,
        });
    }
    if (!data || data.length < 500) break;
  }
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
