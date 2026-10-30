import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
export const getParent = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHORIZED');
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();
  if (error || !profile) throw new Error('PROFILE_NOT_FOUND');
  return { supabase, user, profile };
});

export const getChildren = cache(async () => {
  const { supabase, profile } = await getParent();
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', profile.id)
    .order('created_at');
  if (error) throw new Error('Profil anak belum dapat dimuat.');
  return data || [];
});
export async function getOwnedWorksheet(id: string) {
  const context = await getParent();
  const { data: worksheet } = await context.supabase
    .from('worksheets')
    .select('*')
    .eq('id', id)
    .single();
  if (!worksheet) throw new Error('Latihan tidak ditemukan.');
  const { data: child } = await context.supabase
    .from('children')
    .select('id')
    .eq('id', worksheet.child_id)
    .eq('parent_id', context.profile.id)
    .single();
  if (!child) throw new Error('Latihan tidak ditemukan.');
  const { data: questions, error } = await context.supabase
    .from('questions')
    .select('*')
    .eq('worksheet_id', id)
    .order('order_index');
  if (error || !questions || questions.length !== worksheet.question_count)
    throw new Error('Data soal belum lengkap.');
  return { ...context, worksheet, questions };
}
