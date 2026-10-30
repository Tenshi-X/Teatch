import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { formatPlanPrice, SUBSCRIPTION_LIMITS } from '@/lib/subscription';

export function PlanUpgrade({
  tier,
  title,
  description,
}: {
  tier: 'basic' | 'pro';
  title: string;
  description: string;
}) {
  const plan = SUBSCRIPTION_LIMITS[tier];
  return (
    <Card padding="lg">
      <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
        Paket {plan.label}
      </p>
      <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{description}</p>
      <Link
        href="/#harga"
        className="mt-4 inline-flex min-h-11 items-center rounded-full px-5 py-2 text-sm font-semibold action-primary"
      >
        Lihat paket {plan.label} · {formatPlanPrice(plan.priceIDR)}/30 hari
      </Link>
      <p className="mt-3 text-xs text-[var(--text-muted)]">
        Riwayat, nilai, cetak soal, dan pengerjaan ulang latihan tetap dapat
        dibuka.
      </p>
    </Card>
  );
}
