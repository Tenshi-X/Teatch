import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: string;
}

export function StatsCard({ title, value, subtitle, icon, trend, color }: StatsCardProps) {
  return (
    <div className="card p-5 relative overflow-hidden group">
      {/* Background gradient accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm text-surface-400 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-surface-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.value >= 0 ? 'text-secondary-500' : 'text-danger-500'
                )}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-surface-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
