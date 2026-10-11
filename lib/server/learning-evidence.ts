import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Child } from '@/types';
import type { AnswerEvidence } from '@/lib/learning/insights';
import { getObjectives } from '@/lib/learning/objectives';

/** The same 90-day, reviewed evidence powers dashboard and full reports. */
export async function getLearningEvidence(
  supabase: SupabaseClient<Database>,
  children: Pick<Child, 'id' | 'level' | 'grade'>[]
): Promise<AnswerEvidence[]> {
  if (!children.length) return [];
  const start = new Date();
  start.setDate(start.getDate() - 90);
  const evidence: AnswerEvidence[] = [];
  const byId = new Map(children.map((child) => [child.id, child]));
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase
      .from('answers')
      .select(
        'is_correct, attempts!inner(id, child_id, score, status, scoring_version, created_at, worksheets!inner(subject_id, topic, title, objective_id, difficulty, subjects(name)))'
      )
      .in(
        'attempts.child_id',
        children.map((child) => child.id)
      )
      .eq('attempts.status', 'completed')
      .eq('attempts.scoring_version', 2)
      .gte('attempts.created_at', start.toISOString())
      .order('id')
      .range(offset, offset + 499);
    if (error) throw new Error('Data perkembangan belum dapat dimuat.');
    for (const row of data || []) {
      const attempt = row.attempts;
      const worksheet = attempt.worksheets;
      const child = byId.get(attempt.child_id);
      const objective =
        child && worksheet.objective_id
          ? getObjectives(
              worksheet.subjects?.name || '',
              child.level,
              child.grade || ''
            ).find((item) => item.id === worksheet.objective_id)
          : undefined;
      if (typeof row.is_correct === 'boolean') {
        evidence.push({
          childId: attempt.child_id,
          subjectId: worksheet.subject_id,
          subject: worksheet.subjects?.name || 'Pelajaran',
          topic: objective?.label || worksheet.topic || worksheet.title,
          objectiveId: worksheet.objective_id,
          difficulty: worksheet.difficulty,
          correct: row.is_correct,
          attemptId: attempt.id,
          score: attempt.score || 0,
          date: attempt.created_at,
        });
      }
    }
    if (!data || data.length < 500) break;
  }
  return evidence;
}
