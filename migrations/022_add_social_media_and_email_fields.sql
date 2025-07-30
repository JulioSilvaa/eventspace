-- Add missing contact fields to listings table
-- This migration adds support for email, Instagram and Facebook contact information

-- Add contact_email field
ALTER TABLE listings ADD COLUMN contact_email VARCHAR(255);

-- Add social media fields
ALTER TABLE listings ADD COLUMN contact_instagram VARCHAR(100);
ALTER TABLE listings ADD COLUMN contact_facebook VARCHAR(150);

-- Add comments to document the fields
COMMENT ON COLUMN listings.contact_email IS 'Email de contato opcional para o anunciante';
COMMENT ON COLUMN listings.contact_instagram IS 'Instagram do anunciante (@usuario ou URL completa)';
COMMENT ON COLUMN listings.contact_facebook IS 'Facebook do anunciante (URL da página/perfil)';