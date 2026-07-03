import Link from 'next/link';
import { PenTool, Users, BarChart3, History } from 'lucide-react';

const actions = [
  {
    href: '/worksheets/new',
    label: 'Buat Latihan',
    description: 'Generate soal dengan AI',
    icon: PenTool,
    color: '#4F46E5',
    gradient: 'from-primary-500 to-primary-700',
  },
  {
    href: '/children',
    label: 'Anak Saya',
    description: 'Kelola profil anak',
    icon: Users,
    color: '#22C55E',
    gradient: 'from-secondary-500 to-secondary-700',
  },
  {
    href: '/statistics',
    label: 'Statistik',
    description: 'Lihat perkembangan',
    icon: BarChart3,
    color: '#F59E0B',
    gradient: 'from-warning-500 to-warning-600',
  },
  {
    href: '/history',
    label: 'Riwayat',
    description: 'Lihat latihan sebelumnya',
    icon: History,
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-purple-700',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="card p-4 group hover:scale-[1.03] transition-all duration-200 hover:shadow-lg"
        >
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow`}
          >
            <action.icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-semibold mb-0.5">{action.label}</p>
          <p className="text-xs text-surface-400">{action.description}</p>
        </Link>
      ))}
    </div>
  );
}
