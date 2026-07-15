import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await (supabase.from('profiles') as any)
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className={`min-h-screen bg-[#0F172A] text-slate-200 ${inter.className}`}>
      <nav className="border-b border-slate-800 bg-[#1E293B]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <ShieldAlert className="text-rose-500" size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Teatch Admin</span>
          </div>
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
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
