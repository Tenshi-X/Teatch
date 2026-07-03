'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatDate, formatDuration } from '@/lib/utils';
import {
  FileText,
  Clock,
  Trophy,
  PlayCircle,
  History,
} from 'lucide-react';
import Link from 'next/link';
import type { Worksheet, Attempt } from '@/types';

interface HistoryListProps {
  worksheets: (Worksheet & {
    subjects: { name: string; icon: string; color: string } | null;
    children: { name: string } | null;
  })[];
  attempts: Attempt[];
}

export function HistoryList({ worksheets, attempts }: HistoryListProps) {
  const attemptsByWorksheet = attempts.reduce(
    (acc, a) => {
      if (!acc[a.worksheet_id]) acc[a.worksheet_id] = [];
      acc[a.worksheet_id].push(a);
      return acc;
    },
    {} as Record<string, Attempt[]>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Riwayat Belajar</h1>

      {worksheets.length === 0 ? (
        <EmptyState
          icon={<History size={48} />}
          title="Belum ada riwayat"
          description="Mulai buat latihan dan kerjakan soal untuk melihat riwayat belajar."
          action={
            <Link href="/worksheets/new">
              <Button>Buat Latihan Pertama</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3 stagger-children">
          {worksheets.map((ws) => {
            const wsAttempts = attemptsByWorksheet[ws.id] || [];
            const bestAttempt = wsAttempts.sort(
              (a, b) => (b.score || 0) - (a.score || 0)
            )[0];

            return (
              <Card key={ws.id} padding="md" hover>
                <Link
                  href={`/worksheets/${ws.id}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1.5 truncate">
                      {ws.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ws.subjects && (
                        <Badge variant="primary" size="sm">
                          {ws.subjects.icon} {ws.subjects.name}
                        </Badge>
                      )}
                      {ws.children && (
                        <Badge variant="outline" size="sm">
                          {ws.children.name}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          ws.difficulty === 'mudah'
                            ? 'secondary'
                            : ws.difficulty === 'sedang'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {ws.difficulty}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {ws.question_count} soal
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {bestAttempt ? (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Trophy
                            size={14}
                            className={
                              bestAttempt.score && bestAttempt.score >= 80
                                ? 'text-secondary-500'
                                : bestAttempt.score && bestAttempt.score >= 60
                                ? 'text-warning-500'
                                : 'text-danger-500'
                            }
                          />
                          <span className="font-bold">
                            {bestAttempt.score}%
                          </span>
                        </div>
                        {bestAttempt.duration && (
                          <p className="text-xs text-surface-400">
                            {formatDuration(bestAttempt.duration)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" size="sm">
                        Belum dikerjakan
                      </Badge>
                    )}

                    <div className="text-xs text-surface-400">
                      {formatDate(ws.created_at)}
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
