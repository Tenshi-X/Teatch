'use client';

import { useChildStore } from '@/lib/stores/child-store';
import { Avatar } from '@/components/ui/avatar';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn, calculateAge } from '@/lib/utils';

export function ChildSelector() {
  const { children, activeChild, setActiveChild } = useChildStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (children.length === 0) {
    return (
      <Link
        href="/children/new"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
      >
        <Plus size={16} />
        Tambah Anak
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
      >
        {activeChild && (
          <>
            <Avatar src={activeChild.photo_url} name={activeChild.name} size="sm" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium leading-tight">{activeChild.name}</p>
              <p className="text-xs text-surface-400">
                {activeChild.level} • {calculateAge(activeChild.birth_date)} tahun
              </p>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                'text-surface-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 top-full mt-2 w-64 card p-2 shadow-xl animate-scale-in z-50">
          <p className="px-3 py-1.5 text-xs font-medium text-surface-400 uppercase tracking-wider">
            Pilih Anak
          </p>
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                setActiveChild(child.id);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
                child.id === activeChild?.id
                  ? 'bg-primary-50 dark:bg-primary-900/20'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
              )}
            >
              <Avatar src={child.photo_url} name={child.name} size="sm" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{child.name}</p>
                <p className="text-xs text-surface-400">
                  {child.level} {child.grade && `• ${child.grade}`}
                </p>
              </div>
              {child.id === activeChild?.id && (
                <Check size={16} className="text-primary-600 dark:text-primary-400 shrink-0" />
              )}
            </button>
          ))}
          <div className="border-t border-[var(--card-border)] mt-2 pt-2">
            <Link
              href="/children/new"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            >
              <Plus size={16} />
              Tambah Anak Baru
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
