'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { onboardingSchema } from '@/lib/profile-validation';

export type OnboardingState = {
  values?: { fullName: string; phoneNumber: string };
  error?: string;
  success?: boolean;
};

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const rawData = {
    fullName: String(formData.get('fullName') || '').slice(0, 100),
    phoneNumber: String(formData.get('phoneNumber') || ''),
  };

  const parsed = onboardingSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      error: firstIssue ? firstIssue.message : 'Data tidak valid',
      values: rawData,
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Anda belum login', values: rawData };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      phone_number: parsed.data.phoneNumber || null,
      is_onboarded: true,
    })
    .eq('auth_user_id', user.id);

  if (error) {
    return { error: 'Profil belum tersimpan. Coba kembali.', values: rawData };
  }

  redirect('/children/new');
}
