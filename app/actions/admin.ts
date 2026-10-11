'use server';
import { getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTierLimits } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Profile, Question } from '@/types';
import type { Database, Json } from '@/types/database';

export type AdminProfile = Profile & { usage: number; quota: number };
export type AdminQuestionReport =
  Database['public']['Tables']['question_reports']['Row'] & {
    questions: Question | null;
  };
async function adminClient() {
  const { profile } = await getParent();
  if (profile.role !== 'admin') throw new Error('Akses admin diperlukan.');
  return createAdminClient();
}
export async function getAdminDashboardData() {
  const db = await adminClient();
  const profiles: Profile[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .order('id')
      .range(offset, offset + 499);
    if (error) throw new Error('Daftar pengguna belum dapat dimuat.');
    profiles.push(...(data || []));
    if (!data || data.length < 500) break;
  }
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const usage = new Map<string, number>();
  let failed = 0,
    tokens = 0,
    reserved = 0;
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db
      .from('generation_requests')
      .select('parent_id, status, question_count, usage')
      .gte('created_at', start.toISOString())
      .order('id')
      .range(offset, offset + 499);
    if (error) throw new Error('Pemantauan generasi belum dapat dimuat.');
    for (const r of data || []) {
      if (r.status === 'succeeded')
        usage.set(
          r.parent_id,
          (usage.get(r.parent_id) || 0) + r.question_count
        );
      if (r.status === 'failed') failed++;
      if (r.status === 'reserved') reserved++;
      if (r.usage && typeof r.usage === 'object' && !Array.isArray(r.usage))
        tokens += Number(r.usage.totalTokens || 0);
    }
    if (!data || data.length < 500) break;
  }
  const { data: reports, error: reportError } = await db
    .from('question_reports')
    .select('*,questions(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(100);
  if (reportError) throw new Error('Laporan soal belum dapat dimuat.');
  const { data: audit, error: auditError } = await db.rpc('quota_audit', {});
  if (auditError) throw new Error('Audit kuota belum dapat dimuat.');
  const quotaAudit = z
    .object({
      discrepancies: z.number(),
      expiredReservations: z.number(),
      heldQuestions: z.number(),
    })
    .parse(audit);
  const enriched: AdminProfile[] = profiles.map((p) => ({
    ...p,
    usage: usage.get(p.id) || 0,
    quota: getTierLimits(p.subscription_tier).maxQuestions,
  }));
  return {
    profiles: enriched,
    reports: reports || [],
    quotaAudit,
    metrics: {
      totalUsers: profiles.length,
      activeSubscriptions: profiles.filter(
        (p) =>
          p.subscription_tier !== 'free_trial' &&
          p.subscription_status === 'active' &&
          (!p.subscription_period_end ||
            new Date(p.subscription_period_end) > new Date())
      ).length,
      totalUsage: [...usage.values()].reduce((a, b) => a + b, 0),
      totalQuota: enriched.reduce((n, p) => n + p.quota, 0),
      failed,
      reserved,
      tokens,
    },
  };
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
