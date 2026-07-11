'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get('fullName') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ full_name: fullName })
    .eq('auth_user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true };
}
