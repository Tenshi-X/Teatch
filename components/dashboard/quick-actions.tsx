import Link from 'next/link';
import { Users, BarChart3, History, ArrowUpRight } from 'lucide-react';

const actions = [
  { href: '/children', label: 'Profil anak', icon: Users },
  { href: '/statistics', label: 'Laporan perkembangan', icon: BarChart3 },
  { href: '/history', label: 'Semua latihan', icon: History },
];

export function QuickActions() {
  return (
    <nav
      aria-label="Kelola belajar"
      className="flex flex-wrap gap-x-7 gap-y-2 border-t border-[var(--card-border)] pt-5"
    >
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--text-soft)] hover:text-primary-700 dark:hover:text-primary-200"
        >
          <action.icon size={17} aria-hidden="true" />
          {action.label}
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}
