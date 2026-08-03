'use client';

import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { ChildSelector } from './child-selector';
import { useTheme } from '@/components/providers/theme-provider';
import { signOut } from '@/app/actions/auth';
import { useState, useRef, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useLanguageStore } from '@/lib/stores/language-store';
import { t } from '@/lib/i18n';

interface HeaderProps {
  onMenuToggle: () => void;
  userName: string;
  avatarUrl?: string;
  worksheetQuota?: number;
}

export function Header({ onMenuToggle, userName, avatarUrl, worksheetQuota }: HeaderProps) {
  const { isDark, toggle } = useTheme();
  const { language } = useLanguageStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer mr-2"
        >
          <Menu size={22} />
        </button>

        {/* Center: Child selector */}
        <div className="flex-1 flex justify-center lg:justify-start lg:ml-0">
          <ChildSelector />
        </div>

        {/* Right: Theme toggle + User menu */}
        <div className="flex items-center gap-2">
          {/* Quota Widget */}
          {worksheetQuota !== undefined && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-800 rounded-lg mr-1 border border-surface-200 dark:border-surface-700">
              <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
                {t('header.quota', language)}
              </span>
              <span className={cn(
                "text-sm font-bold",
                worksheetQuota > 5 ? "text-primary-600 dark:text-primary-400" : "text-warning-600 dark:text-warning-500"
              )}>
                {worksheetQuota}
              </span>
            </div>
          )}

          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
            >
              <Avatar name={userName} src={avatarUrl} size="sm" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 card p-2 shadow-sm border border-[var(--card-border)] animate-scale-in">
                <div className="px-3 py-2 border-b border-[var(--card-border)] mb-2">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-surface-400">{t('header.parentAccount', language)}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors cursor-pointer"
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
