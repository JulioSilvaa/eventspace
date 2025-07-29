-- Increase contact field lengths to accommodate formatted phone numbers
ALTER TABLE public.ads 
ALTER COLUMN contact_whatsapp TYPE VARCHAR(25),
ALTER COLUMN contact_phone TYPE VARCHAR(25);

-- Also fix any existing data that might be truncated
UPDATE public.ads 
SET contact_whatsapp = NULL 
WHERE LENGTH(contact_whatsapp) >= 20;

UPDATE public.ads 
SET contact_phone = NULL 
WHERE LENGTH(contact_phone) >= 20;