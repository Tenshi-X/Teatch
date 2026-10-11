export type SubscriptionTier =
  'free_trial' | 'basic' | 'pro' | 'family' | 'teacher';
export interface TierLimits {
  label: string;
  maxChildren: number;
  maxQuestions: number;
  public: boolean;
}
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free_trial: {
    label: 'Free Trial',
    maxChildren: 1,
    maxQuestions: 10,
    public: true,
  },
  basic: { label: 'Basic', maxChildren: 3, maxQuestions: 300, public: true },
  pro: { label: 'Pro', maxChildren: 6, maxQuestions: 500, public: true },
  family: {
    label: 'Family (lama)',
    maxChildren: 6,
    maxQuestions: 500,
    public: false,
  },
  teacher: {
    label: 'Teacher (lama)',
    maxChildren: 6,
    maxQuestions: 500,
    public: false,
  },
};
export function getTierLimits(tier: string | null | undefined): TierLimits {
  return (
    SUBSCRIPTION_LIMITS[tier as SubscriptionTier] ??
    SUBSCRIPTION_LIMITS.free_trial
  );
}
