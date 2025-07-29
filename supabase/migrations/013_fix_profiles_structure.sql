-- Fix profiles table structure to match TypeScript types and ensure proper API responses

-- Ensure ads_count can be null 
ALTER TABLE public.profiles 
ALTER COLUMN ads_count DROP NOT NULL;

-- Update any existing records that might have issues
UPDATE public.profiles 
SET ads_count = 0 
WHERE ads_count IS NULL;

-- Add indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON public.profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status_plan ON public.profiles(account_status, plan_type);

-- Ensure RLS policies are working correctly
-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate policies with better names and ensure they work
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add comment for debugging
COMMENT ON TABLE public.profiles IS 'User profiles with account status control - updated to fix API 406 errors';