-- ============================================================
-- Teatch: Database Migration
-- Adding Onboarding & Subscription Tiers
-- ============================================================

-- 1. Add new columns to `profiles` table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free_trial' CHECK (subscription_tier IN ('free_trial', 'basic', 'family', 'teacher')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscription_period_start TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ;

-- 2. Update existing profiles to be onboarded (so existing users aren't locked out)
UPDATE profiles SET is_onboarded = true WHERE is_onboarded = false;

-- 3. Set a default 30-day period end for existing users in free_trial
UPDATE profiles SET subscription_period_end = NOW() + INTERVAL '30 days' WHERE subscription_period_end IS NULL;
