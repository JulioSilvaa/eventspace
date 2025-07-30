-- Add contact_email field to listings table
-- This migration adds support for email contact information in listings

ALTER TABLE listings ADD COLUMN contact_email VARCHAR(255);

-- Add comment to document the field
COMMENT ON COLUMN listings.contact_email IS 'Email de contato opcional para o anunciante';