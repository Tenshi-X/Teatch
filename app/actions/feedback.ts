'use server';
import { z } from 'zod';
import { getParent } from '@/lib/server/ownership';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
const feedbackSchema = z
  .object({
    category: z.enum(['helpful', 'problem', 'idea']),
    comment: z.string().trim().max(1000),
    worksheetId: z.uuid().optional(),
  })
  .strict();
export async function submitFeedback(input: unknown) {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success)
    return {
      error: 'Periksa kategori dan komentar (maksimal 1.000 karakter).',
    };
  try {
    const { profile } = await getParent();
    const { error } = await createAdminClient().rpc('submit_product_feedback', {
      p_parent: profile.id,
      p_worksheet: parsed.data.worksheetId || null,
      p_category: parsed.data.category,
      p_comment: parsed.data.comment,
    });
    if (error)
      return {
        error: error.message.includes('RATE_LIMIT')
          ? 'Batas masukan tercapai. Coba kembali satu jam lagi.'
          : 'Masukan belum tersimpan. Coba kembali nanti.',
      };
    revalidatePath('/admin');
    return { success: true };
  } catch {
    return { error: 'Silakan masuk kembali untuk mengirim masukan.' };
  }
}
const eventSchema = z
  .object({
    key: z.uuid(),
    kind: z.enum(['visit', 'attempt_started', 'plan_clicked']),
    worksheetId: z.uuid().optional(),
  })
  .strict();
export async function recordProductEvent(input: unknown) {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { accepted: false };
  try {
    const { profile } = await getParent();
    const { error } = await createAdminClient().rpc('record_product_event', {
      p_parent: profile.id,
      p_key: parsed.data.key,
      p_kind: parsed.data.kind,
      p_worksheet: parsed.data.worksheetId || null,
    });
    return { accepted: !error };
  } catch {
    return { accepted: false };
  }
}
