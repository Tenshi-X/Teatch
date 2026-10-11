import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans">
      <nav className="border-b border-[var(--card-border)] bg-[var(--card-bg)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface-subtle)] rounded-lg">
              <ShieldAlert
                className="text-primary-600 dark:text-primary-300"
                size={24}
              />
            </div>
            <span className="text-xl font-bold text-[var(--fg)] tracking-tight">
              Teatch Admin
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--fg)] transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke App
          </Link>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
