'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

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
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
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
        </nav>

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
