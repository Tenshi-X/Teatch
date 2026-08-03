import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4 animate-fade-in w-full">
      <div className="w-12 h-12 relative flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-surface-200 dark:border-surface-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        <Loader2 className="w-4 h-4 text-primary-500 animate-pulse" />
      </div>
      <p className="text-surface-500 font-medium animate-pulse text-sm">Memuat halaman...</p>
    </div>
  );
}
