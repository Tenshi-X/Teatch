import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-button)] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] cursor-pointer';

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 shadow-[0_6px_18px_rgba(59,130,246,0.18)] border border-transparent',
      secondary:
        'bg-white border border-surface-300 text-primary-600 hover:bg-surface-50 focus:ring-primary-500 dark:bg-surface-800 dark:border-surface-700 dark:hover:bg-surface-900',
      outline:
        'border-[1.5px] border-surface-300 text-surface-600 hover:bg-surface-50 focus:ring-primary-500 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800/50',
      ghost:
        'text-surface-600 hover:bg-surface-100 focus:ring-surface-300 dark:text-surface-300 dark:hover:bg-surface-800 bg-transparent border border-transparent',
      danger:
        'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500 shadow-[0_6px_18px_rgba(248,113,113,0.18)] border border-transparent',
      ai:
        'bg-ai-500 text-white hover:bg-ai-600 focus:ring-ai-500 shadow-[0_6px_18px_rgba(139,92,246,0.18)] border border-transparent',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm font-semibold',
      lg: 'px-8 py-3.5 text-base font-semibold',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
