-- Create ads table with national location fields
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES public.categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  price_type VARCHAR(20) DEFAULT 'daily' CHECK (price_type IN ('daily', 'hourly', 'event')),
  
  -- National location fields (mandatory)
  state VARCHAR(2) NOT NULL, -- State code (SP, RJ, etc.)
  city VARCHAR(100) NOT NULL, -- Full city name
  neighborhood VARCHAR(100), -- Neighborhood (optional)
  postal_code VARCHAR(10), -- ZIP code for distance calculations
  
  -- Equipment/space specific fields
  rental_period VARCHAR(50),
  specifications JSONB,
  availability_notes TEXT,
  delivery_available BOOLEAN DEFAULT false,
  delivery_fee DECIMAL(10,2),
  delivery_radius_km INTEGER DEFAULT 10, -- Delivery radius in km
  
  -- Status and metadata
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
  featured BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  contact_whatsapp VARCHAR(20),
  contact_phone VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger for ads updated_at
CREATE TRIGGER update_ads_updated_at 
    BEFORE UPDATE ON public.ads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment views
CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.ads 
    SET views_count = views_count + 1 
    WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Add RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Policies for ads
CREATE POLICY "Active ads are viewable by everyone" ON public.ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own ads" ON public.ads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ads" ON public.ads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ads" ON public.ads
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ads" ON public.ads
    FOR DELETE USING (auth.uid() = user_id);