-- Remove null constraint and ensure consistent plan_type values
-- This migration makes plan_type NOT NULL and aligns with the payment flow

-- First, update any existing null values to 'free' (should not exist but safety first)
UPDATE public.profiles 
SET plan_type = 'free' 
WHERE plan_type IS NULL;

-- Update 'trial' values to 'free' to match TypeScript types
UPDATE public.profiles 
SET plan_type = 'free' 
WHERE plan_type = 'trial';

-- Alter the column to be NOT NULL with default 'free'
ALTER TABLE public.profiles 
ALTER COLUMN plan_type SET NOT NULL,
ALTER COLUMN plan_type SET DEFAULT 'free';

-- Add constraint to ensure only valid plan types
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_plan_types 
CHECK (plan_type IN ('free', 'basic', 'premium'));

-- Add comment explaining the flow
COMMENT ON COLUMN public.profiles.plan_type IS 'Plan type set to free by default, upgraded to basic/premium only after successful payment';