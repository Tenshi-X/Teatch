import { signedAvatar } from '@/lib/server/avatars';
import { getParent } from '@/lib/server/ownership';
import { SettingsClient } from './settings-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengaturan',
};

export default async function SettingsPage() {
  const { supabase, user, profile } = await getParent();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <SettingsClient
        initialName={profile.full_name}
        initialPhone={profile.phone_number || ''}
        email={user.email || ''}
        avatarUrl={await signedAvatar(supabase, profile.avatar_url, user.id)}
      />
    </div>
  );
}
