'use client';
import { useState } from 'react';
import { resolveProductFeedback } from '@/app/actions/admin';
import type { Database } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
export function ProductFeedback({
  items,
}: {
  items: Database['public']['Tables']['product_feedback']['Row'][];
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const labels = { helpful: 'Membantu', problem: 'Kendala', idea: 'Usulan' };
  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold">Masukan pengguna</h2>
      {!items.length && (
        <p className="mt-3 text-sm">Belum ada masukan terbuka.</p>
      )}
      {items.map((item) => (
        <div
          key={item.id}
          className="mt-4 space-y-2 border-t border-[var(--card-border)] pt-4"
        >
          <p className="text-sm font-medium">
            {labels[item.category]} ·{' '}
            {new Date(item.created_at).toLocaleDateString('id-ID', {
              timeZone: 'Asia/Jakarta',
            })}
          </p>
          <p className="whitespace-pre-wrap break-words text-sm">
            {item.comment || 'Tanpa komentar.'}
          </p>
          {item.worksheet_id && (
            <p className="break-all text-xs text-[var(--text-muted)]">
              Referensi latihan: {item.worksheet_id}
            </p>
          )}
          <Button
            size="sm"
            variant="outline"
            isLoading={busy === item.id}
            onClick={async () => {
              setBusy(item.id);
              try {
                await resolveProductFeedback(item.id);
              } catch {
                toast.error('Masukan belum ditutup.');
              } finally {
                setBusy(null);
              }
            }}
          >
            Tandai ditangani
          </Button>
        </div>
      ))}
    </Card>
  );
}
