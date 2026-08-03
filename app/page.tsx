import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Brain,
  Puzzle,
  Image as ImageIcon,
  Laptop,
  Users,
  Target,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Mail
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'Tutor Pribadi AI',
      description: 'Soal otomatis menyesuaikan usia, kelas, dan topik spesifik yang sedang dipelajari anak.',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      icon: Puzzle,
      title: '18+ Variasi Tipe Soal',
      description: 'Tidak membosankan! Ada tebak gambar, susun kata, menjodohkan, hingga cerita pendek.',
      color: 'bg-secondary-50 text-secondary-600',
    },
    {
      icon: ImageIcon,
      title: 'Kaya Akan Visual',
      description: 'Terintegrasi dengan mesin pencari cerdas untuk menyajikan gambar pendukung pada soal visual.',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: Laptop,
      title: 'Worksheet Interaktif',
      description: 'Anak bisa mengerjakan langsung di layar dan langsung mendapatkan kunci jawaban serta penjelasan.',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Users,
      title: 'Profil Multi-Anak',
      description: 'Satu akun orang tua untuk memantau semua profil anak dengan tingkat kurikulum yang berbeda-beda.',
      color: 'bg-warning-50 text-warning-600',
    },
    {
      icon: Target,
      title: 'Pantau Perkembangan',
      description: 'Simpan riwayat belajar dan evaluasi kemampuan anak melalui laporan statistik terpadu.',
      color: 'bg-emerald-50 text-emerald-600',
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
      <header className="sticky top-0 z-50 bg-[var(--bg)]/90 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden relative shadow-sm border border-[var(--card-border)]">
              <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold tracking-tight text-surface-900 dark:text-white">
              Teatch
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-full transition-all shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-[1px]"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero (Split Screen) */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-6 border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-surface-800 border border-[var(--card-border)] text-surface-600 dark:text-surface-300 text-xs font-semibold uppercase tracking-wider mb-8">
              <Sparkles size={14} className="text-primary-500" />
              Platform Belajar AI Anak
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-surface-900 dark:text-white mb-6">
              Bantu Anak Belajar dengan{' '}
              <span className="text-primary-600 dark:text-primary-500">
                Kecerdasan Buatan.
              </span>
            </h1>

            <p className="text-lg text-surface-500 dark:text-surface-400 mb-10 max-w-lg leading-relaxed">
              Generate soal latihan otomatis sesuai usia dan kurikulum. Pantau perkembangan belajar anak dengan alat yang mudah, cepat, dan interaktif.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-sm hover:shadow-md hover:-translate-y-px transition-all active:translate-y-[1px]"
              >
                Mulai Sekarang
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-surface-700 dark:text-surface-200 border-[1.5px] border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-full transition-all active:translate-y-[1px]"
              >
                Lihat Demo
              </Link>
            </div>

            {/* Levels */}
            <div className="flex flex-wrap gap-2 mt-12">
              {levels.map((level) => (
                <span
                  key={level}
                  className="px-4 py-1.5 rounded-full text-xs font-medium border border-[var(--card-border)] text-surface-500 bg-surface-50 dark:bg-surface-900"
                >
                  {level}
                </span>
              ))}
            </div>
          </div>

          <div className="relative w-full h-[500px] bg-surface-50 dark:bg-surface-900 rounded-3xl border border-[var(--card-border)] shadow-sm flex items-center justify-center animate-fade-in lg:mt-0 mt-8 overflow-hidden">
             {/* Decorative abstract UI for hero */}
             <div className="absolute inset-4 border border-surface-200/50 dark:border-surface-700/50 rounded-2xl bg-white dark:bg-surface-950 p-6 flex flex-col gap-4 shadow-sm">
                <div className="w-1/3 h-6 bg-surface-100 dark:bg-surface-800 rounded-full animate-pulse" />
                <div className="w-2/3 h-4 bg-surface-100 dark:bg-surface-800 rounded-full" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="h-32 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800/30" />
                  <div className="h-32 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl border border-secondary-100 dark:border-secondary-800/30" />
                </div>
                <div className="flex-1 mt-4 bg-surface-50 dark:bg-surface-900 rounded-xl border border-[var(--card-border)]" />
             </div>
          </div>
        </div>
      </section>

      {/* Zig-Zag Features */}
      <section className="py-24 px-6 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Dirancang untuk Hasil yang Nyata
            </h2>
            <p className="text-surface-500 text-lg">
              Setiap fitur dibuat untuk memberikan pengalaman belajar terbaik bagi anak Anda, tanpa membuat orang tua pusing.
            </p>
          </div>

          <div className="space-y-24">
            {features.map((feature, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={feature.title} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                  <div className="flex-1 space-y-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color} border border-surface-200 dark:border-surface-700`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
                    <p className="text-surface-500 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex-1 w-full aspect-video bg-surface-50 dark:bg-surface-900 rounded-2xl border border-[var(--card-border)] flex items-center justify-center">
                     <span className="text-surface-300 dark:text-surface-700 font-medium tracking-wide">Ilustrasi Fitur</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing (Flat & Soft) */}
      <section className="py-24 px-6 bg-surface-50 dark:bg-surface-900/50 border-y border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Pilih Paket Belajar</h2>
            <p className="text-surface-500 max-w-2xl mx-auto text-lg">
              Harga transparan. Pilih rencana yang sesuai dengan kebutuhan keluarga Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <div className="card p-8 border border-[var(--card-border)] bg-white dark:bg-[#121212] flex flex-col rounded-2xl shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Free Trial</h3>
                <p className="text-surface-500 text-sm">Untuk mencoba fitur dasar</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold tracking-tight">Rp 0</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Maksimal 10 worksheet</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>1 profil anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Semua tipe soal standar</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="w-full py-3 px-4 text-center rounded-full font-semibold border-[1.5px] border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all active:translate-y-[1px]"
              >
                Mulai Gratis
              </Link>
            </div>

            {/* Basic */}
            <div className="card p-8 border-2 border-primary-500 bg-white dark:bg-[#121212] flex flex-col rounded-2xl shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Terpopuler
              </div>
              <div className="mb-6 mt-2">
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <p className="text-surface-500 text-sm">Cocok untuk pendampingan harian</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold tracking-tight">Rp 150rb</span>
                <span className="text-surface-400">/bln</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span className="font-medium">300 worksheet</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Maksimal 10 profil anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Statistik perkembangan anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Prioritas dukungan (Support)</span>
                </li>
              </ul>
              <a
                href="https://shopee.co.id/trenovaintelligence"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 text-center rounded-full font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all hover:-translate-y-px active:translate-y-[1px] shadow-sm"
              >
                Berlangganan
              </a>
            </div>

            {/* Pro */}
            <div className="card p-8 border border-[var(--card-border)] bg-white dark:bg-[#121212] flex flex-col rounded-2xl shadow-sm">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">Pro</h3>
                <p className="text-surface-500 text-sm">Untuk keluarga besar & intensif</p>
              </div>
              <div className="mb-8">
                <span className="text-4xl font-bold tracking-tight">Rp 250rb</span>
                <span className="text-surface-400">/bln</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span className="font-medium">500 worksheet</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Maksimal 30 profil anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Fitur premium lanjutan</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Dukungan teknis prioritas 24/7</span>
                </li>
              </ul>
              <a
                href="https://shopee.co.id/trenovaintelligence"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 text-center rounded-full font-semibold border-[1.5px] border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-800 transition-all active:translate-y-[1px]"
              >
                Berlangganan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight mb-6">
            Siap Membantu Anak Belajar?
          </h2>
          <p className="text-surface-500 text-lg mb-10">
            Platform Teatch gratis untuk dicoba. Tidak perlu kartu kredit.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-full shadow-sm hover:shadow-md hover:-translate-y-px transition-all active:translate-y-[1px]"
          >
            Daftar Gratis Sekarang
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] py-16 px-6 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden relative shadow-sm border border-[var(--card-border)]">
                <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
              </div>
              <span className="font-bold tracking-tight text-lg text-surface-900 dark:text-white">Teatch</span>
            </div>
            <p className="text-sm text-surface-500 max-w-sm leading-relaxed">
              Platform Belajar Berbasis AI untuk Anak Indonesia. Meringankan tugas orang tua dan guru dalam menyajikan latihan yang adaptif dan interaktif.
            </p>
          </div>
          <div className="flex flex-col md:items-end">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-6">Hubungi Kami</h3>
            <div className="flex flex-col gap-4">
              <a href="mailto:trenova151@gmail.com" className="flex items-center gap-3 text-sm text-surface-500 hover:text-primary-600 transition-colors">
                <Mail size={18} />
                trenova151@gmail.com
              </a>
              <a href="https://wa.me/6287795078879" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-surface-500 hover:text-emerald-600 transition-colors">
                <MessageCircle size={18} />
                +62 877 9507 8879 (WhatsApp)
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto border-t border-[var(--card-border)] pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} Trenova Intelligence. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">Privasi</a>
            <a href="#" className="text-xs text-surface-400 hover:text-surface-600 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
