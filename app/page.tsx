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
  Mail,
  BookOpen,
  GraduationCap,
  ClipboardList,
  ShieldCheck,
  ChevronDown,
  Home,
  Star,
  Baby
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Tutor Pribadi AI',
    description: 'Soal otomatis menyesuaikan usia, kelas, dan topik spesifik yang sedang dipelajari anak.',
    color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
  },
  {
    icon: Puzzle,
    title: '18+ Variasi Tipe Soal',
    description: 'Tidak membosankan! Ada tebak gambar, susun kata, menjodohkan, hingga cerita pendek.',
    color: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-900/20 dark:text-secondary-400',
  },
  {
    icon: ImageIcon,
    title: 'Kaya Akan Visual',
    description: 'Terintegrasi dengan mesin pencari cerdas untuk menyajikan gambar pendukung pada soal visual.',
    color: 'bg-ai-50 text-ai-600 dark:bg-ai-900/20 dark:text-ai-400',
  },
  {
    icon: Laptop,
    title: 'Worksheet Interaktif',
    description: 'Anak bisa mengerjakan langsung di layar dan langsung mendapatkan kunci jawaban serta penjelasan.',
    color: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
  },
  {
    icon: Users,
    title: 'Profil Multi-Anak',
    description: 'Satu akun orang tua untuk memantau semua profil anak dengan tingkat kurikulum yang berbeda-beda.',
    color: 'bg-warning-50 text-warning-600 dark:bg-warning-900/20 dark:text-warning-400',
  },
  {
    icon: Target,
    title: 'Pantau Perkembangan',
    description: 'Simpan riwayat belajar dan evaluasi kemampuan anak melalui laporan statistik terpadu.',
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
];

const questionTypes = [
  'Pilihan Ganda',
  'Tebak Gambar',
  'Susun Kata',
  'Menjodohkan',
  'Isian Singkat',
  'Benar / Salah',
  'Cerita & Pemahaman',
  'Urutan Angka',
];

const levels = [
  'PAUD',
  'TK A',
  'TK B',
  'SD Kelas 1-6',
  'SMP Kelas 7-9',
  'SMA Kelas 10-12',
];
const steps = [
  {
    icon: ClipboardList,
    title: 'Lengkapi Profil Anak',
    description: 'Masukkan usia, jenjang kelas, dan topik yang sedang dipelajari — misalnya perkalian dasar atau membaca permulaan.',
  },
  {
    icon: Brain,
    title: 'AI Menyusun Worksheet',
    description: 'Dalam sekejap, soal latihan dibuat otomatis sesuai kurikulum dengan beragam tipe soal yang tidak membosankan.',
  },
  {
    icon: Laptop,
    title: 'Anak Belajar & Bermain',
    description: 'Kerjakan langsung di layar dengan umpan balik instan, kunci jawaban, dan penjelasan di setiap soal.',
  },
];

const audiences = [
  {
    icon: Users,
    title: 'Orang Tua',
    description: 'Temani anak belajar di rumah tanpa harus menyiapkan soal sendiri. Cukup pilih topik, sisanya dibuat otomatis.',
  },
  {
    icon: GraduationCap,
    title: 'Guru & Wali Kelas',
    description: 'Siapkan latihan tambahan atau PR yang selalu segar, sesuai materi kelas yang sedang diajarkan.',
  },
  {
    icon: Home,
    title: 'Keluarga Homeschooling',
    description: 'Materi latihan terstruktur dari PAUD hingga SMA untuk mendampingi kurikulum belajar di rumah.',
  },
];

const faqs = [
  {
    question: 'Apakah Teatch benar-benar gratis?',
    answer: 'Ya. Paket Free Trial bisa dipakai tanpa biaya — termasuk 10 worksheet dan 1 profil anak — tanpa perlu memasukkan kartu kredit. Upgrade ke paket Basic atau Pro hanya jika Anda membutuhkan lebih banyak kuota.',
  },
  {
    question: 'Jenjang pendidikan apa saja yang didukung?',
    answer: 'Teatch mendukung jenjang PAUD, TK A/B, SD kelas 1-6, SMP kelas 7-9, hingga SMA kelas 10-12. Soal selalu disesuaikan dengan usia dan kurikulum jenjang anak Anda.',
  },
  {
    question: 'Apakah soalnya bisa berbeda setiap kali dibuat?',
    answer: 'Ya. AI menghasilkan soal baru setiap kali worksheet dibuat, sehingga anak tidak mudah bosan dan orang tua bisa meminta latihan tambahan kapan saja dengan topik yang sama.',
  },
  {
    question: 'Bagaimana cara berlangganan paket berbayar?',
    answer: 'Berlangganan dilakukan melalui toko resmi kami di Shopee (tautan tersedia pada bagian harga). Pembayaran diproses aman oleh Shopee, lalu paket Anda segera diaktifkan.',
  },
  {
    question: 'Apakah data anak saya aman?',
    answer: 'Kami hanya meminta data yang diperlukan untuk menyesuaikan materi belajar (usia, jenjang, topik). Data tidak dibagikan ke pihak lain dan hanya digunakan untuk keperluan platform.',
  },
  {
    question: 'Bisakah saya memantau kemajuan belajar anak?',
    answer: 'Bisa. Setiap pengerjaan tersimpan di riwayat, dan halaman statistik merangkum skor, perkembangan, serta area yang perlu dilatih lagi.',
  },
];

const navLinks = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#harga', label: 'Harga' },
  { href: '#faq', label: 'FAQ' },
];

export default function LandingPage() {
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
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
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

            <p className="text-lg text-surface-500 dark:text-surface-400 mb-6 max-w-lg leading-relaxed">
              Generate soal latihan otomatis sesuai usia dan kurikulum. Pantau perkembangan belajar anak dengan alat yang mudah, cepat, dan interaktif.
            </p>

            <p className="flex items-center gap-2 text-sm font-medium text-surface-600 dark:text-surface-300 mb-8">
              <CheckCircle size={16} className="text-secondary-600 dark:text-secondary-400" />
              Gratis untuk dicoba — tanpa kartu kredit.
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
                href="#fitur"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-surface-700 dark:text-surface-200 border-[1.5px] border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 rounded-full transition-all active:translate-y-[1px]"
              >
                Jelajahi Fitur
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

          {/* Hero Visual — interactive worksheet mockup */}
          <div className="relative w-full max-w-lg mx-auto lg:max-w-none animate-fade-in-up lg:mt-0 mt-8" style={{ animationDelay: '0.15s' }}>
            <div className="relative bg-white dark:bg-surface-900 rounded-3xl border border-[var(--card-border)] shadow-lg p-6 sm:p-7">
              {/* Card header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center border border-primary-100 dark:border-primary-800/40">
                    <BookOpen size={18} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-surface-900 dark:text-white leading-tight">Latihan Pagi</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Matematika · Kelas 2 SD</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ai-50 dark:bg-ai-900/30 border border-ai-100 dark:border-ai-800/40 text-[11px] font-semibold text-ai-600 dark:text-ai-400">
                  <Sparkles size={12} />
                  AI
                </span>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Soal 3 dari 10</span>
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">30%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
                </div>
              </div>

              {/* Question */}
              <div className="rounded-2xl border border-[var(--card-border)] bg-surface-50 dark:bg-surface-950/60 p-4 sm:p-5 mb-5">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200 leading-relaxed">
                  Ibu membeli <span className="font-bold text-primary-600 dark:text-primary-400">8 apel</span>, lalu memberikan 3 apel kepada tetangga. Berapa apel yang tersisa?
                </p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl border border-[var(--card-border)] bg-white dark:bg-surface-900 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-300">A. 4 apel</div>
                <div className="rounded-xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/30 px-4 py-3 text-sm font-bold text-primary-700 dark:text-primary-300 flex items-center justify-between">
                  B. 5 apel
                  <CheckCircle size={16} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="rounded-xl border border-[var(--card-border)] bg-white dark:bg-surface-900 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-300">C. 6 apel</div>
                <div className="rounded-xl border border-[var(--card-border)] bg-white dark:bg-surface-900 px-4 py-3 text-sm font-medium text-surface-600 dark:text-surface-300">D. 11 apel</div>
              </div>

              {/* Feedback */}
              <div className="flex items-center gap-3 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800/40 px-4 py-3 mb-6">
                <CheckCircle size={18} className="text-secondary-600 dark:text-secondary-400 shrink-0" />
                <p className="text-xs text-surface-700 dark:text-surface-200 leading-snug">
                  <span className="font-bold text-secondary-700 dark:text-secondary-400">Benar!</span> 8 − 3 = 5. Kerja bagus! 🎉
                </p>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-surface-400">Kunci jawaban &amp; penjelasan tersedia</span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-600 text-white text-xs font-semibold">
                  Lanjut Soal
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>

            {/* Floating card — score stats */}
            <div className="absolute -left-4 sm:-left-8 -bottom-8 bg-white dark:bg-surface-900 rounded-2xl border border-[var(--card-border)] shadow-lg px-5 py-4 hidden sm:block animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary-50 dark:bg-secondary-900/30 flex items-center justify-center">
                  <Target size={15} className="text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 font-medium leading-none mb-1">Rata-rata skor</p>
                  <p className="text-lg font-bold text-surface-900 dark:text-white leading-none">85</p>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-8 pt-1">
                <div className="w-2.5 rounded-t-md bg-primary-200 dark:bg-primary-800 h-[40%]" />
                <div className="w-2.5 rounded-t-md bg-primary-300 dark:bg-primary-700 h-[55%]" />
                <div className="w-2.5 rounded-t-md bg-primary-400 dark:bg-primary-600 h-[70%]" />
                <div className="w-2.5 rounded-t-md bg-primary-500 h-[85%]" />
                <div className="w-2.5 rounded-t-md bg-primary-600 h-full" />
              </div>
            </div>

            {/* Floating card — points earned */}
            <div className="absolute -right-3 sm:-right-6 -top-7 bg-white dark:bg-surface-900 rounded-2xl border border-[var(--card-border)] shadow-lg px-4 py-3 flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="w-9 h-9 rounded-full bg-warning-50 dark:bg-warning-900/30 flex items-center justify-center">
                <Star size={17} className="text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-surface-900 dark:text-white leading-none mb-0.5">+50 poin</p>
                <p className="text-[11px] text-surface-500 dark:text-surface-400 font-medium">Jawaban benar!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="scroll-mt-24 py-24 px-6 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Dirancang untuk Hasil yang Nyata
            </h2>
            <p className="text-surface-500 text-lg">
              Setiap fitur dibuat untuk memberikan pengalaman belajar terbaik bagi anak Anda, tanpa membuat orang tua pusing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card p-7 rounded-2xl group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-surface-200/60 dark:border-surface-700/60 mb-5 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-surface-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Question type chips */}
          <div className="mt-14 text-center">
            <p className="text-sm font-semibold text-surface-500 dark:text-surface-400 mb-5">
              18+ variasi tipe soal — termasuk:
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {questionTypes.map((type) => (
                <span
                  key={type}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="scroll-mt-24 py-24 px-6 bg-surface-50 dark:bg-surface-900/50 border-y border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Hanya 3 Langkah, Langsung Siap Dipakai
            </h2>
            <p className="text-surface-500 text-lg">
              Tidak perlu keahlian khusus. Selesaikan tiga langkah ini dan anak Anda sudah bisa mulai berlatih.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((step, idx) => (
              <div key={step.title} className="relative card p-8 rounded-2xl text-center">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shadow-sm">
                  {idx + 1}
                </div>
                <div className="w-14 h-14 mx-auto mt-8 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-100 dark:border-primary-800/40 mb-5">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-surface-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-10">
            Setelah selesai, semua hasil belajar otomatis tersimpan di <span className="font-semibold text-surface-700 dark:text-surface-200">Statistik</span> — jadi perkembangan anak selalu bisa dipantau.
          </p>
        </div>
      </section>

      {/* Audiences */}
      <section className="py-24 px-6 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Dibuat untuk Siapa Saja yang Mendampingi Anak
            </h2>
            <p className="text-surface-500 text-lg">
              Satu platform, banyak peran — semua dengan tujuan yang sama: belajar yang menyenangkan dan efektif.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {audiences.map((audience) => (
              <div key={audience.title} className="rounded-2xl border border-[var(--card-border)] bg-surface-50 dark:bg-surface-900 p-8">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-surface-800 border border-[var(--card-border)] flex items-center justify-center text-primary-600 dark:text-primary-400 mb-5 shadow-sm">
                  <audience.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-2 text-surface-900 dark:text-white">
                  {audience.title}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                  {audience.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 py-24 px-6 bg-surface-50 dark:bg-surface-900/50 border-y border-[var(--card-border)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-surface-500 text-lg">
              Masih penasaran? Temukan jawabannya di sini, atau hubungi kami langsung.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group card rounded-2xl px-6 py-5 open:shadow-md"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-semibold text-surface-900 dark:text-white">
                    {faq.question}
                  </span>
                  <span className="w-7 h-7 shrink-0 rounded-full border border-[var(--card-border)] bg-surface-50 dark:bg-surface-800 flex items-center justify-center text-surface-500 dark:text-surface-300 transition-transform duration-200 group-open:rotate-180">
                    <ChevronDown size={16} />
                  </span>
                </summary>
                <p className="mt-4 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-10">
            Tidak menemukan jawaban Anda?{' '}
            <a
              href="https://wa.me/6287795078879"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Tanya langsung via WhatsApp
            </a>
          </p>
        </div>
      </section>

      {/* Pricing (Flat & Soft) */}
      <section id="harga" className="scroll-mt-24 py-24 px-6 bg-white dark:bg-[#0A0A0A]">
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
                <p className="text-surface-500 text-sm">Untuk keluarga besar &amp; intensif</p>
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

          <div className="max-w-2xl mx-auto mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-surface-500 dark:text-surface-400">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} className="text-secondary-600 dark:text-secondary-400" />
              Pembayaran aman melalui Shopee — toko resmi kami.
            </span>
            <span className="hidden sm:block text-surface-300 dark:text-surface-600">·</span>
            <span>
              Butuh bantuan?{' '}
              <a href="https://wa.me/6287795078879" target="_blank" rel="noreferrer" className="font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                Hubungi via WhatsApp
              </a>
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles size={14} className="text-primary-500" />
            Mulai dalam hitungan menit
          </div>
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
            <Link href="/privacy" className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">Privasi</Link>
            <Link href="/terms" className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}