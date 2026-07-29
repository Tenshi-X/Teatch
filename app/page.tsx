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
  Target,
  Instagram,
  MessageCircle,
  Mail
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

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pilih Paket Belajar</h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              Tingkatkan pengalaman belajar anak dengan fitur premium. Harga terjangkau untuk masa depan cerah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <div className="card p-8 border border-[var(--card-border)] relative flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Free Trial</h3>
                <p className="text-surface-400 text-sm">Untuk mencoba fitur dasar</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">Rp 0</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Maksimal 10 worksheet</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>1 profil anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Semua tipe soal standar</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="w-full py-3 px-4 text-center rounded-xl font-medium border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                Mulai Gratis
              </Link>
            </div>

            {/* Basic */}
            <div className="card p-8 border-2 border-primary-500 relative flex flex-col shadow-xl shadow-primary-500/10 scale-105 z-10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Terpopuler
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Basic</h3>
                <p className="text-surface-400 text-sm">Cocok untuk pendampingan harian</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">Rp 150rb</span>
                <span className="text-surface-400">/bln</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span className="font-medium">300 worksheet</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Maksimal 10 profil anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Statistik perkembangan anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Prioritas dukungan (Support)</span>
                </li>
              </ul>
              <a
                href="https://shopee.co.id/trenovaintelligence"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 text-center rounded-xl font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                Berlangganan
              </a>
            </div>

            {/* Pro */}
            <div className="card p-8 border border-[var(--card-border)] relative flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <p className="text-surface-400 text-sm">Untuk keluarga besar & intensif</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">Rp 250rb</span>
                <span className="text-surface-400">/bln</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span className="font-medium">500 worksheet</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Maksimal 30 profil anak</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Fitur premium lanjutan</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <CheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                  <span>Dukungan teknis prioritas 24/7</span>
                </li>
              </ul>
              <a
                href="https://shopee.co.id/trenovaintelligence"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 text-center rounded-xl font-medium border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
              >
                Berlangganan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Apa Kata Mereka?</h2>
            <p className="text-surface-400">Ribuan orang tua telah merasakan manfaat Teatch.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Bunda Rara',
                role: 'Ibu 2 Anak',
                text: 'Sangat terbantu! Dulu pusing cari soal latihan untuk TK dan SD. Sekarang tinggal pilih topik, AI yang buatkan soal yang sesuai dan menarik.',
              },
              {
                name: 'Pak Budi',
                role: 'Ayah 1 Anak',
                text: 'Visualnya bagus dan soalnya interaktif. Anak saya yang tadinya malas belajar berhitung sekarang jadi semangat karena seperti main game.',
              },
              {
                name: 'Bu Tika',
                role: 'Guru Privat & Ibu',
                text: 'Sangat merekomendasikan Teatch. Kuota worksheet sangat lega dan statistik perkembangannya akurat. Worth every penny!',
              },
            ].map((testi, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-center gap-1 mb-4 text-warning-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <svg key={idx} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                  ))}
                </div>
                <p className="text-surface-600 dark:text-surface-300 text-sm mb-6 italic">
                  "{testi.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-bold">
                    {testi.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{testi.name}</h4>
                    <p className="text-xs text-surface-400">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pertanyaan yang Sering Diajukan</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Apakah bisa digunakan di HP/Tablet?',
                a: 'Tentu! Teatch dirancang responsif, Anda bisa membuka dan mengerjakan soal langsung dari browser di HP, Tablet, maupun Laptop.',
              },
              {
                q: 'Apa maksud dari kuota worksheet?',
                a: 'Kuota worksheet adalah jumlah maksimal Anda bisa membuat/meng-generate set soal (worksheet) menggunakan AI setiap bulannya.',
              },
              {
                q: 'Bagaimana cara berlangganan paket Premium?',
                a: 'Anda bisa klik tombol Berlangganan pada paket di atas, yang akan mengarahkan Anda ke toko Shopee resmi kami untuk melakukan pembayaran dengan aman.',
              },
            ].map((faq, i) => (
              <div key={i} className="card p-5">
                <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                  <span className="text-primary-500">Q:</span> {faq.q}
                </h3>
                <p className="text-surface-500 text-sm flex items-start gap-2">
                  <span className="font-bold text-surface-300 dark:text-surface-600">A:</span> {faq.a}
                </p>
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
      <footer className="border-t border-[var(--card-border)] py-12 px-4 bg-surface-50 dark:bg-surface-900/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8 border-b border-[var(--card-border)] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden relative shadow-sm">
                <Image src="/teatch_logo.png" alt="Teatch Logo" fill className="object-cover" />
              </div>
              <span className="font-bold text-lg text-primary-600 dark:text-primary-500">Teatch</span>
            </div>
            <p className="text-sm text-surface-400 max-w-sm mb-6">
              Platform Belajar Berbasis AI untuk Anak Indonesia. Meringankan tugas orang tua dan guru dalam menyajikan latihan yang adaptif dan interaktif.
            </p>
          </div>
          <div className="flex flex-col md:items-end">
            <h3 className="font-semibold text-lg mb-4 text-surface-700 dark:text-surface-300">Hubungi Kami</h3>
            <div className="flex flex-col gap-3">
              <a href="mailto:trenova151@gmail.com" className="flex items-center gap-3 text-sm text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Mail size={18} />
                trenova151@gmail.com
              </a>
              <a href="https://wa.me/6287795078879" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-surface-500 hover:text-emerald-500 transition-colors">
                <MessageCircle size={18} />
                +62 877 9507 8879 (WhatsApp)
              </a>
              <a href="https://www.instagram.com/trenova.intelligence?igsh=dDQ5ODM5cDFsdHIw" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-surface-500 hover:text-pink-500 transition-colors">
                <Instagram size={18} />
                @trenova.intelligence
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} Trenova Intelligence. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
