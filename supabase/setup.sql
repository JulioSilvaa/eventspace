-- EventSpace Database Setup Script
-- Execute this file in Supabase SQL Editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Execute all migrations in order
\i 001_create_profiles.sql
\i 002_create_categories.sql
\i 003_create_ads.sql
\i 004_create_ad_images.sql
\i 005_create_payments.sql
\i 006_create_brazilian_states.sql
\i 007_create_performance_indexes.sql
\i 012_create_profile_on_signup.sql

-- Verify setup
SELECT 'Database setup completed successfully!' as status;