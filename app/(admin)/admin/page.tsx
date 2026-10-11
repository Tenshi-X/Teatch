import { getAdminDashboardData } from '@/app/actions/admin';
import { AdminTable } from './admin-table';
import { QuestionReports } from '@/components/admin/question-reports';
import { QuotaMonitor } from '@/components/admin/quota-monitor';
import { Activity, Users, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | Teatch',
};

export default async function AdminPage() {
  const { profiles, metrics, reports, quotaAudit } =
    await getAdminDashboardData();

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
      <div className="space-y-4">
        <AdminTable profiles={profiles} />
      </div>
    </div>
  );
}
