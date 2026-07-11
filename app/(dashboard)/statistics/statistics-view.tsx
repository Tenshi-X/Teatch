'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { BarChart3, TrendingUp, Award, BookOpen, SearchX } from 'lucide-react';
import Link from 'next/link';
import type { Attempt } from '@/types';
import { useChildStore } from '@/lib/stores/child-store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDate } from '@/lib/utils';

interface StatisticsViewProps {
  attempts: (Attempt & {
    worksheets: {
      title: string;
      subjects: { name: string; icon: string } | null;
    } | null;
  })[];
}

export function StatisticsView({ attempts }: StatisticsViewProps) {
  const { activeChild } = useChildStore();

  const childAttempts = activeChild
    ? attempts.filter((a) => a.child_id === activeChild.id)
    : [];

  if (!activeChild) {
    return (
      <EmptyState
        icon={<SearchX size={48} />}
        title="Pilih Anak"
        description="Silakan pilih profil anak di atas untuk melihat statistik perkembangannya."
      />
    );
  }

  if (childAttempts.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={48} />}
        title="Belum ada data statistik"
        description={`Kerjakan latihan terlebih dahulu untuk melihat statistik perkembangan ${activeChild.name}.`}
        action={
          <Link href="/worksheets/new">
            <Button>Buat Latihan</Button>
          </Link>
        }
      />
    );
  }

  // Calculate statistics
  const totalAttempts = childAttempts.length;
  const avgScore =
    childAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / totalAttempts;
  const totalCorrect = childAttempts.reduce((sum, a) => sum + a.correct_answers, 0);
  const totalQuestions = childAttempts.reduce(
    (sum, a) => sum + a.total_questions,
    0
  );

  // Subject performance
  const subjectStats: Record<
    string,
    { name: string; icon: string; total: number; sumScore: number }
  > = {};
  for (const a of childAttempts) {
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

  // Recent scores for Chart (last 15, chronological)
  const chartData = childAttempts
    .slice(0, 15)
    .reverse()
    .map((a, index) => ({
      name: `Lat. ${index + 1}`,
      date: formatDate(a.created_at),
      score: a.score || 0,
      title: a.worksheets?.title || 'Latihan',
    }));

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

      {/* Progress Chart */}
      <Card padding="lg">
        <h3 className="text-base font-semibold mb-6">Grafik Perkembangan Nilai</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                itemStyle={{ color: '#14B8A6' }}
                labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
                formatter={(value: number) => [`${value}%`, 'Skor']}
                labelFormatter={(label, payload) => {
                  if (payload && payload.length > 0) {
                    return payload[0].payload.title;
                  }
                  return label;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#14B8A6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorScore)"
                activeDot={{ r: 6, fill: '#14B8A6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
