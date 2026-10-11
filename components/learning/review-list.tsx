'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { reviewAnswer } from '@/app/actions/attempts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MathText } from '@/components/ui/math-text';
import { toast } from 'sonner';
export interface ReviewItem {
  id: string;
  childName: string;
  question: string;
  story?: string;
  rubric?: string[];
  userAnswer: string;
  expected: string;
  explanation: string;
}
export function ReviewList({ items }: { items: ReviewItem[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();
  const grade = async (id: string, correct: boolean) => {
    setBusy(id);
    try {
      await reviewAnswer(id, correct);
      toast.success('Penilaian tersimpan.');
      router.refresh();
    } catch {
      toast.error('Penilaian belum tersimpan.');
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold">Tinjau jawaban</h1>
      <p>
        Nilai isi jawaban berdasarkan contoh dan panduan. Jawaban tidak harus
        sama persis jika maknanya sesuai.
      </p>
      {!items.length && <Card padding="lg">Semua jawaban sudah ditinjau.</Card>}
      {items.map((i) => (
        <Card key={i.id} padding="lg">
          <b>{i.childName}</b>
          <div className="space-y-3 my-4">
            {i.story && (
              <p className="border rounded p-3 whitespace-pre-wrap">
                {i.story}
              </p>
            )}
            <MathText content={i.question} />
            <p className="text-sm font-semibold">Jawaban anak</p>
            <MathText content={i.userAnswer} />
            <p className="text-sm font-semibold">Contoh jawaban</p>
            <MathText content={i.expected} />
            <p className="text-sm font-semibold">Panduan penilaian</p>
            <MathText content={i.explanation} />
            {i.rubric && (
              <ul className="list-disc pl-5">
                {i.rubric.map((r, j) => (
                  <li key={j}>{r}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              disabled={busy !== null}
              isLoading={busy === i.id}
              onClick={() => grade(i.id, true)}
            >
              Isi jawaban sesuai
            </Button>
            <Button
              disabled={busy !== null}
              variant="outline"
              onClick={() => grade(i.id, false)}
            >
              Perlu diperbaiki
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
