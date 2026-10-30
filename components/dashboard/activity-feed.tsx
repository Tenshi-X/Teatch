import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { FileText, CheckCircle } from 'lucide-react';
import type { RecentActivity } from '@/types';

export function ActivityFeed({ activities }: { activities: RecentActivity[] }) {
  if (!activities.length)
    return (
      <p className="py-4 text-sm text-[var(--text-muted)]">
        Latihan dan hasil belajar akan tercatat di sini.
      </p>
    );
  return (
    <ul className="divide-y divide-[var(--card-border)]">
      {activities.map((activity) => (
        <li key={activity.id} className="flex items-start gap-3 py-4">
          {activity.type === 'attempt_completed' ? (
            <CheckCircle
              size={18}
              className="mt-1 shrink-0 text-primary-600 dark:text-primary-300"
              aria-hidden="true"
            />
          ) : (
            <FileText
              size={18}
              className="mt-1 shrink-0 text-[var(--text-muted)]"
              aria-hidden="true"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium break-words">
              {activity.href ? (
                <Link href={activity.href} className="hover:underline">
                  {activity.title}
                </Link>
              ) : (
                activity.title
              )}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {activity.subject} ·{' '}
              {activity.type === 'attempt_completed'
                ? `Selesai dinilai${activity.score !== undefined ? ` · ${activity.score}%` : ''}`
                : 'Latihan dibuat'}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {formatRelativeTime(activity.createdAt)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
