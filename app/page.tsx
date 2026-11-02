import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Printer, ClipboardCheck, BookOpen } from 'lucide-react';
import { PricingSection } from '@/components/subscription/pricing-section';
import { SUBSCRIPTION_LIMITS as PLANS } from '@/lib/subscription';
import { enabledQuestionTypes } from '@/lib/server/features';
import { TYPE_LABELS } from '@/components/worksheets/question-content';
import { WorksheetDemo } from '@/components/learning/worksheet-demo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { buttonStyles } from '@/components/ui/button';

const faqs = [
  {
    question: 'Apa yang bisa dicoba secara gratis?',
    answer: `Free Trial menyediakan ${PLANS.free_trial.maxQuestions} soal baru dan ${PLANS.free_trial.maxChildren} profil anak selama 30 hari. Anda bisa membuat, mengerjakan, dan mencetak latihan tanpa memasukkan kartu kredit.`,
  },
  {
    question: 'Apakah soal yang sudah dibuat bisa diedit?',
    answer:
      'Soal otomatis tersimpan setelah berhasil dibuat dan tidak dapat diedit. Anda bisa mengerjakan ulang atau mencetak latihan tersebut tanpa kuota tambahan. Membuat latihan baru memakai kuota soal.',
  },
  {
    question: 'Siapa yang memeriksa jawaban anak?',
    answer:
      'Soal objektif diperiksa otomatis. Jawaban uraian membutuhkan tinjauan orang tua sebelum nilai akhir diterbitkan. Kunci dan panduan pembahasan tersedia untuk mendampingi proses ini.',
  },
  {
    question: 'Bagaimana cara mengaktifkan paket berbayar?',
    answer:
      'Pembelian dilakukan melalui toko Shopee pada bagian harga. Aktivasi dan pengisian kuota dilakukan admin setelah pembayaran diverifikasi. Paket berlaku 30 hari dan belum diperpanjang otomatis.',
  },
];

const learningTools = [
  {
    icon: BookOpen,
    title: 'Latihan sesuai materi',
    description:
      'Pilih profil anak, pelajaran, topik, tingkat kesulitan, dan bentuk soal. Hasilnya tersimpan sebagai latihan yang bisa dibuka kembali.',
  },
  {
    icon: ClipboardCheck,
    title: 'Catatan untuk mendampingi',
    description:
      'Tinjau jawaban uraian dan lihat riwayat latihan. Paket Pro menambahkan laporan per topik untuk menentukan materi berikutnya.',
  },
  {
    icon: Printer,
    title: 'Belajar lewat layar atau kertas',
    description:
      'Anak bisa mengerjakan di web. Untuk belajar tanpa layar, cetak lembar soal dan kunci jawaban secara terpisah.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <a
        href="#isi-utama"
        className="skip-link button-base action-primary min-h-12 px-5"
      >
        Langsung ke isi halaman
      </a>
      <header className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-[var(--bg)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <Link
            href="/"
            aria-label="Teatch, beranda"
            className="flex min-h-11 items-center gap-2"
          >
            <span className="relative h-9 w-9 overflow-hidden rounded-full border border-[var(--card-border)] bg-white">
              <Image
                src="/teatch_logo.png"
                alt=""
                fill
                sizes="36px"
                className="brand-logo object-cover"
              />
            </span>
            <span className="text-xl font-semibold">Teatch</span>
          </Link>
          <nav
            aria-label="Halaman pengenalan"
            className="hidden items-center gap-6 md:flex"
          >
            {[
              ['#fitur', 'Cara belajar'],
              ['#harga', 'Paket'],
              ['#faq', 'Pertanyaan'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--text-muted)] hover:underline"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center px-2 text-sm font-semibold hover:underline"
            >
              Masuk
            </Link>
            <Link
              href="/login"
              className={buttonStyles({
                size: 'sm',
                variant: 'outline',
                className: 'hidden sm:inline-flex',
              })}
            >
              Coba gratis
            </Link>
          </div>
        </div>
      </header>

      <main id="isi-utama" tabIndex={-1}>
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:py-20">
          <div className="min-w-0">
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
              Temani anak belajar, satu latihan setiap kali.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[var(--text-muted)]">
              Siapkan soal sesuai kelas dan topik, dampingi anak mengerjakannya,
              lalu tentukan materi yang perlu dilatih lagi.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/login" className={buttonStyles()}>
                Buat latihan pertama
              </Link>
              <a
                href="#contoh-latihan"
                className={buttonStyles({ variant: 'ghost' })}
              >
                Coba contoh soal
              </a>
            </div>
            <p className="mt-4 text-sm text-[var(--text-muted)]">
              Coba {PLANS.free_trial.maxQuestions} soal gratis. Tanpa kartu
              kredit.
            </p>
            <p className="mt-8 max-w-lg border-t border-[var(--card-border)] pt-5 text-sm text-[var(--text-muted)]">
              Untuk orang tua yang mendampingi belajar di rumah. Latihan bisa
              dikerjakan di web atau dicetak untuk belajar bersama.
            </p>
          </div>
          <WorksheetDemo />
        </section>

        <section
          id="fitur"
          aria-labelledby="learning-title"
          className="scroll-mt-24 border-y border-[var(--card-border)] bg-[var(--card-bg)]"
        >
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-10">
              <h2 id="learning-title" className="workbook-heading max-w-md">
                Mulai dari yang sedang dipelajari anak.
              </h2>
              <p className="text-lg text-[var(--text-muted)]">
                Pilih materi, bukan menyiapkan soal dari awal. Teatch menyusun
                latihan dengan AI dan langsung menyimpannya. Setelah itu, Anda
                dan anak bisa belajar dengan cara yang paling nyaman.
              </p>
            </div>
            <div className="mt-8 divide-y divide-[var(--card-border)]">
              {learningTools.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="grid gap-3 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-10"
                >
                  <h3 className="flex items-center gap-3 text-lg font-semibold">
                    <Icon
                      size={22}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--text-muted)]"
                    />
                    {title}
                  </h3>
                  <p className="text-[var(--text-muted)]">{description}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 rounded-[var(--radius-card)] bg-[var(--surface-subtle)] p-5">
              <p className="font-semibold">Bentuk soal yang tersedia</p>
              <p className="mt-2 text-[var(--text-muted)]">
                {enabledQuestionTypes()
                  .map((type) => TYPE_LABELS[type])
                  .join(' · ')}
              </p>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                Pilihan menyesuaikan pelajaran dan jenjang anak.
              </p>
            </div>
          </div>
        </section>

        <PricingSection />

        <section
          id="faq"
          aria-labelledby="faq-title"
          className="scroll-mt-24 border-t border-[var(--card-border)]"
        >
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-12">
            <div>
              <h2 id="faq-title" className="workbook-heading">
                Sebelum mulai belajar
              </h2>
              <p className="mt-3 text-[var(--text-muted)]">
                Tentang latihan, penilaian, dan paket Teatch.
              </p>
              <a
                href="https://wa.me/6287795078879"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4"
              >
                Tanyakan lewat WhatsApp
              </a>
            </div>
            <div className="divide-y divide-[var(--card-border)] border-y border-[var(--card-border)]">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="group">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {question}
                    <ChevronDown
                      size={18}
                      aria-hidden="true"
                      className="shrink-0 transition-transform duration-150 group-open:rotate-180"
                    />
                  </summary>
                  <p className="pb-5 text-[var(--text-muted)]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-lg font-semibold">Teatch</p>
            <p className="text-sm text-[var(--text-muted)]">
              Belajar bersama keluarga.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <a
              href="mailto:trenova151@gmail.com"
              className="inline-flex min-h-11 items-center underline underline-offset-4"
            >
              Hubungi Teatch
            </a>
            <Link
              href="/privacy"
              className="inline-flex min-h-11 items-center hover:underline"
            >
              Privasi
            </Link>
            <Link
              href="/terms"
              className="inline-flex min-h-11 items-center hover:underline"
            >
              Syarat &amp; ketentuan
            </Link>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} Teatch
          </p>
        </div>
      </footer>
    </div>
  );
}
