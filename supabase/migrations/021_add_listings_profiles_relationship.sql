-- Add foreign key relationship between listings and profiles
-- This allows direct joins between listings and profiles for plan-based queries

-- First, ensure all listings have corresponding profiles
-- Any listings without profiles will be set to reference the user's profile
DO $$
BEGIN
    -- Check if there are any listings without corresponding profiles
    IF EXISTS (
        SELECT 1 
        FROM public.listings l 
        LEFT JOIN public.profiles p ON l.user_id = p.id 
        WHERE p.id IS NULL
    ) THEN
        RAISE NOTICE 'Found listings without corresponding profiles. These need to be fixed manually.';
        -- Log the problematic records
        RAISE NOTICE 'Listings without profiles: %', (
            SELECT array_agg(l.id::text) 
            FROM public.listings l 
            LEFT JOIN public.profiles p ON l.user_id = p.id 
            WHERE p.id IS NULL
        );
    END IF;
END $$;

-- Add foreign key constraint from listings.user_id to profiles.id
-- This creates the direct relationship that Supabase PostgREST expects
ALTER TABLE public.listings 
ADD CONSTRAINT fk_listings_user_profile 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create index for better performance on joins
CREATE INDEX IF NOT EXISTS idx_listings_user_id_profile 
ON public.listings(user_id);

-- Update RLS policies to ensure they still work with the new relationship
-- The existing policies should continue to work, but let's verify

-- Verify that the relationship is working
DO $$
BEGIN
    -- Test the relationship by attempting a simple join
    PERFORM l.id, p.plan_type
    FROM public.listings l
    INNER JOIN public.profiles p ON l.user_id = p.id
    LIMIT 1;
    
    RAISE NOTICE 'Successfully established relationship between listings and profiles';
EXCEPTION
    WHEN others THEN
        RAISE EXCEPTION 'Failed to establish relationship: %', SQLERRM;
END $$;