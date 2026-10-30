'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GenerationStatus } from '@/lib/learning/generation-status';

export function useGenerationRecovery(
  requestKey: string | undefined,
  storageKey: string
) {
  const router = useRouter();
  const [recovery, setRecovery] = useState<
    (GenerationStatus & { key: string }) | null
  >(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!requestKey) return;
    let active = true,
      attempts = 0;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    const poll = async () => {
      if (!active || document.hidden || Date.now() - started > 20 * 60_000)
        return;
      controller?.abort();
      const current = new AbortController();
      controller = current;
      let again = true;
      try {
        const response = await fetch(
          `/api/ai/generation-status?requestKey=${encodeURIComponent(requestKey)}`,
          {
            cache: 'no-store',
            signal: AbortSignal.any([
              current.signal,
              AbortSignal.timeout(10_000),
            ]),
          }
        );
        if (!response.ok) throw new Error('STATUS_UNAVAILABLE');
        const data = (await response.json()) as GenerationStatus;
        if (!active || current.signal.aborted) return;
        setRecovery({ ...data, key: requestKey });
        if (data.status === 'succeeded' && data.worksheetId) {
          try {
            localStorage.removeItem(storageKey);
          } catch {}
          window.dispatchEvent(new Event('teatch-generation'));
          router.push(`/worksheets/${data.worksheetId}`);
          router.refresh();
        }
        again =
          data.status === 'reserved' ||
          (data.status === 'not_found' && attempts < 3);
      } catch {
        // Keep the key, including when auth/network is unavailable. Never POST here.
        if (active && !current.signal.aborted)
          setRecovery({
            key: requestKey,
            status: 'reserved',
            message:
              'Status belum dapat diperiksa. Kunci permintaan tetap tersimpan; coba kembali nanti.',
          });
      }
      if (active && again && !document.hidden)
        timer = setTimeout(
          poll,
          Math.min(20_000, 2000 * 2 ** Math.min(attempts++, 4))
        );
    };
    const visibility = () => {
      clearTimeout(timer);
      if (document.hidden) controller?.abort();
      else void poll();
    };
    document.addEventListener('visibilitychange', visibility);
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [requestKey, storageKey, router, revision]);
  return {
    status: recovery?.key === requestKey ? recovery : null,
    recheck: () => setRevision((v) => v + 1),
  };
}
