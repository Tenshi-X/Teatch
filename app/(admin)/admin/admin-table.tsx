'use client';

import { useState } from 'react';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import type { AdminProfile } from '@/app/actions/admin';
import { Pencil } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AdminTableProps {
  profiles: AdminProfile[];
}

export function AdminTable({ profiles }: AdminTableProps) {
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = profiles.filter((p) => {
    const search = searchQuery.toLowerCase();
    const email = (p.email || '').toLowerCase();
    const name = (p.full_name || '').toLowerCase();
    return email.includes(search) || name.includes(search);
  });

  const getStatusColor = (status: string, endDate: string | null) => {
    if (status !== 'active') return 'text-error-600 dark:text-error-500';
    if (!endDate) return 'text-primary-600 dark:text-primary-300';
    const end = new Date(endDate);
    if (end < new Date()) return 'text-error-600 dark:text-error-500';
    return 'text-primary-600 dark:text-primary-300';
  };

  const getStatusText = (status: string, endDate: string | null) => {
    if (status !== 'active') return 'KEDALUWARSA';
    if (!endDate) return 'Selamanya';
    const end = new Date(endDate);
    if (end < new Date()) return 'KEDALUWARSA';

    const distance = formatDistanceToNow(end, { locale: id });
    return `${distance} Tersisa`;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[var(--fg)] flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--text-muted)]"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Pemantauan Aktivitas Pengguna
        </h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan email..."
            className="bg-[var(--card-bg)] border border-[var(--card-border)] text-sm text-[var(--fg)] rounded-lg px-4 py-2 focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] placeholder:text-[var(--text-muted)] w-64"
          />
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-subtle)]/50 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <th className="px-6 py-4">Profil Pengguna</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4">Sisa</th>
                <th className="px-6 py-4">Langganan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)]/60 text-sm">
              {filteredProfiles.map((profile) => (
                <tr
                  key={profile.id}
                  className="hover:bg-[var(--surface-subtle)]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--surface-subtle)] flex items-center justify-center text-[var(--text-soft)] font-medium">
                        {(profile.email || profile.full_name || 'U')
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="font-medium text-[var(--text-soft)]">
                        {profile.email || profile.full_name || 'Tanpa Nama'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                        profile.role === 'admin'
                          ? 'bg-[var(--surface-subtle)] text-primary-600 dark:text-primary-300 border-[var(--card-border)]'
                          : 'bg-[var(--surface-subtle)] text-primary-600 dark:text-primary-300 border-[var(--card-border)]'
                      }`}
                    >
                      {profile.role?.toUpperCase() || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--text-soft)]">
                        {profile.worksheet_quota ?? 0} soal
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        sisa dari {profile.quota} batas
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span
                        className={`font-semibold ${getStatusColor(profile.subscription_status, profile.subscription_period_end)}`}
                      >
                        {getStatusText(
                          profile.subscription_status,
                          profile.subscription_period_end
                        )}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] mt-0.5">
                        {profile.subscription_period_end
                          ? `Berakhir: ${format(new Date(profile.subscription_period_end), 'd MMM yyyy, HH:mm', { locale: id })} WIB`
                          : 'Tidak ada batas waktu'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(profile)}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-subtle)] rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
