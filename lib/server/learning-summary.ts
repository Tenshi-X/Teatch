import 'server-only';
import { getParent, getChildren } from './ownership';
import { learningTopicSchema } from '@/lib/learning/summary';
import { getObjectives } from '@/lib/learning/objectives';
import { z } from 'zod';
export async function getLearningSummary() {
  const { supabase } = await getParent();
  const children = await getChildren();
  if (!children.length) return [];
  const { data, error } = await supabase.rpc('learning_summary', {});
  if (error)
    throw new Error(
      'Laporan belum dapat dimuat. Periksa migrasi database 006.'
    );
  return z
    .array(learningTopicSchema)
    .parse(data)
    .map((topic) => {
      const child = children.find((c) => c.id === topic.childId);
      const objective =
        child && topic.objectiveId
          ? getObjectives(topic.subject, child.level, child.grade || '').find(
              (o) => o.id === topic.objectiveId
            )
          : null;
      return { ...topic, topic: objective?.label || topic.topic };
    });
}
