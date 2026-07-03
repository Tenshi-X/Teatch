import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ChildrenList } from './children-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anak Saya',
};

export default async function ChildrenPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profileData) redirect('/login');
  const profile = profileData as { id: string };

  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', profile.id)
    .order('created_at', { ascending: true });

  return <ChildrenList children={children || []} />;
}
