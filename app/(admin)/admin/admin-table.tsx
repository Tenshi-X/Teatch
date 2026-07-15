'use client';

import { useState } from 'react';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { id } from 'date-fns/locale';

interface AdminTableProps {
  profiles: any[];
}

export function AdminTable({ profiles }: AdminTableProps) {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProfiles = profiles.filter(p => {
    const search = searchQuery.toLowerCase();
    const email = (p.email || '').toLowerCase();
    const name = (p.full_name || '').toLowerCase();
    return email.includes(search) || name.includes(search);
  });

  const getStatusColor = (status: string, endDate: string | null) => {
    if (status !== 'active') return 'text-red-500';
    if (!endDate) return 'text-emerald-400';
    const end = new Date(endDate);
    if (end < new Date()) return 'text-red-500';
    return 'text-emerald-400';
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
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          Pemantauan Aktivitas Pengguna
        </h2>
        <div className="flex gap-4">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan email..."
            className="bg-[#1E293B] border border-slate-700 text-sm text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-500 w-64"
          />
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Profil Pengguna</th>
                <th className="px-6 py-4">Peran</th>
                <th className="px-6 py-4">Sisa</th>
                <th className="px-6 py-4">Langganan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-medium">
                        {(profile.email || profile.full_name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-200">
                        {profile.email || profile.full_name || 'Tanpa Nama'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                      profile.role === 'admin' 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {profile.role?.toUpperCase() || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">{profile.usage} req</span>
                      <span className="text-xs text-slate-500">{profile.quota} dari batas</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`font-semibold ${getStatusColor(profile.subscription_status, profile.subscription_period_end)}`}>
                        {getStatusText(profile.subscription_status, profile.subscription_period_end)}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
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
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all">
                        <Trash2 size={16} />
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
