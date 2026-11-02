import Link from 'next/link';
import { CheckCircle, ShieldCheck } from 'lucide-react';
import { PlanLink } from '@/components/feedback/plan-link';
import { SUBSCRIPTION_LIMITS, formatPlanPrice } from '@/lib/subscription';
import { buttonStyles } from '@/components/ui/button';

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
      aria-labelledby="pricing-title"
      className="scroll-mt-24 py-10 sm:py-14 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-7 max-w-2xl">
          <h2 id="pricing-title" className="workbook-heading mb-3">
            Pilih ruang untuk belajar
          </h2>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
            Mulai mencoba, bangun rutinitas, lalu pantau perkembangan belajar
            anak.
          </p>
        </div>
        <div className="divide-y divide-[var(--card-border)] border-y border-[var(--card-border)]">
          {cards.map(({ tier, description, benefits }) => {
            const plan = SUBSCRIPTION_LIMITS[tier];
            return (
              <div
                key={tier}
                className="grid min-w-0 gap-5 py-7 sm:grid-cols-2 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)]"
              >
                <div>
                  <h3 className="text-xl font-bold mb-2">{plan.label}</h3>
                  <p className="text-[var(--text-muted)] text-sm">
                    {description}
                  </p>
                  <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight">
                    {formatPlanPrice(plan.priceIDR)}
                  </p>
                  {tier !== 'free_trial' && (
                    <span className="block mt-1 text-sm text-[var(--text-muted)]">
                      /30 hari
                    </span>
                  )}
                </div>
                <ul className="space-y-3">
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
                        className="w-5 h-5 text-[var(--accent-color)] shrink-0"
                        aria-hidden="true"
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-start sm:col-span-2 xl:col-span-1 xl:justify-end">
                  {tier === 'free_trial' ? (
                    <Link
                      href="/login"
                      className={buttonStyles({
                        className: 'w-full sm:w-auto',
                      })}
                    >
                      Coba latihan gratis
                    </Link>
                  ) : (
                    <PlanLink
                      href="https://shopee.co.id/trenovaintelligence"
                      target="_blank"
                      rel="noreferrer"
                      className={buttonStyles({
                        variant: 'outline',
                        className: 'w-full sm:w-auto',
                      })}
                    >
                      Pilih {plan.label}
                    </PlanLink>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="max-w-4xl mt-6 text-sm text-[var(--text-muted)]">
          Semua paket mencakup pilihan kelas, pelajaran, topik, tingkat
          kesulitan, dan tipe soal yang tersedia. Kuota soal baru dibagi seluruh
          profil anak. Mengerjakan ulang atau mencetak latihan tersimpan tidak
          mengurangi kuota; membuat latihan lanjutan memakai kuota baru.
        </p>
        <p className="max-w-4xl mt-3 text-sm text-[var(--text-muted)]">
          Trial berlaku 30 hari dengan satu alokasi kuota. Paket berbayar
          diaktifkan selama 30 hari setelah verifikasi pembayaran. Perpanjangan
          dan pengisian kuota dilakukan oleh admin; belum ada perpanjangan
          otomatis.
        </p>
        <div className="max-w-4xl mt-4 flex items-start gap-2 text-sm text-[var(--text-muted)]">
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
