'use client';

import { useChildStore } from '@/lib/stores/child-store';
import { Avatar } from '@/components/ui/avatar';
import { ChevronDown, Plus, Check } from 'lucide-react';
import { useState, useRef, useEffect, useId } from 'react';
import Link from 'next/link';
import { cn, calculateAge } from '@/lib/utils';
import { useLanguageStore } from '@/lib/stores/language-store';
import { t } from '@/lib/i18n';

export function ChildSelector() {
  const { children, activeChild, setActiveChild } = useChildStore();
  const { language } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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
        {t('childSelector.add', language)}
      </Link>
    );
  }

  return (
    <div
      className="relative min-w-0"
      ref={dropdownRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.stopPropagation();
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setIsOpen(false);
      }}
    >
      <button
        type="button"
        ref={triggerRef}
        aria-label={
          activeChild
            ? `Pilih anak, saat ini ${activeChild.name}`
            : 'Pilih anak'
        }
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-12 max-w-full items-center gap-2 px-2 sm:px-3 py-2 rounded-[var(--radius-button)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
      >
        {activeChild && (
          <>
            <Avatar
              src={activeChild.photo_url}
              name={activeChild.name}
              size="sm"
            />
            <div className="min-w-0 text-left">
              <p className="max-w-24 sm:max-w-44 truncate text-sm sm:text-base font-semibold leading-tight">
                {activeChild.name}
              </p>
              <p className="hidden sm:block text-sm text-[var(--text-muted)]">
                {activeChild.level} • {calculateAge(activeChild.birth_date)}{' '}
                {t('childSelector.yearsOld', language)}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                'shrink-0 text-[var(--text-muted)] transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id={listId}
          className="absolute left-0 top-full mt-2 w-64 max-w-[calc(100vw-5.5rem)] card p-2 shadow-md z-50"
        >
          <p className="px-3 py-2 text-sm font-medium text-[var(--text-muted)]">
            {t('childSelector.select', language)}
          </p>
          {children.map((child) => (
            <button
              type="button"
              key={child.id}
              aria-pressed={child.id === activeChild?.id}
              onClick={() => {
                setActiveChild(child.id);
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className={cn(
                'min-h-12 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer',
                child.id === activeChild?.id
                  ? 'bg-[var(--selection-bg)] text-[var(--selection-text)]'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
              )}
            >
              <Avatar src={child.photo_url} name={child.name} size="sm" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{child.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {child.level} {child.grade && `• ${child.grade}`}
                </p>
              </div>
              {child.id === activeChild?.id && (
                <Check
                  size={16}
                  className="text-primary-600 dark:text-primary-400 shrink-0"
                />
              )}
            </button>
          ))}
          <div className="border-t border-[var(--card-border)] mt-2 pt-2">
            <Link
              href="/children/new"
              onClick={() => setIsOpen(false)}
              className="flex min-h-11 items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--accent-color)] hover:bg-[var(--surface-subtle)] transition-colors"
            >
              <Plus size={16} />
              {t('childSelector.addNew', language)}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
