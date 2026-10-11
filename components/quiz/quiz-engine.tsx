'use client';
import { useEffect, useState, useSyncExternalStore, useCallback } from 'react';
import { submitAttempt } from '@/app/actions/attempts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MathText } from '@/components/ui/math-text';
import { QuestionInput } from './interactions';
import type { GeneratedQuestion } from '@/lib/learning/contracts';
import { isAnswerComplete } from '@/lib/learning/scoring';
import { z } from 'zod';
import { formatDuration } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
type Progress = {
  answers: Record<string, string>;
  index: number;
  duration: number;
  requestKey: string;
};
const progressSchema = z.object({
  answers: z.record(z.string(), z.string().max(10000)),
  index: z.number().int().nonnegative(),
  duration: z.number().int().min(0).max(86400),
  requestKey: z.uuid(),
});
function read(key: string) {
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}
function decode(raw: string): Progress | null {
  try {
    const parsed = progressSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
export function QuizEngine({
  worksheetId,
  childId,
  questions,
  worksheetTitle,
}: {
  worksheetId: string;
  childId: string;
  questions: (GeneratedQuestion & { id: string })[];
  worksheetTitle: string;
}) {
  const key = `teatch:quiz:${childId}:${worksheetId}`;
  const subscribe = useCallback((notify: () => void) => {
    window.addEventListener('storage', notify);
    window.addEventListener('teatch-progress', notify);
    return () => {
      window.removeEventListener('storage', notify);
      window.removeEventListener('teatch-progress', notify);
    };
  }, []);
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => ''
  );
  const progress = decode(raw);
  const answers = progress?.answers || {};
  const index = Math.min(
    questions.length - 1,
    Math.max(0, progress?.index || 0)
  );
  const elapsed = progress?.duration || 0;
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof submitAttempt>
  > | null>(null);
  const update = useCallback(
    (change: Partial<Progress>) => {
      const current = decode(read(key)) || {
        answers: {},
        index: 0,
        duration: 0,
        requestKey: crypto.randomUUID(),
      };
      try {
        localStorage.setItem(key, JSON.stringify({ ...current, ...change }));
        window.dispatchEvent(new Event('teatch-progress'));
      } catch {
        toast.error(
          'Penyimpanan perangkat penuh. Gunakan perangkat dengan penyimpanan tersedia.'
        );
      }
    },
    [key]
  );
  useEffect(() => {
    if (result) return;
    const timer = setInterval(() => {
      const p = decode(read(key));
      update({ duration: Math.min(86400, (p?.duration || 0) + 1) });
    }, 1000);
    return () => clearInterval(timer);
  }, [key, result, update]);
  const answered = questions.filter((q) =>
    isAnswerComplete(q, answers[q.id] || '')
  ).length;
  const submit = async () => {
    if (
      answered < questions.length &&
      !window.confirm(
        `${questions.length - answered} soal belum dijawab. Selesaikan latihan?`
      )
    )
      return;
    setBusy(true);
    try {
      const p = decode(read(key));
      const requestKey = p?.requestKey || crypto.randomUUID();
      if (!p) update({ requestKey });
      const saved = await submitAttempt({
        worksheetId,
        requestKey,
        duration: elapsed,
        answers,
      });
      setResult(saved);
      try {
        localStorage.removeItem(key);
      } catch {}
      window.dispatchEvent(new Event('teatch-progress'));
      toast.success('Hasil latihan tersimpan.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Hasil belum tersimpan.'
      );
    } finally {
      setBusy(false);
    }
  };
  if (result)
    return (
      <Card padding="lg" className="max-w-xl mx-auto text-center space-y-5">
        <h1 className="text-2xl font-bold">Latihan selesai</h1>
        <p>{worksheetTitle}</p>
        {result.score === null ? (
          <p>
            Jawaban tersimpan dan menunggu tinjauan orang tua. Nilai akhir
            muncul setelah semua jawaban dinilai.
          </p>
        ) : (
          <p className="text-4xl font-bold">{result.score}%</p>
        )}
        <p>
          {result.correct_answers} benar dari {result.total_questions} soal •{' '}
          {formatDuration(result.duration || 0)}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {result.status === 'pending_review' && (
            <Link href="/review">
              <Button>Tinjau jawaban</Button>
            </Link>
          )}
          <Link href={`/worksheets/${worksheetId}`}>
            <Button variant="outline">Lihat pembahasan</Button>
          </Link>
          <Link href="/statistics">
            <Button variant="outline">Perkembangan</Button>
          </Link>
        </div>
      </Card>
    );
  const q = questions[index];
  if (!q) return <p>Soal tidak tersedia.</p>;
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <h1 className="text-xl font-bold">{worksheetTitle}</h1>
      <p className="text-sm">
        {answered}/{questions.length} soal dijawab • {formatDuration(elapsed)}.
        Progres disimpan di perangkat ini.
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={q.id}
            className={`border rounded-lg p-3 ${index === i ? 'bg-primary-500 text-white' : ''}`}
            aria-label={`Buka soal ${i + 1}`}
            onClick={() => update({ index: i })}
          >
            {i + 1}
            {isAnswerComplete(q, answers[q.id] || '') ? ' ✓' : ''}
          </button>
        ))}
      </div>
      <Card padding="lg">
        <div className="space-y-4">
          <b>Soal {index + 1}</b>
          {'story' in q && (
            <p className="border p-4 rounded-lg whitespace-pre-wrap">
              {q.story}
            </p>
          )}
          <MathText content={q.question} />
          <QuestionInput
            key={q.id}
            question={q}
            value={answers[q.id] || ''}
            onChange={(v) => update({ answers: { ...answers, [q.id]: v } })}
          />
        </div>
      </Card>
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={index === 0 || busy}
          onClick={() => update({ index: index - 1 })}
        >
          Sebelumnya
        </Button>
        {index < questions.length - 1 ? (
          <Button disabled={busy} onClick={() => update({ index: index + 1 })}>
            Selanjutnya
          </Button>
        ) : (
          <Button isLoading={busy} onClick={submit}>
            Selesaikan latihan
          </Button>
        )}
      </div>
    </div>
  );
}
