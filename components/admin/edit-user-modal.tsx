'use client';

import { useState } from 'react';
import { updateAdminUser } from '@/app/actions/admin';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface EditUserModalProps {
  user: any;
  onClose: () => void;
}

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [role, setRole] = useState<'admin' | 'user'>(user.role || 'user');
  const [tier, setTier] = useState(user.subscription_tier || 'free_trial');
  const [status, setStatus] = useState(user.subscription_status || 'active');
  const [endDate, setEndDate] = useState(
    user.subscription_period_end 
      ? new Date(user.subscription_period_end).toISOString().split('T')[0]
      : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateAdminUser(user.id, {
        role,
        subscription_tier: tier,
        subscription_status: status,
        subscription_period_end: endDate ? new Date(endDate).toISOString() : null,
      });
      toast.success('Pengguna berhasil diperbarui');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold text-white">Edit Pengguna</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email / Akun</label>
            <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-slate-400 text-sm border border-slate-700">
              {user.email || user.full_name || 'Tanpa Nama'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Peran (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User Biasa</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Paket Berlangganan</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="free_trial">Free Trial</option>
              <option value="basic">Basic</option>
              <option value="family">Family</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Status Berlangganan</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Aktif</option>
              <option value="canceled">Dibatalkan (Canceled)</option>
              <option value="past_due">Kedaluwarsa (Past Due)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tanggal Berakhir (Masa Aktif)</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
