import { formatRelativeTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import type { RecentActivity } from '@/types';

interface ActivityFeedProps {
  activities: RecentActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-surface-400">
        <Clock size={32} className="mx-auto mb-2 opacity-40" />
        <p className="text-sm">Belum ada aktivitas</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              activity.type === 'attempt_completed'
                ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400'
                : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            }`}
          >
            {activity.type === 'attempt_completed' ? (
              <CheckCircle size={18} />
            ) : (
              <FileText size={18} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{activity.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" size="sm">
                {activity.subject}
              </Badge>
              {activity.score !== undefined && (
                <Badge
                  variant={activity.score >= 80 ? 'secondary' : activity.score >= 60 ? 'warning' : 'danger'}
                  size="sm"
                >
                  Skor: {activity.score}
                </Badge>
              )}
            </div>
          </div>
          <span className="text-xs text-surface-400 shrink-0">
            {formatRelativeTime(activity.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
