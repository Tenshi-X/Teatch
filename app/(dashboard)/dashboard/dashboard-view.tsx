'use client';

import Link from 'next/link';
import { ArrowRight, BookOpen, ClipboardCheck, Users } from 'lucide-react';
import { useChildStore } from '@/lib/stores/child-store';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { buildInsights } from '@/lib/learning/insights';
import type { RecentActivity, DashboardStats } from '@/types';

export interface DashboardChildData {
  stats: DashboardStats;
  activities: RecentActivity[];
  pendingReviews: number;
  latestWorksheet: { id: string; title: string } | null;
  topics: ReturnType<typeof buildInsights>;
}

export function DashboardView({
  byChild,
}: {
  byChild: Record<string, DashboardChildData>;
}) {
  const { activeChild, children } = useChildStore();
  const data = byChild[activeChild?.id || ''];

  if (!children.length)
    return (
      <section className="mx-auto max-w-2xl py-10 sm:py-16">
        <p className="learning-eyebrow">Belajar bersama Teatch</p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
          Mulai dari mengenal anak.
        </h1>
        <p className="mt-4 text-lg text-[var(--text-muted)]">
          Tambahkan profil anak untuk menyiapkan latihan sesuai kelas dan materi
          yang ingin dipelajari.
        </p>
        <Link
          href="/children/new"
          className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-button)] bg-motivation-500 px-5 py-3 font-semibold text-surface-900 hover:bg-motivation-600"
        >
          <Users size={18} aria-hidden="true" /> Tambah profil anak
        </Link>
        <ol className="mt-10 grid gap-5 border-t border-[var(--card-border)] pt-6 sm:grid-cols-3">
          {[
            'Pilih materi belajar',
            'Siapkan dan periksa soal',
            'Lihat perkembangan',
          ].map((label, index) => (
            <li key={label}>
              <span className="learning-eyebrow">0{index + 1}</span>
              <p className="mt-1 font-medium">{label}</p>
            </li>
          ))}
        </ol>
      </section>
    );

  if (!activeChild || !data)
    return <p role="status">Menyiapkan ringkasan belajar…</p>;
  const { stats, activities, pendingReviews, latestWorksheet, topics } = data;
  const metrics = [
    {
      label: 'Latihan tersedia',
      value: stats.totalWorksheets,
      detail: 'termasuk draf',
    },
    {
      label: 'Latihan dinilai',
      value: stats.totalAttempts,
      detail: 'selesai ditinjau',
    },
    {
      label: 'Soal dinilai',
      value: stats.totalQuestions,
      detail: 'dari latihan yang selesai',
    },
    {
      label: 'Rata-rata nilai',
      value: stats.totalAttempts ? `${stats.averageScore}%` : '—',
      detail: 'dari latihan yang selesai',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[var(--card-border)] pb-6">
        <div className="min-w-0">
          <p className="learning-eyebrow">Ruang belajar keluarga</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            Belajar bersama {activeChild.name}
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Siapkan latihan, dampingi prosesnya, dan lihat perkembangannya.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar
            src={activeChild.photo_url}
            name={activeChild.name}
            size="lg"
          />
          <div>
            <p className="font-semibold">{activeChild.name}</p>
            <p className="text-sm text-[var(--text-muted)]">
              {activeChild.level}
              {activeChild.grade ? ` · ${activeChild.grade}` : ''}
            </p>
          </div>
        </div>
      </header>

      <section
        aria-label="Langkah berikutnya"
        className="grid gap-5 lg:grid-cols-[1.5fr_1fr]"
      >
        <div className="card p-5 sm:p-7">
          <p className="learning-eyebrow">Latihan berikutnya</p>
          <h2 className="mt-3 text-2xl font-semibold">
            {latestWorksheet
              ? latestWorksheet.title
              : 'Apa yang ingin dipelajari hari ini?'}
          </h2>
          <p className="mt-2 text-[var(--text-muted)]">
            {latestWorksheet
              ? 'Latihan terbaru siap dibuka. Periksa soal atau mulai mengerjakannya bersama anak.'
              : 'Pilih materi dan siapkan latihan pertama untuk anak.'}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={
                latestWorksheet
                  ? `/worksheets/${latestWorksheet.id}`
                  : '/worksheets/new'
              }
              className="inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-button)] bg-motivation-500 px-5 py-3 font-semibold text-surface-900 hover:bg-motivation-600"
            >
              <BookOpen size={18} aria-hidden="true" />
              {latestWorksheet ? 'Buka latihan' : 'Buat latihan'}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            {latestWorksheet && (
              <Link
                href="/worksheets/new"
                className="text-sm font-semibold text-primary-700 dark:text-primary-200 underline underline-offset-4"
              >
                Buat latihan baru
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-[var(--radius-card)] bg-learning-50 p-5 sm:p-7 text-surface-900 dark:bg-surface-800 dark:text-surface-50">
          <div>
            <ClipboardCheck size={24} aria-hidden="true" />
            <h2 className="mt-3 text-xl font-semibold">
              {pendingReviews
                ? `${pendingReviews} latihan menunggu tinjauan`
                : 'Temani setiap langkah belajar'}
            </h2>
            <p className="mt-2 text-sm">
              {pendingReviews
                ? 'Periksa jawaban yang perlu dinilai agar laporan perkembangan dapat diperbarui.'
                : 'Periksa draf sebelum digunakan. Jawaban uraian membutuhkan tinjauan orang tua.'}
            </p>
          </div>
          <Link
            href="/review"
            className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
          >
            Tinjau jawaban
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-lg font-semibold">
          Catatan belajar
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 border-y border-[var(--card-border)] py-5 sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-sm text-[var(--text-muted)]">
                {metric.label}
              </dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">
                {metric.value}
              </dd>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {metric.detail}
              </p>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="topics-title">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="topics-title" className="text-xl font-semibold">
              Materi untuk dilatih lagi
            </h2>
            <Link
              href="/statistics"
              className="text-sm font-medium underline underline-offset-4"
            >
              Lihat perkembangan
            </Link>
          </div>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Berdasarkan jawaban yang sudah dinilai dalam 90 hari terakhir.
          </p>
          {topics.length ? (
            <ul className="mt-4 divide-y divide-[var(--card-border)]">
              {topics.map((topic) => (
                <li
                  key={`${topic.subjectId}:${topic.objectiveId || topic.topic}:${topic.difficulty}`}
                  className="py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{topic.topic}</h3>
                    <Badge variant="outline">
                      {topic.status === 'practice'
                        ? 'Perlu latihan'
                        : 'Sedang berkembang'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {topic.subject} · {topic.difficulty} · {topic.correct} dari{' '}
                    {topic.total} jawaban benar
                  </p>
                  <Link
                    href={`/worksheets/new?subject=${encodeURIComponent(topic.subjectId)}&topic=${encodeURIComponent(topic.topic)}`}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-700 dark:text-primary-200"
                  >
                    Latih topik ini
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 border-l-2 border-primary-300 pl-4">
              <p className="font-medium">
                {stats.totalAttempts
                  ? 'Belum ada topik yang perlu ditampilkan.'
                  : 'Catatan perkembangan akan tumbuh bersama latihan.'}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Setelah cukup jawaban dinilai, materi yang masih perlu dilatih
                akan muncul di sini.
              </p>
            </div>
          )}
        </section>
        <section aria-labelledby="activity-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="activity-title" className="text-xl font-semibold">
              Aktivitas terakhir
            </h2>
            <Link
              href="/history"
              className="text-sm font-medium underline underline-offset-4"
            >
              Riwayat
            </Link>
          </div>
          <div className="mt-4">
            <ActivityFeed activities={activities} />
          </div>
        </section>
      </div>
      <QuickActions />
    </div>
  );
}
