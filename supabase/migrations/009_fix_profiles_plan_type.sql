-- Fix profiles table to remove trial system and enforce paid plans only
-- Update plan_type to allow NULL and only basic/premium values

-- First, remove the default value and allow NULL
ALTER TABLE public.profiles 
ALTER COLUMN plan_type DROP DEFAULT;

-- Allow NULL values
ALTER TABLE public.profiles 
ALTER COLUMN plan_type DROP NOT NULL;

-- Add constraint to only allow basic, premium, or NULL
ALTER TABLE public.profiles 
ADD CONSTRAINT check_plan_type 
CHECK (plan_type IS NULL OR plan_type IN ('basic', 'premium'));

-- Update existing 'trial' or 'free' records to NULL (users must choose a paid plan)
UPDATE public.profiles 
SET plan_type = NULL 
WHERE plan_type IN ('trial', 'free');

-- Add ads_count column if it doesn't exist (for plan limits)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ads_count INTEGER DEFAULT 0;