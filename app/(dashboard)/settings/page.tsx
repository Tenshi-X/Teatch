import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pengaturan',
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!profileData) redirect('/login');
  const profile = profileData as any;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">Pengaturan</h1>
        <p className="text-surface-400">Kelola profil orang tua dan preferensi aplikasi Anda.</p>
      </div>

      <SettingsClient 
        initialName={profile.full_name} 
        email={user.email || ''} 
      />
    </div>
  );
}
