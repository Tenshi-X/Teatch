'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          color: 'var(--fg)',
          borderRadius: '0.75rem',
          boxShadow: 'var(--shadow-lg)',
        },
      }}
      richColors
      closeButton
    />
  );
}
