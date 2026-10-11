'use client';
import { reconcileQuota } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
export function QuotaMonitor({
  audit,
}: {
  audit: {
    discrepancies: number;
    expiredReservations: number;
    heldQuestions: number;
  };
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <section className="border border-[var(--card-border)] rounded-xl p-5 space-y-3">
      <h2 className="font-bold">Audit kuota</h2>
      <p>
        {audit.discrepancies} akun berbeda dari catatan perubahan •{' '}
        {audit.heldQuestions} soal dalam reservasi • {audit.expiredReservations}{' '}
        reservasi kedaluwarsa.
      </p>
      <Button
        isLoading={busy}
        disabled={!audit.expiredReservations}
        onClick={async () => {
          setBusy(true);
          try {
            const refunded = await reconcileQuota();
            toast.success(`${refunded} kuota soal dipulihkan.`);
            router.refresh();
          } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Pemulihan gagal.');
          } finally {
            setBusy(false);
          }
        }}
      >
        Pulihkan reservasi kedaluwarsa
      </Button>
    </section>
  );
}
