import { getParent } from '@/lib/server/ownership';
import { DashboardView, type DashboardChildData } from './dashboard-view';
import { getLearningSummary } from '@/lib/server/learning-summary';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { z } from 'zod';
import Link from 'next/link';
import { parseReportResult } from '@/lib/learning/report-result';

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
  const [overview, summary] = await Promise.all([
    supabase.rpc('dashboard_overview', {}),
    getLearningSummary(),
  ]);
  const result = parseReportResult(
    'dashboard_overview',
    overview,
    overviewSchema
  );
  if (result.status === 'unavailable')
    return (
      <section className="mx-auto max-w-6xl space-y-5">
        <h1 className="text-2xl font-bold">Ruang belajar keluarga</h1>
        <p role="status">
          Ringkasan dashboard belum dapat dimuat. Coba muat ulang halaman. Anda
          tetap dapat membuka atau membuat latihan.
        </p>
        <div className="flex flex-wrap gap-5">
          <Link href="/worksheets/new" className="underline">
            Buat latihan
          </Link>
          <Link href="/history" className="underline">
            Riwayat latihan
          </Link>
        </div>
      </section>
    );
  const rows = result.data;
  const topics = summary.status === 'ready' ? summary.data : [];
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
      <DashboardView
        byChild={byChild}
        summaryUnavailable={summary.status === 'unavailable'}
        insightsLocked={summary.status === 'locked'}
      />
      <div className="mx-auto max-w-6xl">
        <FeedbackForm />
      </div>
    </div>
  );
}
