'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  LayoutDashboard,
  Users,
  PenTool,
  BarChart3,
  History,
  Settings,
  BookOpen,
  X,
  FileText,
  ShieldAlert,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/children', label: 'Anak Saya', icon: Users },
  { href: '/worksheets/new', label: 'Buat Latihan', icon: PenTool },
  { href: '/history', label: 'Riwayat', icon: History },
  { href: '/statistics', label: 'Statistik', icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  worksheetQuota?: number;
  subscriptionPeriodEnd?: string;
}

export function Sidebar({ isOpen, onClose, userRole, worksheetQuota = 0, subscriptionPeriodEnd }: SidebarProps) {
  const pathname = usePathname();

  const getActivePeriodText = () => {
    if (!subscriptionPeriodEnd) return 'Tidak aktif';
    const endDate = new Date(subscriptionPeriodEnd);
    const daysLeft = differenceInDays(endDate, new Date());
    if (daysLeft < 0) return 'Masa aktif habis';
    if (daysLeft === 0) return 'Habis hari ini';
    return `${daysLeft} hari lagi`;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 sidebar z-50 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--sidebar-border)]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow overflow-hidden relative">
              <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-500">
                Teatch
              </h1>
              <p className="text-[10px] text-surface-400 -mt-0.5">AI Learning Platform</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-300'
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    isActive ? 'text-primary-600 dark:text-primary-400' : ''
                  )}
                />
                {item.label}
              </Link>
            );
          })}

          {userRole === 'admin' && (
            <Link
              href="/admin"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-rose-500 hover:bg-rose-500/10"
            >
              <ShieldAlert size={20} />
              Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Quota Widget */}
        <div className="px-4 py-4 mb-2">
          <div className="card p-4 border border-[var(--sidebar-border)] bg-surface-50 dark:bg-surface-900/50 shadow-sm relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary-500/10 rounded-full blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Kuota AI</span>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  worksheetQuota > 5 ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                )}>
                  {worksheetQuota}
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-surface-500 flex justify-between">
                  <span>Masa aktif:</span>
                  <span className="font-medium text-surface-700 dark:text-surface-300">{getActivePeriodText()}</span>
                </p>
                {subscriptionPeriodEnd && (
                  <p className="text-[10px] text-surface-400">
                    s.d {format(new Date(subscriptionPeriodEnd), 'dd MMM yyyy', { locale: id })}
                  </p>
                )}
              </div>
              <Link href="/" className="mt-3 block text-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">
                Upgrade Paket
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-[var(--sidebar-border)]">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              pathname === '/settings'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            <Settings size={20} />
            Pengaturan
          </Link>
        </div>
      </aside>
    </>
  );
}
