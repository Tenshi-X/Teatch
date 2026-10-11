import { signedAvatar } from '@/lib/server/avatars';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Teatch',
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch parent profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!profileData) {
    redirect('/login');
  }
  const profile = profileData;

  if (!profile.is_onboarded) {
    redirect('/onboarding');
  }

  // Fetch children
  const { data: childrenData } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', profile.id)
    .order('created_at', { ascending: true });

  return (
    <DashboardShell
      userName={profile.full_name}
      userRole={profile.role}
      avatarUrl={await signedAvatar(supabase, profile.avatar_url, user.id)}
      worksheetQuota={profile.worksheet_quota || 0}
      subscriptionPeriodEnd={profile.subscription_period_end || undefined}
      initialChildren={await Promise.all(
        (childrenData || []).map(async (c) => ({
          ...c,
          photo_url:
            (await signedAvatar(supabase, c.photo_url, user.id)) || null,
        }))
      )}
    >
      {children}
    </DashboardShell>
  );
}
