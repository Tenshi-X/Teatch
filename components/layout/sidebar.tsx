'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/lib/stores/language-store';
import { t } from '@/lib/i18n';
import { useEffect, useRef } from 'react';

import {
  LayoutDashboard,
  Users,
  PenTool,
  BarChart3,
  History,
  Settings,
  X,
  ShieldAlert,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/children', labelKey: 'nav.children', icon: Users },
  { href: '/worksheets/new', labelKey: 'nav.create', icon: PenTool },
  { href: '/history', labelKey: 'nav.history', icon: History },
  { href: '/review', labelKey: 'nav.review', icon: ShieldAlert },
  { href: '/statistics', labelKey: 'nav.statistics', icon: BarChart3 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  isMobile?: boolean;
}

export function Sidebar({
  isOpen,
  onClose,
  userRole,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { language } = useLanguageStore();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen || !isMobile) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const panel = sidebarRef.current;
    const controls = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled)'
        ) || []
      ).filter((element) => element.getClientRects().length);
    controls()[0]?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key !== 'Tab') return;
      const items = controls();
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      requestAnimationFrame(() => previousFocus?.focus());
    };
  }, [isOpen, isMobile, onClose]);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Tutup navigasi"
          className="fixed inset-0 bg-black/50 z-40 lg:hidden cursor-pointer"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        id="main-navigation"
        ref={sidebarRef}
        inert={!isOpen}
        role={isMobile ? 'dialog' : undefined}
        aria-modal={isMobile && isOpen ? true : undefined}
        aria-label="Navigasi Teatch"
        className={cn(
          'fixed top-0 left-0 h-full w-72 sidebar z-50 flex flex-col transition-all duration-300 ease-in-out',
          'lg:relative lg:z-auto',
          isOpen ? 'translate-x-0 lg:ml-0' : '-translate-x-full lg:-ml-72'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--sidebar-border)]">
          <Link
            href="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 group min-w-0"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--card-border)] bg-white shadow-sm transition-shadow overflow-hidden relative">
              <Image
                src="/teatch_logo.png"
                alt="Teatch Logo"
                fill
                className="brand-logo object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-300">
                Teatch
              </h1>
              <p className="text-xs text-[var(--text-muted)] -mt-0.5">
                Belajar bersama keluarga
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            aria-label="Tutup navigasi"
            className="icon-button lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Menu utama"
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={handleLinkClick}
                className={cn(
                  'flex min-h-12 items-center gap-3 px-4 py-2.5 rounded-[var(--radius-input)] text-base font-medium transition-colors duration-150 border',
                  isActive
                    ? 'nav-active'
                    : 'border-transparent text-[var(--text-muted)] hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-300'
                )}
              >
                <item.icon
                  aria-hidden="true"
                  size={20}
                  className={cn(
                    isActive ? 'text-primary-600 dark:text-primary-400' : ''
                  )}
                />
                {t(item.labelKey, language)}
              </Link>
            );
          })}

          {userRole === 'admin' && (
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
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
            onClick={handleLinkClick}
            aria-current={pathname === '/settings' ? 'page' : undefined}
            className={cn(
              'flex min-h-12 items-center gap-3 px-4 py-2.5 rounded-[var(--radius-input)] text-base font-medium transition-colors duration-150 border',
              pathname === '/settings'
                ? 'nav-active'
                : 'border-transparent text-[var(--text-muted)] hover:bg-surface-50 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-300'
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
