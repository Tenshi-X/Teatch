'use client';
import { useEffect, useSyncExternalStore } from 'react';
function subscribe(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  return () => observer.disconnect();
}
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('teatch-theme');
      } catch {
        /* Storage may be disabled. */
      }
      document.documentElement.classList.toggle(
        'dark',
        saved ? saved === 'dark' : media.matches
      );
    };
    sync();
    media.addEventListener('change', sync);
    window.addEventListener('storage', sync);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return <>{children}</>;
}
export function useTheme() {
  const isDark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains('dark'),
    () => false
  );
  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('teatch-theme', next ? 'dark' : 'light');
    } catch {
      /* Keep the session preference. */
    }
  };
  return { isDark, toggle };
}
