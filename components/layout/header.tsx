'use client';

import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { ChildSelector } from './child-selector';
import { useTheme } from '@/components/providers/theme-provider';
import { signOut } from '@/app/actions/auth';
import { useState, useRef, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';

interface HeaderProps {
  onMenuToggle: () => void;
  userName: string;
}

export function Header({ onMenuToggle, userName }: HeaderProps) {
  const { isDark, toggle } = useTheme();
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
    <header className="sticky top-0 z-30 bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)]">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left: Menu button (mobile) */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
        >
          <Menu size={22} />
        </button>

        {/* Center: Child selector */}
        <div className="flex-1 flex justify-center lg:justify-start lg:ml-0">
          <ChildSelector />
        </div>

        {/* Right: Theme toggle + User menu */}
        <div className="flex items-center gap-2">
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
              <Avatar name={userName} size="sm" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 card p-2 shadow-xl animate-scale-in">
                <div className="px-3 py-2 border-b border-[var(--card-border)] mb-2">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-surface-400">Akun Orang Tua</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors cursor-pointer"
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
