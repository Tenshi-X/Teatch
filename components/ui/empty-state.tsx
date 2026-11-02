import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-10 sm:py-16 px-5 text-center',
        className
      )}
    >
      {icon && (
        <div aria-hidden="true" className="mb-4 text-[var(--text-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
