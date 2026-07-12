'use client';

import { useActionState } from 'react';
import { signUp, type AuthState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(signUp, {});

  return (
    <div className="animate-fade-in-up">
      {/* Back Button */}
      <div className="mb-6 flex justify-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>
      </div>

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full shadow-lg shadow-primary-500/25 mb-4 overflow-hidden relative">
          <Image src="/logo_teatch.png" alt="Teatch Logo" fill className="object-cover" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
          Teatch
        </h1>
        <p className="text-surface-400 mt-1 text-sm">Daftar sebagai Orang Tua</p>
      </div>

      {/* Register Card */}
      <div className="card p-8">
        <div className="flex items-center gap-2 mb-6">
          <UserPlus className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold">Buat akun baru</h2>
        </div>

        {state.error && (
          <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-600 dark:text-danger-500 text-sm animate-fade-in">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <Input
            name="fullName"
            type="text"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            required
            autoComplete="name"
          />

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
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
            Daftar
          </Button>
        </form>

        <p className="text-center text-sm text-surface-400 mt-6">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
