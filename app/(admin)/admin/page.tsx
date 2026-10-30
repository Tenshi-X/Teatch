import { getAdminDashboardData } from '@/app/actions/admin';
import { AdminTable } from './admin-table';
import { QuestionReports } from '@/components/admin/question-reports';
import { QuotaMonitor } from '@/components/admin/quota-monitor';
import { Activity, Users, ShieldCheck } from 'lucide-react';
import { ProductFeedback } from '@/components/admin/product-feedback';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | Teatch',
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const query = await searchParams;
  const page = Math.min(
    100000,
    Math.max(0, Number.parseInt(query.page || '0', 10) || 0)
  );
  const search = (query.q || '').slice(0, 100);
  const { profiles, metrics, reports, quotaAudit, feedback, matchedUsers } =
    await getAdminDashboardData(page, search);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users
              size={64}
              className="text-primary-600 dark:text-primary-300"
            />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-[var(--surface-subtle)] rounded-xl">
              <Users
                size={24}
                className="text-primary-600 dark:text-primary-300"
              />
            </div>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Total Pengguna
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-[var(--fg)] mb-1">
              {metrics.totalUsers}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">Akun Terdaftar</p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck
              size={64}
              className="text-primary-600 dark:text-primary-300"
            />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-[var(--surface-subtle)] rounded-xl">
              <ShieldCheck
                size={24}
                className="text-primary-600 dark:text-primary-300"
              />
            </div>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Langganan Aktif
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-[var(--fg)] mb-1">
              {metrics.activeSubscriptions}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">Premium / Aktif</p>
          </div>
        </div>

        {/* Total Usage */}
        <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity
              size={64}
              className="text-primary-600 dark:text-primary-300"
            />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-[var(--surface-subtle)] rounded-xl">
              <Activity
                size={24}
                className="text-primary-600 dark:text-primary-300"
              />
            </div>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
              Soal Digunakan
            </span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-4xl font-bold text-[var(--fg)]">
                {metrics.totalUsage}
              </h3>
              <span className="text-lg text-[var(--text-muted)]">
                / {metrics.totalQuota}
              </span>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Terpakai / Total Kuota Bulan Ini
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <p className="text-sm text-[var(--text-muted)]">
        Bulan ini: {metrics.failed} generasi gagal • {metrics.reserved}{' '}
        reservasi aktif • {metrics.tokens.toLocaleString('id-ID')} token.
        Kegagalan tidak mengurangi kuota pengguna.
      </p>
      <QuestionReports reports={reports} />
      <QuotaMonitor audit={quotaAudit} />
      <p className="text-sm">
        Akun aktif 7 hari: {metrics.activeParents7d} · Masukan terbuka:{' '}
        {metrics.feedbackOpen}. Kunjungan adalah sinyal perangkat; hasil latihan
        tetap berasal dari database.
      </p>
      <ProductFeedback items={feedback} />
      <div className="space-y-4">
        <form className="flex flex-wrap gap-2" action="/admin">
          <input
            name="q"
            defaultValue={search}
            maxLength={100}
            aria-label="Cari seluruh pengguna"
            placeholder="Cari nama atau email"
            className="input-base"
          />
          <button className="rounded-lg border px-4 py-2">
            Cari semua akun
          </button>
        </form>
        <AdminTable profiles={profiles} />
        <nav className="flex gap-4 text-sm" aria-label="Halaman pengguna">
          {page > 0 && (
            <Link
              className="underline"
              href={`/admin?page=${page - 1}&q=${encodeURIComponent(search)}`}
            >
              Sebelumnya
            </Link>
          )}
          <span>
            Halaman {page + 1} · {matchedUsers} akun sesuai pencarian
          </span>
          {(page + 1) * 50 < matchedUsers && (
            <Link
              className="underline"
              href={`/admin?page=${page + 1}&q=${encodeURIComponent(search)}`}
            >
              Berikutnya
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
