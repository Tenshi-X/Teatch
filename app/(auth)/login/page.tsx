'use client';

import { useActionState } from 'react';
import { signIn, type AuthState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signIn, {});

  return (
    <div className="animate-fade-in-up">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/25 mb-4">
          <BookOpen className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          Teatch
        </h1>
        <p className="text-surface-400 mt-1 text-sm">Platform Belajar AI untuk Anak</p>
      </div>

      {/* Login Card */}
      <div className="card p-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold">Masuk ke akun</h2>
        </div>

        {state.error && (
          <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-600 dark:text-danger-500 text-sm animate-fade-in">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="nama@email.com"
            required
            autoComplete="email"
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
            Masuk
          </Button>
        </form>

        <p className="text-center text-sm text-surface-400 mt-6">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
