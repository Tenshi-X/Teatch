'use server';
import { getParent } from '@/lib/server/ownership';
import { uploadAvatar } from '@/lib/server/avatars';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { GRADES_BY_LEVEL } from '@/types';
const childSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100),
    birth_date: z.iso
      .date()
      .refine(
        (s) => s <= new Date().toISOString().slice(0, 10) && s >= '1990-01-01',
        'Tanggal lahir tidak valid'
      ),
    level: z.enum(['PAUD', 'TK A', 'TK B', 'SD', 'SMP', 'SMA']),
    grade: z.string().max(30),
    interests: z.string().max(300),
    favorite_subjects: z.string().max(300),
  })
  .refine((c) => GRADES_BY_LEVEL[c.level].includes(c.grade), {
    path: ['grade'],
    message: 'Kelas tidak sesuai jenjang',
  });
export type ChildFormState = {
  values?: Record<string, string>;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};
const list = (s: string) =>
  s
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
async function saveChild(
  formData: FormData,
  childId?: string
): Promise<ChildFormState> {
  const raw = Object.fromEntries(
    [
      'name',
      'birth_date',
      'level',
      'grade',
      'interests',
      'favorite_subjects',
    ].map((key) => [key, formData.get(key) || ''])
  );
  const parsed = childSchema.safeParse(raw);
  const values = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [
      k,
      typeof v === 'string' ? v.slice(0, 300) : '',
    ])
  );
  if (!parsed.success)
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  try {
    const { supabase, profile, user } = await getParent();
    if (childId) {
      z.uuid().parse(childId);
      const { data } = await supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('parent_id', profile.id)
        .single();
      if (!data) return { error: 'Profil anak tidak ditemukan.', values };
    }
    const path = await uploadAvatar(supabase, formData.get('photo'), user.id);
    const { interests, favorite_subjects, ...fields } = parsed.data;
    const changes = {
      ...fields,
      grade: fields.grade || null,
      interests: list(interests),
      favorite_subjects: list(favorite_subjects),
      ...(path ? { photo_url: path } : {}),
    };
    const query = childId
      ? supabase
          .from('children')
          .update(changes)
          .eq('id', childId)
          .eq('parent_id', profile.id)
      : supabase.from('children').insert({ ...changes, parent_id: profile.id });
    const { error } = await query;
    if (error) {
      if (path) await supabase.storage.from('avatars').remove([path]);
      return {
        values,
        error: error.message.includes('CHILD_LIMIT')
          ? 'Batas profil anak pada paket ini sudah tercapai.'
          : 'Profil anak belum tersimpan.',
      };
    }
  } catch (e) {
    return {
      values,
      error: e instanceof Error ? e.message : 'Profil anak belum tersimpan.',
    };
  }
  revalidatePath('/', 'layout');
  redirect(childId ? '/children' : '/worksheets/new');
}
export async function createChild(
  _prevState: ChildFormState,
  formData: FormData
) {
  return saveChild(formData);
}
export async function updateChild(
  childId: string,
  _prevState: ChildFormState,
  formData: FormData
) {
  return saveChild(formData, childId);
}
export async function deleteChild(
  childId: string
): Promise<{ error?: string }> {
  try {
    const { supabase, profile } = await getParent();
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', z.uuid().parse(childId))
      .eq('parent_id', profile.id);
    if (error) return { error: 'Profil anak belum dapat dihapus.' };
  } catch {
    return { error: 'Profil anak belum dapat dihapus.' };
  }
  revalidatePath('/', 'layout');
  redirect('/children');
}
