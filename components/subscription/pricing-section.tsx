import Link from 'next/link';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { PlanLink } from '@/components/feedback/plan-link';
import { SUBSCRIPTION_LIMITS, formatPlanPrice } from '@/lib/subscription';

const cards = [
  {
    tier: 'free_trial',
    description: 'Coba membuat, mengerjakan, dan mencetak latihan.',
    benefits: [
      'Kerjakan di web, lihat nilai dan pembahasan',
      'Cetak soal dan kunci jawaban terpisah',
      'Ulangi latihan tersimpan tanpa kuota tambahan',
    ],
  },
  {
    tier: 'basic',
    description: 'Latihan rutin dan pantau nilai setiap anak.',
    benefits: [
      'Semua fitur latihan dasar, termasuk cetak soal',
      'Riwayat dan grafik perkembangan nilai',
      'Ulangi latihan tersimpan tanpa kuota tambahan',
    ],
  },
  {
    tier: 'pro',
    description: 'Kenali materi yang perlu dilatih lebih lanjut.',
    benefits: [
      'Semua fitur Basic',
      'Analisis penguasaan materi per topik',
      'Tren belajar dan cetak laporan perkembangan',
      'Buat latihan lanjutan dari topik dalam laporan',
    ],
  },
] as const;

export function PricingSection() {
  return (
    <section
      id="harga"
      className="scroll-mt-24 py-24 px-6 bg-white dark:bg-[var(--bg)]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Pilih Paket Belajar
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
            Mulai mencoba, bangun rutinitas, lalu pantau perkembangan belajar
            anak.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {cards.map(({ tier, description, benefits }) => {
            const plan = SUBSCRIPTION_LIMITS[tier];
            return (
              <div
                key={tier}
                className={`card p-8 bg-white dark:bg-[var(--card-bg)] flex flex-col rounded-[var(--radius-card)] shadow-sm relative ${tier === 'basic' ? 'border-2 border-primary-500' : 'border border-[var(--card-border)]'}`}
              >
                {tier === 'basic' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-300 text-surface-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                    Latihan harian
                  </div>
                )}
                <div className="mb-6 mt-2">
                  <h3 className="text-xl font-bold mb-2">{plan.label}</h3>
                  <p className="text-[var(--text-muted)] text-sm">
                    {description}
                  </p>
                </div>
                <div className="mb-8">
                  <span className="text-3xl lg:text-4xl font-bold tracking-tight">
                    {formatPlanPrice(plan.priceIDR)}
                  </span>
                  {tier !== 'free_trial' && (
                    <span className="block mt-1 text-sm text-[var(--text-muted)]">
                      /30 hari
                    </span>
                  )}
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    `${plan.maxQuestions.toLocaleString('id-ID')} soal baru ${tier === 'free_trial' ? 'sekali selama trial' : 'setiap periode aktif'}`,
                    `${tier === 'free_trial' ? '' : 'Maksimal '}${plan.maxChildren} profil anak`,
                    ...benefits,
                  ].map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-3 text-sm text-surface-600 dark:text-surface-300"
                    >
                      <CheckCircle
                        className="w-5 h-5 text-primary-500 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                {tier === 'free_trial' ? (
                  <Link
                    href="/login"
                    className="w-full py-3 px-4 text-center rounded-full font-semibold border border-[var(--card-border)]"
                  >
                    Mulai Gratis
                  </Link>
                ) : (
                  <PlanLink
                    href="https://shopee.co.id/trenovaintelligence"
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-3 px-4 text-center rounded-full font-semibold ${tier === 'basic' ? 'action-primary' : 'border border-[var(--card-border)]'}`}
                  >
                    Berlangganan
                  </PlanLink>
                )}
              </div>
            );
          })}
        </div>
        <p className="max-w-3xl mx-auto mt-8 text-center text-sm text-[var(--text-muted)]">
          Semua paket mencakup pilihan kelas, pelajaran, topik, tingkat
          kesulitan, dan tipe soal yang tersedia. Kuota soal baru dibagi seluruh
          profil anak. Mengerjakan ulang atau mencetak latihan tersimpan tidak
          mengurangi kuota; membuat latihan lanjutan memakai kuota baru.
        </p>
        <p className="max-w-3xl mx-auto mt-3 text-center text-sm text-[var(--text-muted)]">
          Trial berlaku 30 hari dengan satu alokasi kuota. Paket berbayar
          diaktifkan selama 30 hari setelah verifikasi pembayaran. Perpanjangan
          dan pengisian kuota dilakukan oleh admin; belum ada perpanjangan
          otomatis.
        </p>
        <div className="max-w-2xl mx-auto mt-8 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
          <ShieldCheck
            size={16}
            className="shrink-0 text-secondary-600 dark:text-secondary-400"
            aria-hidden="true"
          />
          <span>
            Pembayaran melalui Shopee. Aktivasi paket dilakukan manual setelah
            verifikasi.
          </span>
        </div>
      </div>
    </section>
  );
}
