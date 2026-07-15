'use client';

import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { completeOnboarding, type OnboardingState } from '@/app/actions/profile';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(completeOnboarding, {
    error: undefined,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [defaultName, setDefaultName] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      const profile = data as any;

      if (profile) {
        if (profile.is_onboarded) {
          router.push('/dashboard');
          return;
        }
        setDefaultName(profile.full_name || '');
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-50 dark:bg-surface-950">
      <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-3xl shadow-xl p-8 border border-surface-200 dark:border-surface-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang! 🎉</h1>
          <p className="text-surface-500">
            Mari lengkapi profil Anda sebelum mulai menggunakan Teatch.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium mb-1.5"
            >
              Nama Lengkap
            </label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              defaultValue={defaultName}
              placeholder="Masukkan nama lengkap Anda"
              required
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium mb-1.5"
            >
              Nomor WhatsApp / HP
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Contoh: 08123456789"
              required
              className="w-full"
            />
            <p className="text-xs text-surface-400 mt-1">
              Nomor ini akan digunakan untuk informasi terkait akun.
            </p>
          </div>

          {state.error && (
            <div className="p-3 bg-danger-50 dark:bg-danger-500/10 text-danger-600 rounded-xl text-sm font-medium">
              {state.error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                Menyimpan...
              </span>
            ) : (
              'Simpan & Lanjutkan'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
