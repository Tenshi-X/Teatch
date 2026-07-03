'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const childSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
  level: z.enum(['PAUD', 'TK A', 'TK B', 'SD', 'SMP', 'SMA'], {
    message: 'Jenjang wajib dipilih',
  }),
  grade: z.string().optional(),
  interests: z.string().optional(),
  favorite_subjects: z.string().optional(),
});

export type ChildFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!profileData) throw new Error('Profile not found');
  const profile = profileData as { id: string };

  return { supabase, profile };
}

export async function createChild(
  _prevState: ChildFormState,
  formData: FormData
): Promise<ChildFormState> {
  const rawData = {
    name: formData.get('name') as string,
    birth_date: formData.get('birth_date') as string,
    level: formData.get('level') as string,
    grade: formData.get('grade') as string,
    interests: formData.get('interests') as string,
    favorite_subjects: formData.get('favorite_subjects') as string,
  };

  const parsed = childSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { supabase, profile } = await getProfile();

    const interests = rawData.interests
      ? rawData.interests.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const favorite_subjects = rawData.favorite_subjects
      ? rawData.favorite_subjects.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const { error } = await (supabase as any).from('children').insert({
      parent_id: profile.id,
      name: parsed.data.name,
      birth_date: parsed.data.birth_date,
      level: parsed.data.level,
      grade: parsed.data.grade || null,
      interests,
      favorite_subjects,
    });

    if (error) {
      return { error: error.message };
    }
  } catch {
    return { error: 'Gagal menambahkan profil anak' };
  }

  revalidatePath('/children');
  revalidatePath('/dashboard');
  redirect('/children');
}

export async function updateChild(
  childId: string,
  _prevState: ChildFormState,
  formData: FormData
): Promise<ChildFormState> {
  const rawData = {
    name: formData.get('name') as string,
    birth_date: formData.get('birth_date') as string,
    level: formData.get('level') as string,
    grade: formData.get('grade') as string,
    interests: formData.get('interests') as string,
    favorite_subjects: formData.get('favorite_subjects') as string,
  };

  const parsed = childSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { supabase } = await getProfile();

    const interests = rawData.interests
      ? rawData.interests.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const favorite_subjects = rawData.favorite_subjects
      ? rawData.favorite_subjects.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const { error } = await (supabase as any)
      .from('children')
      .update({
        name: parsed.data.name,
        birth_date: parsed.data.birth_date,
        level: parsed.data.level,
        grade: parsed.data.grade || null,
        interests,
        favorite_subjects,
      })
      .eq('id', childId);

    if (error) {
      return { error: error.message };
    }
  } catch {
    return { error: 'Gagal mengupdate profil anak' };
  }

  revalidatePath('/children');
  revalidatePath('/dashboard');
  redirect('/children');
}

export async function deleteChild(childId: string): Promise<{ error?: string }> {
  try {
    const { supabase } = await getProfile();

    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (error) {
      return { error: error.message };
    }
  } catch {
    return { error: 'Gagal menghapus profil anak' };
  }

  revalidatePath('/children');
  revalidatePath('/dashboard');
  redirect('/children');
}
