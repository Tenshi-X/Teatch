-- ============================================================
-- Teatch: Database Migration
-- Adding worksheet_quota to profiles
-- ============================================================

-- 1. Add new column to `profiles` table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS worksheet_quota INTEGER DEFAULT 10;

-- 2. Update existing profiles based on subscription tier
UPDATE profiles SET worksheet_quota = 10 WHERE subscription_tier = 'free_trial';
UPDATE profiles SET worksheet_quota = 300 WHERE subscription_tier = 'basic';
UPDATE profiles SET worksheet_quota = 500 WHERE subscription_tier = 'family';
UPDATE profiles SET worksheet_quota = 500 WHERE subscription_tier = 'teacher';

-- For users without a tier or null tier, default to 10
UPDATE profiles SET worksheet_quota = 10 WHERE subscription_tier IS NULL;

-- Make sure we also have a way for quota to decrement securely
-- Actually, the RLS on profiles already allows users to update their own profile, 
-- but ideally quota decrement is done via a secure function or in the server action.
-- Server actions in Next.js bypass RLS by using the service role key, or if using anon key, 
-- they can update their own row.
