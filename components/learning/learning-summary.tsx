'use client';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useChildStore } from '@/lib/stores/child-store';
import type { LearningTopic } from '@/lib/learning/summary';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
const labels = {
  insufficient: 'Data belum cukup',
  mastered: 'Sudah dikuasai',
  practice: 'Perlu latihan',
  developing: 'Sedang berkembang',
};
export function LearningSummary({
  topics,
  unavailable = false,
}: {
  topics: LearningTopic[];
  unavailable?: boolean;
}) {
  const { activeChild } = useChildStore();
  const ref = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({
    contentRef: ref,
    documentTitle: 'Laporan perkembangan Teatch',
  });
  const insights = topics.filter((r) => r.childId === activeChild?.id);
  return (
    <Card padding="lg">
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold">Ringkasan belajar</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => print()}
          disabled={unavailable}
        >
          Cetak laporan
        </Button>
      </div>
      <div ref={ref} className="space-y-4 p-2">
        <h3 className="font-semibold">
          Perkembangan {activeChild?.name || 'anak'}
        </h3>
        <p className="text-sm">
          90 hari terakhir. Ringkasan dihitung dari jawaban yang sudah dinilai
          dengan sistem baru. Data tiap topik dipisahkan menurut kesulitan.
        </p>
        {unavailable ? (
          <p role="status">
            Ringkasan perkembangan belum dapat dimuat. Coba muat ulang halaman.
          </p>
        ) : insights.length === 0 ? (
          <p>
            Belum ada jawaban yang selesai dinilai. Kerjakan latihan atau{' '}
            <Link href="/review" className="underline">
              tinjau jawaban
            </Link>{' '}
            terlebih dahulu.
          </p>
        ) : (
          insights.map((i) => (
            <div
              key={`${i.subjectId}:${i.objectiveId || i.topic}:${i.difficulty}`}
              className="border rounded-lg p-4 break-inside-avoid"
            >
              <div className="flex justify-between gap-3">
                <b>{i.topic}</b>
                <span>{labels[i.status]}</span>
              </div>
              <p className="text-sm">
                {i.subject} • {i.difficulty} • {i.correct}/{i.total} jawaban
                benar ({i.accuracy}%)
              </p>
              <p className="text-sm my-2">
                {i.trend === null
                  ? 'Perubahan lima latihan terakhir: belum cukup data untuk dibandingkan.'
                  : `Perubahan lima latihan terakhir: ${i.trend > 0 ? '+' : ''}${i.trend} poin dibanding lima latihan sebelumnya.`}
              </p>
              <Link
                className="text-sm text-primary-600 underline print:hidden"
                href={`/worksheets/new?subject=${encodeURIComponent(i.subjectId)}&topic=${encodeURIComponent(i.topic)}`}
              >
                Latih lagi topik ini
              </Link>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
