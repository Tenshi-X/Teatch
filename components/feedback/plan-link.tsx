'use client';
import type { ComponentProps } from 'react';
import { recordProductEvent } from '@/app/actions/feedback';
export function PlanLink(props: ComponentProps<'a'>) {
  return (
    <a
      {...props}
      onClick={() => {
        void recordProductEvent({
          key: crypto.randomUUID(),
          kind: 'plan_clicked',
        }).catch(() => undefined);
      }}
    />
  );
}
