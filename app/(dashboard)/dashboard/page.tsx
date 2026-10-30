import { getParent } from '@/lib/server/ownership';
import { DashboardView, type DashboardChildData } from './dashboard-view';
import { getLearningSummary } from '@/lib/server/learning-summary';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { z } from 'zod';

const overviewSchema = z.record(
  z.string(),
  z.object({
    stats: z.object({
      totalWorksheets: z.number(),
      totalAttempts: z.number(),
      averageScore: z.number(),
      totalQuestions: z.number(),
    }),
    pendingReviews: z.number(),
    latestWorksheet: z.object({ id: z.string(), title: z.string() }).nullable(),
    activities: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['worksheet_created', 'attempt_completed']),
        title: z.string(),
        subject: z.string(),
        href: z.string().optional(),
        score: z.number().optional(),
        createdAt: z.string(),
      })
    ),
  })
);
export default async function DashboardPage() {
  const { supabase } = await getParent();
  const [overview, topics] = await Promise.all([
    supabase.rpc('dashboard_overview', {}),
    getLearningSummary(),
  ]);
  if (overview.error)
    throw new Error(
      'Dashboard belum dapat dimuat. Periksa migrasi database 006.'
    );
  const rows = overviewSchema.parse(overview.data);
  const byChild: Record<string, DashboardChildData> = Object.fromEntries(
    Object.entries(rows).map(([id, value]) => [
      id,
      {
        ...value,
        topics: topics
          .filter(
            (t) =>
              t.childId === id && ['practice', 'developing'].includes(t.status)
          )
          .slice(0, 3),
      },
    ])
  );
  return (
    <div className="space-y-8">
      <DashboardView byChild={byChild} />
      <div className="mx-auto max-w-6xl">
        <FeedbackForm />
      </div>
    </div>
  );
}
