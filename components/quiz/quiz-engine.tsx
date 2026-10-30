'use client';
import {
  useEffect,
  useState,
  useSyncExternalStore,
  useCallback,
  useRef,
} from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Check } from 'lucide-react';
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
import { useChildStore } from '@/lib/stores/child-store';
import { FeedbackForm } from '@/components/feedback/feedback-form';
import { recordProductEvent } from '@/app/actions/feedback';
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
  ownerId,
  worksheetId,
  childId,
  questions,
  worksheetTitle,
}: {
  ownerId: string;
  worksheetId: string;
  childId: string;
  questions: (GeneratedQuestion & { id: string })[];
  worksheetTitle: string;
}) {
  const key = `teatch:quiz:${ownerId}:${childId}:${worksheetId}`;
  const child = useChildStore((state) =>
    state.children.find((item) => item.id === childId)
  );
  const earlyLearner =
    !!child &&
    (['PAUD', 'TK A', 'TK B'].includes(child.level) ||
      (child.level === 'SD' &&
        ['Kelas 1', 'Kelas 2'].includes(child.grade || '')));
  const questionHeading = useRef<HTMLHeadingElement>(null);
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
  const attemptKey = progress?.requestKey;
  useEffect(() => {
    if (attemptKey)
      void recordProductEvent({
        key: attemptKey,
        kind: 'attempt_started',
        worksheetId,
      }).catch(() => undefined);
  }, [attemptKey, worksheetId]);
  useEffect(() => {
    questionHeading.current?.focus({ preventScroll: true });
  }, [index]);
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
      <Card padding="lg" className="max-w-xl mx-auto space-y-5">
        <CheckCircle
          size={32}
          className="text-primary-600 dark:text-primary-300"
          aria-hidden="true"
        />
        <p className="learning-eyebrow">Catatan latihan</p>
        <h1 className="text-3xl font-semibold">
          Latihan selesai. Terima kasih sudah mencoba!
        </h1>
        <p className="text-[var(--text-muted)]">{worksheetTitle}</p>
        {result.score === null ? (
          <p>
            Jawaban tersimpan dan menunggu tinjauan orang tua. Nilai akhir
            muncul setelah semua jawaban dinilai.
          </p>
        ) : (
          <p className="text-4xl font-semibold">
            {result.score}%
            <span className="ml-3 text-base font-normal text-[var(--text-muted)]">
              nilai latihan
            </span>
          </p>
        )}
        <p>
          {result.correct_answers} jawaban sudah dinilai benar dari{' '}
          {result.total_questions} soal · {formatDuration(result.duration || 0)}
        </p>
        <div className="flex flex-wrap gap-3 border-t border-[var(--card-border)] pt-5">
          {result.status === 'pending_review' && (
            <Link href="/review">
              <Button>Tinjau jawaban</Button>
            </Link>
          )}
          <Link href={`/worksheets/${worksheetId}`}>
            <Button variant="outline">Lihat pembahasan</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Kembali ke ruang belajar</Button>
          </Link>
        </div>
        <FeedbackForm worksheetId={worksheetId} />
      </Card>
    );
  const q = questions[index];
  if (!q) return <p>Soal tidak tersedia.</p>;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <Link
          href={`/worksheets/${worksheetId}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--text-muted)] hover:underline"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Kembali ke latihan
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="learning-eyebrow">
            Waktu belajar{child ? ` · ${child.name}` : ''}
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            {answered} dari {questions.length} soal dijawab
          </p>
        </div>
        <h1 className="mt-2 text-xl sm:text-2xl font-semibold">
          {worksheetTitle}
        </h1>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--card-border)]"
          role="progressbar"
          aria-label="Soal yang sudah dijawab"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={answered}
        >
          <div
            className="h-full bg-primary-500 transition-[width] duration-200"
            style={{ width: `${(answered / questions.length) * 100}%` }}
          />
        </div>
      </header>
      <section
        className="practice-sheet"
        data-early-learner={earlyLearner}
        aria-labelledby="question-heading"
      >
        <div className="space-y-6">
          <h2
            id="question-heading"
            ref={questionHeading}
            tabIndex={-1}
            className="learning-eyebrow outline-none"
          >
            Soal {index + 1} dari {questions.length}
          </h2>
          {'story' in q && (
            <p className="border-l-2 border-primary-300 pl-4 whitespace-pre-wrap leading-relaxed">
              {q.story}
            </p>
          )}
          <MathText
            content={q.question}
            className="text-xl sm:text-2xl font-medium leading-relaxed"
          />
          <fieldset disabled={busy} className="min-w-0">
            <legend className="sr-only">Jawaban soal {index + 1}</legend>
            <QuestionInput
              key={q.id}
              question={q}
              value={answers[q.id] || ''}
              onChange={(v) => update({ answers: { ...answers, [q.id]: v } })}
            />
          </fieldset>
        </div>
      </section>
      <div className="flex flex-wrap justify-between gap-3">
        <Button
          variant="outline"
          disabled={index === 0 || busy}
          onClick={() => update({ index: index - 1 })}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Sebelumnya
        </Button>
        {index < questions.length - 1 ? (
          <Button disabled={busy} onClick={() => update({ index: index + 1 })}>
            Selanjutnya
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        ) : (
          <Button isLoading={busy} onClick={submit}>
            Selesaikan latihan
          </Button>
        )}
      </div>
      <details className="border-t border-[var(--card-border)] pt-4">
        <summary className="cursor-pointer py-2 text-sm font-medium">
          Lihat semua nomor soal
        </summary>
        <nav aria-label="Nomor soal" className="mt-3 flex flex-wrap gap-2">
          {questions.map((question, i) => {
            const complete = isAnswerComplete(
              question,
              answers[question.id] || ''
            );
            return (
              <button
                key={question.id}
                type="button"
                disabled={busy}
                aria-current={index === i ? 'step' : undefined}
                aria-label={`Soal ${i + 1}${complete ? ', sudah dijawab' : ', belum dijawab'}`}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border px-3 ${index === i ? 'border-primary-600 bg-primary-600 text-white' : 'border-[var(--card-border)]'}`}
                onClick={() => update({ index: i })}
              >
                {i + 1}
                {complete && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </nav>
      </details>
      <p className="text-sm text-[var(--text-muted)]">
        Jawaban disimpan di perangkat ini selama latihan. Waktu belajar:{' '}
        {formatDuration(elapsed)}.
      </p>
    </div>
  );
}
