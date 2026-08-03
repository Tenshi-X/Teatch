export type SubscriptionTier = 'free_trial' | 'basic' | 'pro';

export interface TierLimits {
  maxChildren: number;
  maxQuestions: number;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free_trial: {
    maxChildren: 1,
    maxQuestions: 100,
  },
  basic: {
    maxChildren: 3,
    maxQuestions: 3000,
  },
  pro: {
    maxChildren: 6,
    maxQuestions: 5000,
  },
};

export function getTierLimits(tier: string | undefined | null): TierLimits {
  const validTier = (tier as SubscriptionTier) || 'free_trial';
  return SUBSCRIPTION_LIMITS[validTier] || SUBSCRIPTION_LIMITS.free_trial;
}
