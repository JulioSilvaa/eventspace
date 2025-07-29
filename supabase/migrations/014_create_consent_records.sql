-- Create consent records table for LGPD compliance
-- Stores detailed consent records for terms of service, privacy policy, and marketing

CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('terms_of_service', 'privacy_policy', 'marketing')),
  consent_given BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  document_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  withdrawal_timestamp TIMESTAMP WITH TIME ZONE,
  withdrawal_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_consent_type ON public.consent_records(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_records_timestamp ON public.consent_records(consent_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_consent_records_user_type ON public.consent_records(user_id, consent_type);

-- Add trigger for updated_at
CREATE TRIGGER update_consent_records_updated_at 
    BEFORE UPDATE ON public.consent_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "consent_records_select_own" ON public.consent_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "consent_records_insert_own" ON public.consent_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only allow updates for withdrawing consent (setting withdrawal_timestamp)
CREATE POLICY "consent_records_update_withdrawal" ON public.consent_records
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND withdrawal_timestamp IS NULL 
        AND NEW.withdrawal_timestamp IS NOT NULL
    );

-- Admin access (for compliance reporting)
CREATE POLICY "consent_records_admin_access" ON public.consent_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND plan_type = 'admin'
        )
    );

-- Add comment for documentation
COMMENT ON TABLE public.consent_records IS 'LGPD compliant consent records for terms of service, privacy policy and marketing communications. Provides full audit trail for compliance.';

-- Add constraints for data integrity
ALTER TABLE public.consent_records 
ADD CONSTRAINT valid_withdrawal_logic 
CHECK (
    (withdrawal_timestamp IS NULL AND withdrawal_reason IS NULL) OR
    (withdrawal_timestamp IS NOT NULL AND consent_given = true)
);

-- Create view for latest consent status per user/type
CREATE OR REPLACE VIEW public.latest_consent_status AS
SELECT DISTINCT ON (user_id, consent_type)
    user_id,
    consent_type,
    consent_given,
    consent_timestamp,
    document_version,
    withdrawal_timestamp,
    CASE 
        WHEN withdrawal_timestamp IS NOT NULL THEN false
        ELSE consent_given
    END as current_status
FROM public.consent_records
ORDER BY user_id, consent_type, consent_timestamp DESC;

-- Add RLS to the view
ALTER VIEW public.latest_consent_status SET (security_invoker = true);