import Link from 'next/link';
import Image from 'next/image';

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--card-border)]">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden relative shadow-sm border border-[var(--card-border)]">
              <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight text-surface-900 dark:text-white">
              Teatch
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-sm text-surface-500 mb-10">Terakhir diperbarui: {updated}</p>

        <div className="space-y-8 text-surface-600 dark:text-surface-300 text-[15px] leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-surface-900 dark:[&_h2]:text-white [&_h2]:mb-3 [&_h2]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:font-semibold [&_strong]:text-surface-800 dark:[&_strong]:text-surface-200">
          {children}
        </div>
      </main>

      <footer className="border-t border-[var(--card-border)] py-8 px-6 text-center bg-surface-50 dark:bg-surface-900/50">
        <p className="text-xs text-surface-400">
          © {new Date().getFullYear()} Trenova Intelligence. Seluruh hak cipta dilindungi.{' '}
          <Link href="/" className="hover:text-surface-600 dark:hover:text-surface-300">
            Kembali ke beranda
          </Link>
        </p>
      </footer>
    </div>
  );
}
