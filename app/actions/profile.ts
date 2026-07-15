'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const onboardingSchema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  phoneNumber: z.string().min(9, 'Nomor HP tidak valid'),
});

export type OnboardingState = {
  error?: string;
  success?: boolean;
};

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const rawData = {
    fullName: formData.get('fullName') as string,
    phoneNumber: formData.get('phoneNumber') as string,
  };

  const parsed = onboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue ? firstIssue.message : 'Data tidak valid' };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda belum login' };
  }

  const { error } = await (supabase.from('profiles') as any)
    .update({
      full_name: parsed.data.fullName,
      phone_number: parsed.data.phoneNumber,
      is_onboarded: true,
    })
    .eq('auth_user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}
