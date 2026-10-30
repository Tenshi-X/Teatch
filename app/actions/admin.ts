'use server';
import { getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTierLimits } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Profile, Question } from '@/types';
import type { Database, Json } from '@/types/database';

export type AdminProfile = Profile & {
  usage: number;
  quota: number;
  planLabel: string;
};
export type AdminQuestionReport =
  Database['public']['Tables']['question_reports']['Row'] & {
    questions: Question | null;
  };
async function adminClient() {
  const { profile } = await getParent();
  if (profile.role !== 'admin') throw new Error('Akses admin diperlukan.');
  return createAdminClient();
}
export async function getAdminDashboardData(page = 0, search = '') {
  const db = await adminClient();
  const offset = z.number().int().min(0).max(100000).parse(page) * 50;
  const [summary, reports, audit, feedback] = await Promise.all([
    db.rpc('admin_runtime_summary', {
      p_offset: offset,
      p_search: search.slice(0, 100),
    }),
    db
      .from('question_reports')
      .select('*,questions(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50),
    db.rpc('quota_audit', {}),
    db
      .from('product_feedback')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  if (summary.error || reports.error || audit.error || feedback.error)
    throw new Error('Dashboard admin belum dapat dimuat. Periksa migrasi 006.');
  const payload = summary.data as unknown as {
    profiles: (Profile & { usage: number })[];
    matchedUsers: number;
    metrics: {
      totalUsers: number;
      activeSubscriptions: number;
      totalUsage: number;
      totalQuota: number;
      failed: number;
      reserved: number;
      tokens: number;
      activeParents7d: number;
      feedbackOpen: number;
    };
  };
  const quotaAudit = z
    .object({
      discrepancies: z.number(),
      expiredReservations: z.number(),
      heldQuestions: z.number(),
    })
    .parse(audit.data);
  return {
    profiles: payload.profiles.map((p) => ({
      ...p,
      quota: getTierLimits(p.subscription_tier).maxQuestions,
      planLabel: getTierLimits(p.subscription_tier).label,
    })),
    matchedUsers: payload.matchedUsers,
    metrics: payload.metrics,
    reports: reports.data || [],
    feedback: feedback.data || [],
    quotaAudit,
  };
}
export async function resolveProductFeedback(id: string) {
  const db = await adminClient();
  const { error } = await db
    .from('product_feedback')
    .update({ status: 'resolved' })
    .eq('id', z.uuid().parse(id));
  if (error) throw new Error('Masukan belum dapat ditutup.');
  revalidatePath('/admin');
}
const updateSchema = z.object({
  role: z.enum(['admin', 'user']),
  subscription_tier: z.enum([
    'free_trial',
    'basic',
    'pro',
    'family',
    'teacher',
  ]),
  subscription_status: z.enum(['active', 'canceled', 'past_due']),
  subscription_period_end: z.iso.datetime().nullable(),
  resetQuota: z.boolean().default(false),
});
export async function updateAdminUser(userId: string, input: unknown) {
  const db = await adminClient();
  const id = z.uuid().parse(userId);
  const data = updateSchema.parse(input);
  const { resetQuota, ...changes } = data;
  const { error } = await db.rpc('admin_update_profile', {
    p_profile: id,
    p_changes: changes as Json,
    p_quota: resetQuota
      ? getTierLimits(data.subscription_tier).maxQuestions
      : null,
  });
  if (error)
    throw new Error(
      error.message.includes('GENERATION_PENDING')
        ? 'Tunggu generasi aktif selesai sebelum mengisi ulang kuota.'
        : error.message.includes('PLAN_QUOTA_MISMATCH')
          ? 'Batas paket aplikasi dan database berbeda. Terapkan migrasi 008 sebelum mengisi kuota.'
          : 'Perubahan akun belum tersimpan.'
    );
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
  return { success: true };
}
export async function resolveQuestionReport(reportId: string) {
  const db = await adminClient();
  const { error } = await db
    .from('question_reports')
    .update({ status: 'resolved' })
    .eq('id', z.uuid().parse(reportId));
  if (error) throw new Error('Laporan belum dapat ditutup.');
  revalidatePath('/admin');
}
export async function reconcileQuota() {
  const db = await adminClient();
  const { data, error } = await db.rpc('reconcile_generation_reservations', {});
  if (error) throw new Error('Pemulihan reservasi belum berhasil.');
  revalidatePath('/admin');
  return data;
}
