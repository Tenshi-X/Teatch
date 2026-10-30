'use server';
import { getParent } from '@/lib/server/ownership';
import { uploadAvatar } from '@/lib/server/avatars';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { phoneSchema } from '@/lib/profile-validation';
export async function updateProfile(formData: FormData) {
  const parsed = z
    .string()
    .trim()
    .min(2, 'Nama minimal 2 karakter.')
    .max(100)
    .safeParse(formData.get('fullName'));
  if (!parsed.success) return { error: 'Nama harus 2–100 karakter.' };
  const phone = phoneSchema.safeParse(
    String(formData.get('phoneNumber') || '')
  );
  if (!phone.success) return { error: 'Nomor HP tidak valid.' };
  try {
    const { supabase, user, profile } = await getParent();
    const path = await uploadAvatar(supabase, formData.get('avatar'), user.id);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data,
        phone_number: phone.data || null,
        ...(path ? { avatar_url: path } : {}),
      })
      .eq('id', profile.id);
    if (error) {
      if (path) await supabase.storage.from('avatars').remove([path]);
      return { error: 'Profil belum tersimpan.' };
    }
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : 'Profil belum tersimpan.',
    };
  }
}
