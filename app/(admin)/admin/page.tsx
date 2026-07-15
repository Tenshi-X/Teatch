import { getAdminDashboardData } from '@/app/actions/admin';
import { AdminTable } from './admin-table';
import { Activity, Users, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | Teatch',
};

export default async function AdminPage() {
  const { profiles, metrics } = await getAdminDashboardData();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Users */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={64} className="text-blue-500" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Users size={24} className="text-blue-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total Pengguna
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-white mb-1">{metrics.totalUsers}</h3>
            <p className="text-sm text-slate-500">Akun Terdaftar</p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={64} className="text-emerald-500" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <ShieldCheck size={24} className="text-emerald-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Langganan Aktif
            </span>
          </div>
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-white mb-1">{metrics.activeSubscriptions}</h3>
            <p className="text-sm text-slate-500">Premium / Aktif</p>
          </div>
        </div>

        {/* Total Usage */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-800 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={64} className="text-purple-500" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Activity size={24} className="text-purple-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total Permintaan
            </span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-4xl font-bold text-white">{metrics.totalUsage}</h3>
              <span className="text-lg text-slate-400">/ {metrics.totalQuota}</span>
            </div>
            <p className="text-sm text-slate-500">Terpakai / Total Kuota Bulan Ini</p>
          </div>
        </div>

      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <AdminTable profiles={profiles} />
      </div>

    </div>
  );
}
