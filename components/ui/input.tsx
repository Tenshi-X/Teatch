'use client';

import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      id,
      'aria-describedby': describedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const messageId = `${inputId}-message`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [describedBy, (error || helperText) && messageId]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={cn(
            'input-base',
            error &&
              'border-danger-500 focus:border-danger-500 focus:shadow-[0_0_0_2px_var(--bg),0_0_0_4px_var(--color-danger-500)]',
            className
          )}
          {...props}
        />
        {error && (
          <p id={messageId} className="mt-1.5 text-sm text-[var(--error-text)]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={messageId} className="mt-1.5 text-sm text-[var(--text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
