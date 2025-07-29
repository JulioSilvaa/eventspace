-- Add consent tracking fields to profiles table for quick reference
-- These fields provide fast access to consent status without joining consent_records

-- Add consent reference fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  terms_accepted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  privacy_accepted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  terms_version VARCHAR(20);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  privacy_version VARCHAR(20);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  marketing_consent BOOLEAN DEFAULT false;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS 
  marketing_consent_at TIMESTAMP WITH TIME ZONE;

-- Add index for consent queries
CREATE INDEX IF NOT EXISTS idx_profiles_consent_status ON public.profiles(terms_accepted_at, privacy_accepted_at);

-- Create function to update profile consent fields when consent_records change
CREATE OR REPLACE FUNCTION update_profile_consent_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update profile fields based on consent type
    IF NEW.consent_type = 'terms_of_service' AND NEW.consent_given = true THEN
        UPDATE public.profiles 
        SET 
            terms_accepted_at = NEW.consent_timestamp,
            terms_version = NEW.document_version,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    IF NEW.consent_type = 'privacy_policy' AND NEW.consent_given = true THEN
        UPDATE public.profiles 
        SET 
            privacy_accepted_at = NEW.consent_timestamp,
            privacy_version = NEW.document_version,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    IF NEW.consent_type = 'marketing' THEN
        UPDATE public.profiles 
        SET 
            marketing_consent = NEW.consent_given,
            marketing_consent_at = NEW.consent_timestamp,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    -- Handle withdrawal (update trigger for withdrawal_timestamp)
    IF TG_OP = 'UPDATE' AND OLD.withdrawal_timestamp IS NULL AND NEW.withdrawal_timestamp IS NOT NULL THEN
        IF NEW.consent_type = 'terms_of_service' THEN
            UPDATE public.profiles 
            SET 
                terms_accepted_at = NULL,
                terms_version = NULL,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
        
        IF NEW.consent_type = 'privacy_policy' THEN
            UPDATE public.profiles 
            SET 
                privacy_accepted_at = NULL,
                privacy_version = NULL,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
        
        IF NEW.consent_type = 'marketing' THEN
            UPDATE public.profiles 
            SET 
                marketing_consent = false,
                marketing_consent_at = NEW.withdrawal_timestamp,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically update profile consent fields
CREATE TRIGGER update_profile_on_consent_insert
    AFTER INSERT ON public.consent_records
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_consent_status();

CREATE TRIGGER update_profile_on_consent_update
    AFTER UPDATE ON public.consent_records
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_consent_status();

-- Create a view to check if user has valid consents
CREATE OR REPLACE VIEW public.user_consent_status AS
SELECT 
    p.id as user_id,
    p.terms_accepted_at,
    p.privacy_accepted_at,
    p.terms_version,
    p.privacy_version,
    p.marketing_consent,
    p.marketing_consent_at,
    CASE 
        WHEN p.terms_accepted_at IS NOT NULL 
             AND p.privacy_accepted_at IS NOT NULL 
        THEN true 
        ELSE false 
    END as has_required_consents,
    CASE 
        WHEN p.terms_version = '1.0' AND p.privacy_version = '1.0'
        THEN true
        ELSE false
    END as has_current_consent_versions
FROM public.profiles p;

-- Set security invoker for the view
ALTER VIEW public.user_consent_status SET (security_invoker = true);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Timestamp when user accepted current terms of service';
COMMENT ON COLUMN public.profiles.privacy_accepted_at IS 'Timestamp when user accepted current privacy policy';
COMMENT ON COLUMN public.profiles.terms_version IS 'Version of terms of service accepted';
COMMENT ON COLUMN public.profiles.privacy_version IS 'Version of privacy policy accepted';
COMMENT ON COLUMN public.profiles.marketing_consent IS 'Current marketing communication consent status';
COMMENT ON COLUMN public.profiles.marketing_consent_at IS 'Timestamp of last marketing consent change';