import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

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
          className={cn(
            'input-base',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/10',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger-500">{error}</p>}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-surface-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
