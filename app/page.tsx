import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Sparkles,
  Brain,
  BarChart3,
  FileText,
  Users,
  ArrowRight,
  CheckCircle,
  Puzzle,
  Image as ImageIcon,
  Laptop,
  Target
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'Tutor Pribadi AI',
      description: 'Soal otomatis menyesuaikan usia, kelas, dan topik spesifik yang sedang dipelajari anak.',
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: Puzzle,
      title: '18+ Variasi Tipe Soal',
      description: 'Tidak membosankan! Ada tebak gambar, susun kata, menjodohkan, hingga cerita pendek.',
      gradient: 'from-secondary-500 to-secondary-700',
    },
    {
      icon: ImageIcon,
      title: 'Kaya Akan Visual',
      description: 'Terintegrasi dengan mesin pencari cerdas untuk menyajikan gambar pendukung pada soal visual.',
      gradient: 'from-purple-500 to-purple-700',
    },
    {
      icon: Laptop,
      title: 'Worksheet Interaktif',
      description: 'Anak bisa mengerjakan langsung di layar dan langsung mendapatkan kunci jawaban serta penjelasan.',
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      icon: Users,
      title: 'Profil Multi-Anak',
      description: 'Satu akun orang tua untuk memantau semua profil anak dengan tingkat kurikulum yang berbeda-beda.',
      gradient: 'from-warning-500 to-warning-600',
    },
    {
      icon: Target,
      title: 'Pantau Perkembangan',
      description: 'Simpan riwayat belajar dan evaluasi kemampuan anak melalui laporan statistik terpadu.',
      gradient: 'from-emerald-500 to-emerald-700',
    },
  ];

  const levels = [
    'PAUD',
    'TK A',
    'TK B',
    'SD Kelas 1-6',
    'SMP Kelas 7-9',
    'SMA Kelas 10-12',
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-md overflow-hidden relative">
              <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold text-primary-600 dark:text-primary-500">
              Teatch
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 via-transparent to-secondary-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles size={16} />
            Platform Belajar Berbasis AI #1 untuk Anak Indonesia
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Bantu Anak Belajar dengan
            <span className="bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              {' '}
              Kecerdasan Buatan
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Generate soal latihan otomatis sesuai usia dan kurikulum. Pantau perkembangan belajar anak dengan mudah.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-2xl shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all active:scale-[0.98]"
            >
              Mulai Sekarang — Gratis
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-surface-800 dark:hover:text-white transition-colors"
            >
              Sudah punya akun? Masuk
            </Link>
          </div>

          {/* Levels */}
          <div className="flex flex-wrap justify-center gap-2 mt-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {levels.map((level) => (
              <span
                key={level}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-500"
              >
                {level}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-surface-400 text-center mb-12 max-w-lg mx-auto">
            Semua yang Anda butuhkan untuk mendampingi belajar anak di rumah
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card p-6 text-center group hover:scale-[1.03] transition-all duration-200"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            Cara Kerja
          </h2>
          <div className="space-y-6">
            {[
              {
                step: '1',
                title: 'Buat Profil Anak',
                desc: 'Masukkan data jenjang sekolah (PAUD-SMA) dan usia anak agar AI bisa merancang kurikulum yang tepat.',
              },
              {
                step: '2',
                title: 'Pilih Segmen & Tipe Soal',
                desc: 'Mau belajar Matematika, Bahasa Inggris, atau Logika? Pilih dari belasan tipe soal interaktif yang tersedia.',
              },
              {
                step: '3',
                title: 'Review & Kerjakan!',
                desc: 'Tinjau soal buatan AI, simpan, lalu biarkan anak menjawabnya langsung di laptop atau tablet.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-4 card p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-surface-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Siap Membantu Anak Belajar?
          </h2>
          <p className="text-surface-400 mb-8">
            Gratis untuk dicoba. Tidak perlu kartu kredit.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all active:scale-[0.98]"
          >
            Daftar Gratis Sekarang
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden relative">
              <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
            </div>
            <span className="font-semibold text-sm">Teatch</span>
          </div>
          <p className="text-xs text-surface-400">
            © 2026 Teatch. Platform Belajar Berbasis AI untuk Anak Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}
