import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSubscriptionAccess,
  SUBSCRIPTION_LIMITS,
  formatPlanPrice,
} from '@/lib/subscription';

test('trial, Basic and Pro allocations and prices match the approved packages', () => {
  assert.deepEqual(
    ['free_trial', 'basic', 'pro'].map((tier) => {
      const p = SUBSCRIPTION_LIMITS[tier as keyof typeof SUBSCRIPTION_LIMITS];
      return [p.maxQuestions, p.maxChildren, p.priceIDR];
    }),
    [
      [30, 1, 0],
      [1000, 3, 69000],
      [2500, 6, 149000],
    ]
  );
  assert.equal(formatPlanPrice(69000), 'Rp69.000');
});

test('paid graphs and Pro insights are denied for unknown, inactive, expired and invalid-expiry subscriptions', () => {
  const now = Date.parse('2026-10-30T12:00:00Z');
  const active = {
    subscription_status: 'active',
    subscription_period_end: null,
  };
  for (const tier of [
    'free_trial',
    'unknown',
    null,
    'basic',
    'pro',
    'family',
    'teacher',
  ]) {
    const profile = { ...active, subscription_tier: tier };
    assert.deepEqual(getSubscriptionAccess(profile, now), {
      progressCharts: ['basic', 'pro', 'family', 'teacher'].includes(
        tier || ''
      ),
      learningInsights: ['pro', 'family', 'teacher'].includes(tier || ''),
    });
    for (const change of [
      { subscription_status: 'canceled' },
      { subscription_status: 'past_due' },
      { subscription_period_end: '2026-10-30T12:00:00Z' },
      { subscription_period_end: 'invalid' },
    ])
      assert.deepEqual(getSubscriptionAccess({ ...profile, ...change }, now), {
        progressCharts: false,
        learningInsights: false,
      });
  }
});
