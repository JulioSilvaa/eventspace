-- Add account_status field to control account activation
-- Users start as 'inactive' and become 'active' only after first payment

-- Add the account_status column
ALTER TABLE public.profiles 
ADD COLUMN account_status VARCHAR(20) NOT NULL DEFAULT 'inactive';

-- Add constraint to ensure only valid status values
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_account_status 
CHECK (account_status IN ('inactive', 'active'));

-- Update existing users to have 'active' status if they already have a paid plan
UPDATE public.profiles 
SET account_status = 'active' 
WHERE plan_type IN ('basic', 'premium');

-- Add comment explaining the new field
COMMENT ON COLUMN public.profiles.account_status IS 'Account activation status: inactive (just registered, no payment) or active (payment confirmed, can access dashboard)';

-- Create index for better query performance
CREATE INDEX idx_profiles_account_status ON public.profiles(account_status);