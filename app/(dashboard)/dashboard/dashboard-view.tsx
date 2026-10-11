'use client';

import { useChildStore } from '@/lib/stores/child-store';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ProgressRing } from '@/components/dashboard/progress-ring';
import { QuickActions } from '@/components/dashboard/quick-actions';

import { Card } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { calculateAge } from '@/lib/utils';
import {
  FileText,
  Target,
  Trophy,
  TrendingUp,
  BookOpen,
  Users,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import type { RecentActivity, DashboardStats } from '@/types';

export function DashboardView({
  byChild,
}: {
  byChild: Record<
    string,
    { stats: DashboardStats; activities: RecentActivity[] }
  >;
}) {
  const { activeChild, children } = useChildStore();
  const { stats, activities } = byChild[activeChild?.id || ''] || {
    stats: {
      totalWorksheets: 0,
      totalAttempts: 0,
      averageScore: 0,
      totalQuestions: 0,
    },
    activities: [],
  };

  if (children.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Card padding="lg" className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 border border-primary-200 dark:bg-primary-900/20 dark:border-primary-800/50 mb-6">
            <Sparkles className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            Selamat Datang di Teatch! 🎉
          </h2>
          <p className="text-surface-400 mb-6 max-w-md mx-auto">
            Mulai perjalanan belajar anak Anda dengan menambahkan profil anak
            terlebih dahulu.
          </p>
          <Link href="/children/new">
            <Button size="lg">
              <Users size={20} />
              Tambah Profil Anak
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome banner */}
      {activeChild && (
        <Card
          padding="lg"
          className="relative overflow-hidden bg-primary-50/50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/30"
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar
              src={activeChild.photo_url}
              name={activeChild.name}
              size="xl"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                Halo, {activeChild.name}! 👋
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="md">
                  {activeChild.level}
                </Badge>
                {activeChild.grade && (
                  <Badge variant="outline" size="md">
                    {activeChild.grade}
                  </Badge>
                )}
                <Badge variant="outline" size="md">
                  {calculateAge(activeChild.birth_date)} tahun
                </Badge>
              </div>
            </div>
            <Link href="/worksheets/new">
              <Button variant="primary" size="lg" className="shrink-0">
                <BookOpen size={18} />
                Mulai Belajar
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Latihan"
          value={stats.totalWorksheets}
          icon={<FileText size={22} />}
          color="#4F46E5"
          subtitle="draf dan latihan"
        />
        <StatsCard
          title="Soal Dikerjakan"
          value={stats.totalQuestions}
          icon={<Target size={22} />}
          color="#22C55E"
          subtitle="soal total"
        />
        <StatsCard
          title="Rata-rata Skor"
          value={stats.totalAttempts > 0 ? `${stats.averageScore}%` : '-'}
          icon={<Trophy size={22} />}
          color="#F59E0B"
          subtitle="nilai sistem baru"
        />
        <StatsCard
          title="Latihan Selesai"
          value={stats.totalAttempts}
          icon={<TrendingUp size={22} />}
          color="#8B5CF6"
          subtitle="selesai dinilai"
        />
      </div>

      <p className="text-sm text-surface-500">
        Ringkasan nilai hanya memakai hasil sistem baru yang sudah selesai
        ditinjau.{' '}
        <Link className="underline" href="/review">
          Tinjau jawaban
        </Link>{' '}
        atau{' '}
        <Link className="underline" href="/statistics">
          lihat perkembangan per topik
        </Link>
        .
      </p>
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress */}
        <Card padding="md" className="lg:col-span-1">
          <h3 className="text-base font-semibold mb-4">Progress Belajar</h3>
          <div className="flex justify-center py-4">
            <ProgressRing
              value={stats.averageScore}
              color="#4F46E5"
              label="Nilai rata-rata"
            />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card padding="md" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Aktivitas Terakhir</h3>
            {activities.length > 0 && (
              <Link
                href="/history"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Lihat semua
              </Link>
            )}
          </div>
          <ActivityFeed activities={activities} />
        </Card>
      </div>
    </div>
  );
}
