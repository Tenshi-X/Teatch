'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { BarChart3, TrendingUp, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Attempt } from '@/types';

interface StatisticsViewProps {
  attempts: (Attempt & {
    worksheets: {
      title: string;
      subjects: { name: string; icon: string } | null;
    } | null;
  })[];
}

export function StatisticsView({ attempts }: StatisticsViewProps) {
  if (attempts.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={48} />}
        title="Belum ada data statistik"
        description="Kerjakan latihan terlebih dahulu untuk melihat statistik perkembangan."
        action={
          <Link href="/worksheets/new">
            <Button>Buat Latihan</Button>
          </Link>
        }
      />
    );
  }

  // Calculate statistics
  const totalAttempts = attempts.length;
  const avgScore =
    attempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts;
  const totalCorrect = attempts.reduce((sum, a) => sum + a.correct_answers, 0);
  const totalQuestions = attempts.reduce(
    (sum, a) => sum + a.total_questions,
    0
  );

  // Subject performance
  const subjectStats: Record<
    string,
    { name: string; icon: string; total: number; sumScore: number }
  > = {};
  for (const a of attempts) {
    const subject = a.worksheets?.subjects;
    if (!subject) continue;
    if (!subjectStats[subject.name]) {
      subjectStats[subject.name] = {
        name: subject.name,
        icon: subject.icon,
        total: 0,
        sumScore: 0,
      };
    }
    subjectStats[subject.name].total++;
    subjectStats[subject.name].sumScore += a.score || 0;
  }

  const subjectList = Object.values(subjectStats)
    .map((s) => ({
      ...s,
      avgScore: Math.round(s.sumScore / s.total),
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  const bestSubject = subjectList[0];
  const worstSubject = subjectList[subjectList.length - 1];

  // Recent scores (last 10)
  const recentScores = attempts.slice(0, 10).reverse();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md" className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
            <BarChart3 size={24} className="text-primary-600" />
          </div>
          <p className="text-2xl font-bold">{totalAttempts}</p>
          <p className="text-xs text-surface-400">Latihan Selesai</p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} className="text-secondary-600" />
          </div>
          <p className="text-2xl font-bold">{Math.round(avgScore)}%</p>
          <p className="text-xs text-surface-400">Rata-rata Skor</p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-500/20 flex items-center justify-center mx-auto mb-3">
            <Award size={24} className="text-warning-600" />
          </div>
          <p className="text-2xl font-bold">{totalCorrect}</p>
          <p className="text-xs text-surface-400">Jawaban Benar</p>
        </Card>

        <Card padding="md" className="text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
            <BookOpen size={24} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{totalQuestions}</p>
          <p className="text-xs text-surface-400">Total Soal</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Score Ring */}
        <Card padding="lg">
          <h3 className="text-base font-semibold mb-4">Nilai Rata-rata</h3>
          <div className="flex justify-center py-4">
            <ProgressRing
              value={avgScore}
              size={160}
              strokeWidth={14}
              color={
                avgScore >= 80
                  ? '#22C55E'
                  : avgScore >= 60
                  ? '#F59E0B'
                  : '#EF4444'
              }
              label="Rata-rata keseluruhan"
            />
          </div>
        </Card>

        {/* Subject Performance */}
        <Card padding="lg">
          <h3 className="text-base font-semibold mb-4">
            Performa per Mata Pelajaran
          </h3>
          {subjectList.length === 0 ? (
            <p className="text-sm text-surface-400">Belum ada data.</p>
          ) : (
            <div className="space-y-3">
              {subjectList.map((subj) => (
                <div key={subj.name} className="flex items-center gap-3">
                  <span className="text-lg">{subj.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {subj.name}
                      </span>
                      <span className="text-sm font-bold">{subj.avgScore}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${subj.avgScore}%`,
                          background:
                            subj.avgScore >= 80
                              ? '#22C55E'
                              : subj.avgScore >= 60
                              ? '#F59E0B'
                              : '#EF4444',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Best & Worst */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {bestSubject && (
          <Card padding="md" variant="gradient">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center text-2xl">
                {bestSubject.icon}
              </div>
              <div>
                <p className="text-xs text-surface-400 mb-0.5">
                  ⭐ Mata Pelajaran Terbaik
                </p>
                <p className="font-semibold">{bestSubject.name}</p>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 font-bold">
                  {bestSubject.avgScore}% rata-rata
                </p>
              </div>
            </div>
          </Card>
        )}

        {worstSubject && subjectList.length > 1 && (
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-500/20 flex items-center justify-center text-2xl">
                {worstSubject.icon}
              </div>
              <div>
                <p className="text-xs text-surface-400 mb-0.5">
                  📈 Perlu Ditingkatkan
                </p>
                <p className="font-semibold">{worstSubject.name}</p>
                <p className="text-sm text-warning-600 dark:text-warning-500 font-bold">
                  {worstSubject.avgScore}% rata-rata
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Scores */}
      <Card padding="lg">
        <h3 className="text-base font-semibold mb-4">Skor Terakhir</h3>
        <div className="flex items-end gap-2 h-32">
          {recentScores.map((a, i) => {
            const height = Math.max(8, ((a.score || 0) / 100) * 100);
            return (
              <div
                key={a.id}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-surface-400 font-medium">
                  {a.score}%
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${height}%`,
                    background:
                      (a.score || 0) >= 80
                        ? '#22C55E'
                        : (a.score || 0) >= 60
                        ? '#F59E0B'
                        : '#EF4444',
                  }}
                />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
