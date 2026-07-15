export type SubscriptionTier = 'free_trial' | 'basic' | 'family' | 'teacher';

export interface TierLimits {
  maxChildren: number;
  maxWorksheetsPerMonth: number;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free_trial: {
    maxChildren: 1,
    maxWorksheetsPerMonth: 10,
  },
  basic: {
    maxChildren: 3,
    maxWorksheetsPerMonth: 100,
  },
  family: {
    maxChildren: 6,
    maxWorksheetsPerMonth: 500,
  },
  teacher: {
    maxChildren: 30,
    maxWorksheetsPerMonth: 1000,
  },
};

export function getTierLimits(tier: string | undefined | null): TierLimits {
  const validTier = (tier as SubscriptionTier) || 'free_trial';
  return SUBSCRIPTION_LIMITS[validTier] || SUBSCRIPTION_LIMITS.free_trial;
}
