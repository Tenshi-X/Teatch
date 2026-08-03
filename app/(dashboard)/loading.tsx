import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="fixed inset-0 z-[100] bg-surface-950/20 dark:bg-surface-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center animate-fade-in">
      <div className="bg-[var(--card-bg)] p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-[var(--card-border)]">
        <div className="w-10 h-10 relative flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-surface-200 dark:border-surface-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
          <Loader2 className="w-4 h-4 text-primary-500 animate-pulse" />
        </div>
        <p className="text-surface-600 dark:text-surface-300 font-medium text-sm animate-pulse">
          Memuat data...
        </p>
      </div>
    </div>
  );
}
