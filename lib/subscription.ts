export type SubscriptionTier =
  'free_trial' | 'basic' | 'pro' | 'family' | 'teacher';
export interface TierLimits {
  label: string;
  maxChildren: number;
  maxQuestions: number;
  priceIDR: number;
  public: boolean;
}
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free_trial: {
    label: 'Free Trial',
    maxChildren: 1,
    maxQuestions: 30,
    priceIDR: 0,
    public: true,
  },
  basic: {
    label: 'Basic',
    maxChildren: 3,
    maxQuestions: 1000,
    priceIDR: 69000,
    public: true,
  },
  pro: {
    label: 'Pro',
    maxChildren: 6,
    maxQuestions: 2500,
    priceIDR: 149000,
    public: true,
  },
  family: {
    label: 'Family (lama)',
    maxChildren: 6,
    maxQuestions: 2500,
    priceIDR: 149000,
    public: false,
  },
  teacher: {
    label: 'Teacher (lama)',
    maxChildren: 6,
    maxQuestions: 2500,
    priceIDR: 149000,
    public: false,
  },
};
export function getTierLimits(tier: string | null | undefined): TierLimits {
  return (
    SUBSCRIPTION_LIMITS[tier as SubscriptionTier] ??
    SUBSCRIPTION_LIMITS.free_trial
  );
}

export interface SubscriptionProfile {
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_period_end: string | null;
}

// Read the authenticated database profile on the server before using this policy.
// Admin role does not override plan entitlements; legacy paid tiers retain Pro access.
export function getSubscriptionAccess(
  profile: SubscriptionProfile,
  now = Date.now()
) {
  const expiry = profile.subscription_period_end;
  const active =
    profile.subscription_status === 'active' &&
    (expiry === null ||
      (Number.isFinite(Date.parse(expiry)) && Date.parse(expiry) > now));
  const paid =
    active &&
    ['basic', 'pro', 'family', 'teacher'].includes(
      profile.subscription_tier || ''
    );
  const pro =
    active &&
    ['pro', 'family', 'teacher'].includes(profile.subscription_tier || '');
  return { progressCharts: paid, learningInsights: pro };
}

export function formatPlanPrice(priceIDR: number) {
  return `Rp${priceIDR.toLocaleString('id-ID')}`;
}
