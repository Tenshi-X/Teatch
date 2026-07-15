'use server';

import { createClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_LIMITS } from '@/lib/subscription';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/database';

export async function getAdminDashboardData() {
  const supabase = await createClient();

  // Ensure caller is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: currentUser } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  // Fetch all profiles
  const { data: profiles, error } = await (supabase.from('profiles') as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    throw new Error('Failed to fetch profiles');
  }

  // Fetch all worksheets from this month to calculate usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: worksheets } = await (supabase.from('worksheets') as any)
    .select('child_id, created_at')
    .gte('created_at', startOfMonth.toISOString());

  // We need to map child_id to parent to count usage
  const { data: children } = await (supabase.from('children') as any).select('id, parent_id');

  const childToParent = new Map();
  children?.forEach((c: any) => {
    childToParent.set(c.id, c.parent_id);
  });

  const usageByParent = new Map();
  worksheets?.forEach((w: any) => {
    const parentId = childToParent.get(w.child_id);
    if (parentId) {
      usageByParent.set(parentId, (usageByParent.get(parentId) || 0) + 1);
    }
  });

  // Calculate metrics
  let totalActiveSubscriptions = 0;
  let totalUsage = 0;
  let totalQuota = 0;

  const enrichedProfiles = profiles.map((p: any) => {
    const usage = usageByParent.get(p.id) || 0;
    const tier = SUBSCRIPTION_LIMITS[p.subscription_tier as keyof typeof SUBSCRIPTION_LIMITS] || SUBSCRIPTION_LIMITS.free_trial;
    
    if (p.subscription_tier !== 'free_trial' && p.subscription_status === 'active') {
      totalActiveSubscriptions++;
    }

    totalUsage += usage;
    totalQuota += tier.maxWorksheetsPerMonth;

    return {
      ...p,
      usage,
      quota: tier.maxWorksheetsPerMonth,
    };
  });

  return {
    profiles: enrichedProfiles,
    metrics: {
      totalUsers: profiles.length,
      activeSubscriptions: totalActiveSubscriptions,
      totalUsage,
      totalQuota,
    }
  };
}

export async function updateAdminUser(userId: string, data: {
  role: 'admin' | 'user';
  subscription_tier: string;
  subscription_status: string;
  subscription_period_end: string | null;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: currentUser } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!currentUser || currentUser.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const { error } = await (supabase.from('profiles') as any)
    .update(data)
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
  return { success: true };
}
