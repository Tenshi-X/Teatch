import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'ai' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm', className, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300', // Used for Subject
    ai: 'bg-ai-50 text-ai-600 dark:bg-ai-900/30 dark:text-ai-300', // Used for AI
    success: 'bg-success-50 text-success-600 dark:bg-success-900/30 dark:text-success-400', // Used for Easy
    warning: 'bg-learning-50 text-learning-600 dark:bg-learning-900/30 dark:text-learning-500', // Used for Medium
    danger: 'bg-error-50 text-error-600 dark:bg-error-900/30 dark:text-error-500', // Used for Hard
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
