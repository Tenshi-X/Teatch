'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get('fullName') as string;
  const avatarFile = formData.get('avatar') as File | null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  let avatarUrl = undefined;

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });
      
    if (uploadError) {
      return { error: `Gagal mengunggah foto: ${uploadError.message}` };
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    avatarUrl = publicUrl;
  }

  const updates: any = { full_name: fullName };
  if (avatarUrl) {
    updates.avatar_url = avatarUrl;
  }

  const { error } = await (supabase as any)
    .from('profiles')
    .update(updates)
    .eq('auth_user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath('/settings');
  return { success: true };
}
