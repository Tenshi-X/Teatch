'use client';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WorksheetPrintable } from '@/components/worksheets/worksheet-printable';
import { QuestionPreview } from '@/components/worksheets/question-preview';
import { hydrateQuestion } from '@/lib/learning/contracts';
import { reportQuestion } from '@/app/actions/worksheets';
import type { Worksheet, Question } from '@/types';
import { toast } from 'sonner';
import { MathText } from '@/components/ui/math-text';
export function WorksheetDetail({
  worksheet,
  questions,
}: {
  worksheet: Worksheet;
  questions: Question[];
}) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reportBusy, setReportBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null),
    answerRef = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
      contentRef: ref,
      documentTitle: worksheet.title,
    }),
    printAnswers = useReactToPrint({
      contentRef: answerRef,
      documentTitle: `${worksheet.title} - kunci`,
    });
  const hydrated = questions.map(hydrateQuestion);
  const interactive =
    questions.length > 0 &&
    hydrated.every((q) => q !== null) &&
    questions.length === worksheet.question_count;
  const report = async () => {
    if (!reportTarget) return;
    setReportBusy(true);
    try {
      await reportQuestion(reportTarget, reason);
      toast.success('Laporan tersimpan. Terima kasih.');
      setReportTarget(null);
      setReason('');
    } catch {
      toast.error('Isi alasan 5–1000 karakter, lalu coba lagi.');
    } finally {
      setReportBusy(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link href="/history" className="text-sm">
        ← Soal saya
      </Link>
      <Card padding="lg">
        <h1 className="text-xl font-bold">{worksheet.title}</h1>
        <p className="text-sm my-3">
          {questions.length} soal •{' '}
          {worksheet.status === 'generated'
            ? 'Siap dikerjakan'
            : 'Latihan belum tersedia untuk dikerjakan'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => print()}>
            Cetak soal / PDF
          </Button>
          <Button variant="outline" onClick={() => printAnswers()}>
            Cetak kunci
          </Button>
          <Button variant="ghost" onClick={() => setShowAnswers(!showAnswers)}>
            {showAnswers ? 'Sembunyikan kunci' : 'Lihat kunci'}
          </Button>
          {interactive && worksheet.status === 'generated' && (
            <Link href={`/worksheets/${worksheet.id}/attempt`}>
              <Button>Kerjakan / ulangi latihan</Button>
            </Link>
          )}
        </div>
        {!interactive && (
          <p className="text-sm mt-4">
            Sebagian data soal lama belum lengkap. Latihan ini dapat dibaca dan
            dicetak; buat latihan baru untuk penilaian.
          </p>
        )}
      </Card>
      {questions.map((row, i) => (
        <div key={row.id}>
          {hydrated[i] ? (
            <QuestionPreview
              question={hydrated[i]!}
              index={i}
              showAnswer={showAnswers}
            />
          ) : (
            <Card padding="md">
              <MathText content={row.question} />
              {showAnswers && (
                <>
                  <MathText content={row.answer || ''} />
                  <MathText content={row.explanation || ''} />
                </>
              )}
            </Card>
          )}
          <button
            className="text-xs underline mt-2"
            onClick={() => setReportTarget(row.id)}
          >
            Laporkan soal keliru
          </button>
        </div>
      ))}
      {reportTarget && (
        <Card padding="md">
          <label className="text-sm">
            Apa yang perlu diperbaiki?
            <textarea
              className="input-base w-full my-2"
              value={reason}
              maxLength={1000}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <div className="flex gap-3">
            <Button
              isLoading={reportBusy}
              disabled={reason.trim().length < 5}
              onClick={report}
            >
              Kirim laporan
            </Button>
            <Button variant="ghost" onClick={() => setReportTarget(null)}>
              Batal
            </Button>
          </div>
        </Card>
      )}
      <div className="hidden">
        <WorksheetPrintable
          ref={ref}
          worksheet={worksheet}
          questions={questions}
        />
        <WorksheetPrintable
          ref={answerRef}
          worksheet={worksheet}
          questions={questions}
          showAnswers
        />
      </div>
    </div>
  );
}
