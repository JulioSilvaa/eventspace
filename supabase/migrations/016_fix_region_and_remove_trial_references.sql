-- Fix region mapping and remove remaining trial system references
-- This migration addresses two issues:
-- 1. Region column is NULL because it's not being populated during registration
-- 2. Remaining references to trial system that should be removed

-- First, create a function to map state codes to regions
CREATE OR REPLACE FUNCTION get_region_from_state(state_code VARCHAR(2))
RETURNS VARCHAR(20) AS $$
BEGIN
    RETURN CASE state_code
        -- Norte
        WHEN 'AC' THEN 'Norte'
        WHEN 'AP' THEN 'Norte' 
        WHEN 'AM' THEN 'Norte'
        WHEN 'PA' THEN 'Norte'
        WHEN 'RO' THEN 'Norte'
        WHEN 'RR' THEN 'Norte'
        WHEN 'TO' THEN 'Norte'
        
        -- Nordeste
        WHEN 'AL' THEN 'Nordeste'
        WHEN 'BA' THEN 'Nordeste'
        WHEN 'CE' THEN 'Nordeste'
        WHEN 'MA' THEN 'Nordeste'
        WHEN 'PB' THEN 'Nordeste'
        WHEN 'PE' THEN 'Nordeste'
        WHEN 'PI' THEN 'Nordeste'
        WHEN 'RN' THEN 'Nordeste'
        WHEN 'SE' THEN 'Nordeste'
        
        -- Centro-Oeste
        WHEN 'DF' THEN 'Centro-Oeste'
        WHEN 'GO' THEN 'Centro-Oeste'
        WHEN 'MT' THEN 'Centro-Oeste'
        WHEN 'MS' THEN 'Centro-Oeste'
        
        -- Sudeste
        WHEN 'ES' THEN 'Sudeste'
        WHEN 'MG' THEN 'Sudeste'
        WHEN 'RJ' THEN 'Sudeste'
        WHEN 'SP' THEN 'Sudeste'
        
        -- Sul
        WHEN 'PR' THEN 'Sul'
        WHEN 'RS' THEN 'Sul'
        WHEN 'SC' THEN 'Sul'
        
        ELSE 'Sudeste' -- Default fallback
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update all existing profiles with NULL region
UPDATE public.profiles 
SET region = get_region_from_state(state)
WHERE region IS NULL AND state IS NOT NULL;

-- Create trigger to automatically populate region when state is inserted/updated
CREATE OR REPLACE FUNCTION auto_populate_region()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update region if state changed or region is null
    IF NEW.state IS NOT NULL AND (OLD.state IS DISTINCT FROM NEW.state OR NEW.region IS NULL) THEN
        NEW.region = get_region_from_state(NEW.state);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS auto_populate_region_trigger ON public.profiles;

-- Create the trigger
CREATE TRIGGER auto_populate_region_trigger
    BEFORE INSERT OR UPDATE OF state ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_populate_region();

-- Update the plan_type constraint to be more explicit about allowed values
-- First drop the existing constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_plan_type;

-- Add updated constraint that only allows basic, premium (no trial/free references)
ALTER TABLE public.profiles 
ADD CONSTRAINT check_plan_type_final 
CHECK (plan_type IS NULL OR plan_type IN ('basic', 'premium'));

-- Remove any remaining trial/free references from existing data
UPDATE public.profiles 
SET plan_type = NULL 
WHERE plan_type NOT IN ('basic', 'premium');

-- Update account_status constraint to make sure it's consistent
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_account_status;
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_account_status_final
CHECK (account_status IN ('inactive', 'active'));

-- Ensure all users have a valid account_status (default to inactive if null)
UPDATE public.profiles 
SET account_status = 'inactive' 
WHERE account_status IS NULL;

-- Make account_status NOT NULL now that all records have a value
ALTER TABLE public.profiles 
ALTER COLUMN account_status SET NOT NULL;

-- Add helpful comments
COMMENT ON FUNCTION get_region_from_state(VARCHAR) IS 'Maps Brazilian state codes to their respective regions';
COMMENT ON FUNCTION auto_populate_region() IS 'Trigger function to automatically populate region based on state';

-- Create index on region for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_region ON public.profiles(region);
CREATE INDEX IF NOT EXISTS idx_profiles_state_region ON public.profiles(state, region);

-- Verification query to check the fix worked
-- This will show a count of profiles by region
DO $$
DECLARE
    region_counts TEXT;
BEGIN
    SELECT string_agg(
        region || ': ' || count::text, 
        ', ' 
        ORDER BY region
    ) INTO region_counts
    FROM (
        SELECT region, COUNT(*) as count 
        FROM public.profiles 
        WHERE region IS NOT NULL 
        GROUP BY region
    ) AS counts;
    
    RAISE NOTICE 'Region distribution after fix: %', region_counts;
END $$;