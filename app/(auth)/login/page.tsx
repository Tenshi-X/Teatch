'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    try {
      setIsPending(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/callback`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat mencoba login.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg shadow-primary-500/25 mb-4 overflow-hidden relative">
          <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
        </div>
        <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500">
          Teatch
        </h1>
        <p className="text-surface-400 mt-1 text-sm">Platform Belajar Berbasis AI untuk Anak</p>
      </div>

      {/* Login Card */}
      <div className="card p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <Sparkles className="w-8 h-8 text-primary-500 mb-2" />
          <h2 className="text-2xl font-semibold">Selamat Datang</h2>
          <p className="text-surface-500 text-sm">Masuk untuk melanjutkan perjalanan belajar Anda.</p>
        </div>

        <Button 
          onClick={handleGoogleLogin} 
          className="w-full bg-white text-surface-900 border border-surface-200 hover:bg-surface-50 dark:bg-surface-800 dark:text-white dark:border-surface-700 dark:hover:bg-surface-700 shadow-sm" 
          variant="outline" 
          size="lg" 
          isLoading={isPending}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Lanjutkan dengan Google
        </Button>
        
        <p className="text-xs text-surface-400 mt-6 max-w-xs mx-auto">
          Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
        </p>
      </div>
    </div>
  );
}
