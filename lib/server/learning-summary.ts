import 'server-only';
import { getParent, getChildren } from './ownership';
import { learningTopicSchema } from '@/lib/learning/summary';
import { getObjectives } from '@/lib/learning/objectives';
import {
  parseReportResult,
  type ReportResult,
} from '@/lib/learning/report-result';
import type { LearningTopic } from '@/lib/learning/summary';
import { z } from 'zod';
export async function getLearningSummary(): Promise<
  ReportResult<LearningTopic[]>
> {
  const { supabase } = await getParent();
  const children = await getChildren();
  if (!children.length) return { status: 'ready', data: [] };
  const response = await supabase.rpc('learning_summary', {
    p_since: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  });
  const result = parseReportResult(
    'learning_summary',
    response,
    z.array(learningTopicSchema)
  );
  if (result.status === 'unavailable') return result;
  return {
    status: 'ready',
    data: result.data.map((topic) => {
      const child = children.find((c) => c.id === topic.childId);
      const objective =
        child && topic.objectiveId
          ? getObjectives(topic.subject, child.level, child.grade || '').find(
              (o) => o.id === topic.objectiveId
            )
          : null;
      return { ...topic, topic: objective?.label || topic.topic };
    }),
  };
}
