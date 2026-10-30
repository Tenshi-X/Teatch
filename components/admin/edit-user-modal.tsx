'use client';

import { useState } from 'react';
import { updateAdminUser } from '@/app/actions/admin';
import { Loader2, X } from 'lucide-react';
import type { Profile } from '@/types';
import {
  getTierLimits,
  SUBSCRIPTION_LIMITS,
  formatPlanPrice,
} from '@/lib/subscription';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EditUserModalProps {
  user: Profile;
  onClose: () => void;
}

function localDateTime(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resetQuota, setResetQuota] = useState(false);
  const router = useRouter();

  const [role, setRole] = useState<'admin' | 'user'>(user.role || 'user');
  const [tier, setTier] = useState(user.subscription_tier || 'free_trial');
  const [status, setStatus] = useState(user.subscription_status || 'active');
  const selectedLimit = getTierLimits(tier).maxQuestions;
  const [endDate, setEndDate] = useState(
    user.subscription_period_end
      ? localDateTime(new Date(user.subscription_period_end))
      : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateAdminUser(user.id, {
        role,
        resetQuota,
        subscription_tier: tier,
        subscription_status: status,
        subscription_period_end: endDate
          ? new Date(endDate).toISOString()
          : null,
      });
      toast.success('Pengguna berhasil diperbarui');
      onClose();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal memperbarui pengguna'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-md border border-[var(--card-border)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-[var(--card-border)]">
          <h2 className="text-xl font-semibold text-[var(--fg)]">
            Edit Pengguna
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--fg)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
              Email / Akun
            </label>
            <div className="px-3 py-2 bg-[var(--surface-subtle)]/50 rounded-lg text-[var(--text-muted)] text-sm border border-[var(--card-border)]">
              {user.email || user.full_name || 'Tanpa Nama'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
              Peran (Role)
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
              className="input-base text-sm"
            >
              <option value="user">User Biasa</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
              Paket Berlangganan
            </label>
            <select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value);
                setResetQuota(true);
                setStatus('active');
                setEndDate(localDateTime(new Date(Date.now() + 30 * 86400000)));
              }}
              className="input-base text-sm"
            >
              {Object.entries(SUBSCRIPTION_LIMITS).map(([value, plan]) => (
                <option key={value} value={value}>
                  {plan.label} - {plan.maxQuestions.toLocaleString('id-ID')}{' '}
                  soal - {formatPlanPrice(plan.priceIDR)}/30 hari
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
              Status Berlangganan
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-base text-sm"
            >
              <option value="active">Aktif</option>
              <option value="canceled">Dibatalkan (Canceled)</option>
              <option value="past_due">Kedaluwarsa (Past Due)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-soft)] mb-1.5">
              Tanggal dan jam berakhir (waktu perangkat)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-base text-sm"
            />
            <button
              type="button"
              className="mt-2 text-sm underline"
              onClick={() => {
                setEndDate(localDateTime(new Date(Date.now() + 30 * 86400000)));
                setStatus('active');
                setResetQuota(true);
              }}
            >
              Aktifkan 30 hari dari hari ini dan isi kuota paket
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm text-[var(--text-soft)]">
            <input
              type="checkbox"
              checked={resetQuota}
              onChange={(e) => setResetQuota(e.target.checked)}
            />
            Tetapkan sisa kuota menjadi {selectedLimit} soal
          </label>
          <p className="text-xs text-[var(--text-muted)]">
            Sisa saat ini: {user.worksheet_quota} soal. Jika dicentang, saldo
            diganti menjadi {selectedLimit} soal, bukan ditambahkan. Membuat 10
            soal mengurangi 10 kuota; mengerjakan ulang dan mencetak tidak
            mengurangi kuota.
          </p>
          {user.worksheet_quota > selectedLimit && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Saldo saat ini melebihi alokasi paket yang dipilih. Periksa apakah
              ini saldo lama atau tambahan yang disengaja. Centang penetapan
              kuota untuk menyesuaikannya dengan paket.
            </p>
          )}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--text-soft)] hover:text-[var(--fg)] bg-transparent transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium action-primary rounded-lg transition-all flex items-center gap-2"
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
