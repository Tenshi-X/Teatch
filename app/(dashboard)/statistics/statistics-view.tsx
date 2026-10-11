'use client';
import { Card } from '@/components/ui/card';
import { useChildStore } from '@/lib/stores/child-store';
import type { Attempt } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
interface Props {
  attempts: (Attempt & {
    worksheets: {
      title: string;
      subjects: { name: string; icon: string | null } | null;
    } | null;
  })[];
}
export function StatisticsView({ attempts }: Props) {
  const { activeChild } = useChildStore();
  const rows = attempts.filter((a) => a.child_id === activeChild?.id);
  const trusted = rows.filter(
    (a) => a.scoring_version === 2 && a.status === 'completed'
  );
  const chart = trusted
    .slice(0, 15)
    .reverse()
    .map((a, i) => ({
      name: `${i + 1}`,
      score: a.score,
      title: a.worksheets?.title,
    }));
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="font-bold mb-2">Nilai latihan terbaru</h2>
        <p className="text-sm mb-4">
          Grafik memuat sampai 15 latihan yang dinilai dengan sistem baru.
        </p>
        {chart.length ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Nilai']} />
                <Area
                  dataKey="score"
                  stroke="var(--color-primary-500)"
                  fill="var(--color-primary-500)"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p>Belum ada nilai akhir dari sistem baru.</p>
        )}
      </Card>
      <Card padding="lg">
        <h2 className="font-bold mb-3">Riwayat 100 latihan terakhir</h2>
        <div className="space-y-3">
          {rows.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap justify-between gap-2 border-b pb-3"
            >
              <div>
                <Link
                  className="underline"
                  href={`/worksheets/${a.worksheet_id}`}
                >
                  {a.worksheets?.title || 'Latihan'}
                </Link>
                <p className="text-xs">
                  {formatDate(a.created_at)} • {a.worksheets?.subjects?.name}
                </p>
              </div>
              <div>
                {a.status === 'pending_review' ? (
                  <Link href="/review" className="underline">
                    Menunggu tinjauan
                  </Link>
                ) : (
                  <span>
                    {a.score === null ? 'Belum dinilai' : `${a.score}%`}
                  </span>
                )}
                {a.scoring_version === 1 && (
                  <p className="text-xs text-amber-600">
                    Hasil sistem lama — tidak masuk ringkasan belajar
                  </p>
                )}
              </div>
            </div>
          ))}
          {!rows.length && <p>Belum ada latihan untuk anak yang dipilih.</p>}
        </div>
      </Card>
    </div>
  );
}
