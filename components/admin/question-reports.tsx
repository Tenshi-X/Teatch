'use client';
import {
  resolveQuestionReport,
  type AdminQuestionReport,
} from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { hydrateQuestion } from '@/lib/learning/contracts';
import { QuestionContent } from '@/components/worksheets/question-content';
export function QuestionReports({
  reports,
}: {
  reports: AdminQuestionReport[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <section className="rounded-xl border border-[var(--card-border)] p-6 space-y-3">
      <h2 className="font-bold text-lg">100 laporan soal terbuka terbaru</h2>
      {!reports.length && <p>Tidak ada laporan terbuka.</p>}
      {reports.map((r) => {
        const q = r.questions ? hydrateQuestion(r.questions) : null;
        return (
          <div
            key={r.id}
            className="border-b border-[var(--card-border)] pb-3 space-y-3"
          >
            <p className="whitespace-pre-wrap">{r.reason}</p>
            <p className="text-xs text-[var(--text-muted)]">
              Soal: {r.question_id} •{' '}
              {new Date(r.created_at).toLocaleDateString('id-ID')}
            </p>
            <details className="rounded-lg border border-[var(--card-border)] p-3">
              <summary className="cursor-pointer">
                Lihat soal dan kunci yang dilaporkan
              </summary>
              <div className="mt-3">
                {q ? (
                  <QuestionContent question={q} showAnswer />
                ) : (
                  <p className="whitespace-pre-wrap">
                    {r.questions?.question || 'Soal sudah dihapus.'}
                    {r.questions?.answer && `\nKunci: ${r.questions.answer}`}
                  </p>
                )}
              </div>
            </details>
            <Button
              size="sm"
              disabled={busy !== null}
              onClick={async () => {
                setBusy(r.id);
                try {
                  await resolveQuestionReport(r.id);
                  router.refresh();
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : 'Gagal menutup laporan.'
                  );
                } finally {
                  setBusy(null);
                }
              }}
            >
              Tandai sudah ditangani
            </Button>
          </div>
        );
      })}
    </section>
  );
}
