-- Create performance indexes for national platform optimization

-- Ads table indexes for location-based searches
CREATE INDEX IF NOT EXISTS idx_ads_state_city ON public.ads(state, city);
CREATE INDEX IF NOT EXISTS idx_ads_location_active ON public.ads(state, city, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ads_category_location ON public.ads(category_id, state, city);
CREATE INDEX IF NOT EXISTS idx_ads_featured ON public.ads(featured, status) WHERE featured = true AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_ads_price ON public.ads(price);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_user_status ON public.ads(user_id, status);

-- Full-text search index for ads
CREATE INDEX IF NOT EXISTS idx_ads_search ON public.ads USING gin(to_tsvector('portuguese', title || ' ' || description));

-- Profiles table indexes for location
CREATE INDEX IF NOT EXISTS idx_profiles_state_city ON public.profiles(state, city);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON public.profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_expires ON public.profiles(plan_expires_at) WHERE plan_expires_at IS NOT NULL;

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_status ON public.payments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_expires_status ON public.payments(expires_at, status) WHERE status = 'completed';

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ads_category_state_price ON public.ads(category_id, state, price) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_ads_delivery_location ON public.ads(delivery_available, state, city) WHERE delivery_available = true AND status = 'active';

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_active_featured ON public.ads(created_at DESC) WHERE status = 'active' AND featured = true;
CREATE INDEX IF NOT EXISTS idx_ads_active_recent ON public.ads(created_at DESC) WHERE status = 'active' AND created_at > NOW() - INTERVAL '30 days';

-- Function-based index for case-insensitive city searches
CREATE INDEX IF NOT EXISTS idx_ads_city_lower ON public.ads(LOWER(city)) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_profiles_city_lower ON public.profiles(LOWER(city));