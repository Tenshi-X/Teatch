'use client';
import { useEffect } from 'react';
import { recordProductEvent } from '@/app/actions/feedback';
export function RuntimeSignals({ ownerId }: { ownerId: string }) {
  useEffect(() => {
    const key = `teatch:visit:${ownerId}:${new Date().toISOString().slice(0, 10)}`;
    try {
      const id = sessionStorage.getItem(key) || crypto.randomUUID();
      sessionStorage.setItem(key, id);
      void recordProductEvent({ key: id, kind: 'visit' }).catch(
        () => undefined
      );
    } catch {
      /* Observation must not interrupt learning. */
    }
  }, [ownerId]);
  return null;
}
