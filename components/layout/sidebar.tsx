'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/lib/stores/language-store';
import { t } from '@/lib/i18n';
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
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/children', labelKey: 'nav.children', icon: Users },
  { href: '/worksheets/new', labelKey: 'nav.create', icon: PenTool },
  { href: '/history', labelKey: 'nav.history', icon: History },
  { href: '/statistics', labelKey: 'nav.statistics', icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const { language } = useLanguageStore();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };  return (
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
          'fixed top-0 left-0 h-full w-72 sidebar z-50 flex flex-col transition-all duration-300 ease-in-out',
          'lg:relative lg:z-auto',
          isOpen ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--sidebar-border)]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--card-border)] bg-white shadow-sm transition-shadow overflow-hidden relative">
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
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-input)] text-sm font-medium transition-all duration-150 border',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-500'
                    : 'border-transparent text-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-300'
                )}
              >
                <item.icon
                  size={20}
                  className={cn(
                    isActive ? 'text-primary-600 dark:text-primary-400' : ''
                  )}
                />
                {t(item.labelKey as any, language)}
              </Link>
            );
          })}

          {userRole === 'admin' && (
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-rose-500 hover:bg-rose-500/10"
            >
              <ShieldAlert size={20} />
              {t('nav.admin', language)}
            </Link>
          )}
        </nav>



        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-[var(--sidebar-border)]">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-input)] text-sm font-medium transition-all duration-150 border',
              pathname === '/settings'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-500'
                : 'border-transparent text-surface-600 hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-300'
            )}
          >
            <Settings size={20} />
            {t('nav.settings', language)}
          </Link>
        </div>
      </aside>
    </>
  );
}
