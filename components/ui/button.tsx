import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: Pick<ButtonProps, 'variant' | 'size' | 'className'> = {}) {
  const variants = {
    primary: 'action-primary border border-transparent',
    secondary:
      'bg-[var(--card-bg)] border border-[var(--input-border)] text-[var(--fg)] hover:bg-[var(--surface-subtle)]',
    outline:
      'border border-[var(--input-border)] text-[var(--fg)] hover:bg-[var(--surface-subtle)]',
    ghost:
      'text-[var(--text-soft)] hover:bg-[var(--surface-subtle)] bg-transparent border border-transparent',
    danger:
      'bg-danger-600 text-white hover:bg-danger-700 border border-transparent',
    ai: 'action-primary border border-transparent',
  };
  const sizes = {
    sm: 'min-h-11 px-4 py-2 text-sm',
    md: 'min-h-12 px-5 py-3 text-base',
    lg: 'min-h-12 px-6 py-3.5 text-lg',
  };
  return cn('button-base', variants[variant], sizes[size], className);
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={buttonStyles({ variant, size, className })}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && (
          <svg
            aria-hidden="true"
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
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
