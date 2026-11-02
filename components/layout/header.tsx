'use client';

import { Menu, LogOut } from 'lucide-react';
import { ChildSelector } from './child-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { logout } from '@/lib/device-session';
import { useState, useRef, useEffect, useId } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/lib/stores/language-store';
import { t } from '@/lib/i18n';

interface HeaderProps {
  onMenuToggle: () => void;
  menuOpen?: boolean;
  userName: string;
  avatarUrl?: string;
  worksheetQuota?: number;
  subscriptionPeriodEnd?: string;
}

export function Header({
  onMenuToggle,
  menuOpen,
  userName,
  avatarUrl,
  worksheetQuota,
  subscriptionPeriodEnd,
}: HeaderProps) {
  const { language } = useLanguageStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[var(--card-bg)] border-b border-[var(--card-border)]">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left: Menu button */}
        <button
          type="button"
          aria-label={menuOpen ? 'Sembunyikan navigasi' : 'Buka navigasi'}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={onMenuToggle}
          className="icon-button mr-2"
        >
          <Menu size={22} />
        </button>

        {/* Center: Child selector */}
        <div className="flex-1 min-w-0 flex justify-start">
          <ChildSelector />
        </div>

        {/* Right: Theme toggle + User menu */}
        <div className="flex items-center gap-2">
          {/* Active Period Widget */}
          {subscriptionPeriodEnd && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-lg mr-1 border border-surface-200 dark:border-surface-700">
              <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                Aktif s.d:
              </span>
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {format(new Date(subscriptionPeriodEnd), 'dd MMM yyyy', {
                  locale: id,
                })}
              </span>
            </div>
          )}

          {/* Quota Widget */}
          {worksheetQuota !== undefined && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-lg mr-1 border border-surface-200 dark:border-surface-700">
              <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                {t('header.quota', language)}
              </span>
              <span
                className={cn(
                  'text-sm font-bold',
                  worksheetQuota > 5
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-warning-600 dark:text-warning-500'
                )}
              >
                {worksheetQuota}
              </span>
            </div>
          )}

          <ThemeToggle />

          {/* User menu */}
          <div
            className="relative"
            ref={menuRef}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && showUserMenu) {
                setShowUserMenu(false);
                triggerRef.current?.focus();
              }
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                setShowUserMenu(false);
            }}
          >
            <button
              type="button"
              ref={triggerRef}
              aria-label={`Akun ${userName}`}
              aria-expanded={showUserMenu}
              aria-controls={menuId}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="icon-button"
            >
              <Avatar name={userName} src={avatarUrl} size="sm" />
            </button>

            {showUserMenu && (
              <div
                id={menuId}
                className="absolute right-0 top-full mt-2 w-56 max-w-[calc(100vw-2rem)] card p-2 shadow-md border border-[var(--card-border)]"
              >
                <div className="px-3 py-2 border-b border-[var(--card-border)] mb-2">
                  <p className="break-words text-sm font-medium">{userName}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t('header.parentAccount', language)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    void logout();
                  }}
                  className="min-h-11 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--error-text)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  {t('header.logout', language)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
