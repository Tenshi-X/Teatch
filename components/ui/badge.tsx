import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm', className, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-500',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500',
    outline: 'border border-surface-300 text-surface-600 dark:border-surface-600 dark:text-surface-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
