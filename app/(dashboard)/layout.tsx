import { signedAvatar } from '@/lib/server/avatars';
import { getParent, getChildren } from '@/lib/server/ownership';
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
  const context = await getParent().catch((e) => {
    if (
      e instanceof Error &&
      ['UNAUTHORIZED', 'PROFILE_NOT_FOUND'].includes(e.message)
    )
      return null;
    throw e;
  });
  if (!context) redirect('/login');
  const { supabase, user, profile } = context;

  if (!profile.is_onboarded) {
    redirect('/onboarding');
  }

  // Fetch children
  const childrenData = await getChildren();

  return (
    <DashboardShell
      key={profile.id}
      ownerId={profile.id}
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
