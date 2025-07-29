-- Create listing_analytics table for performance metrics and insights
CREATE TABLE IF NOT EXISTS public.listing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- View metrics
  views_count INTEGER DEFAULT 0,
  unique_views_count INTEGER DEFAULT 0,
  
  -- Contact metrics
  contact_clicks INTEGER DEFAULT 0,
  whatsapp_clicks INTEGER DEFAULT 0,
  phone_clicks INTEGER DEFAULT 0,
  
  -- Geographic data (Premium feature)
  top_viewer_states JSONB DEFAULT '[]', -- [{"state": "SP", "count": 15}, ...]
  top_viewer_cities JSONB DEFAULT '[]', -- [{"city": "São Paulo", "state": "SP", "count": 10}, ...]
  
  -- Performance insights (Premium feature) 
  conversion_rate DECIMAL(5,2) DEFAULT 0, -- contacts/views * 100
  engagement_score INTEGER DEFAULT 0, -- 0-100 based on various factors
  
  -- Competitor analysis (Premium feature)
  category_avg_views INTEGER DEFAULT 0,
  category_avg_contacts INTEGER DEFAULT 0,
  performance_vs_category DECIMAL(5,2) DEFAULT 0, -- percentage difference
  
  -- Review metrics
  reviews_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_listing_analytics_listing_id ON public.listing_analytics(listing_id);
CREATE INDEX idx_listing_analytics_date ON public.listing_analytics(date DESC);
CREATE INDEX idx_listing_analytics_listing_date ON public.listing_analytics(listing_id, date DESC);

-- Unique constraint to prevent duplicate daily records
CREATE UNIQUE INDEX idx_listing_analytics_listing_date_unique 
  ON public.listing_analytics(listing_id, date);

-- Create trigger for updated_at
CREATE TRIGGER update_listing_analytics_updated_at 
    BEFORE UPDATE ON public.listing_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own listing analytics" ON public.listing_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings l 
            WHERE l.id = listing_id AND l.user_id = auth.uid()
        )
    );

CREATE POLICY "System can manage analytics" ON public.listing_analytics
    FOR ALL USING (true); -- Allow system operations

-- Function to update or create daily analytics
CREATE OR REPLACE FUNCTION upsert_listing_analytics(
    listing_id_param UUID,
    views_increment INTEGER DEFAULT 0,
    contact_increment INTEGER DEFAULT 0,
    whatsapp_increment INTEGER DEFAULT 0,
    phone_increment INTEGER DEFAULT 0,
    viewer_state VARCHAR(2) DEFAULT NULL,
    viewer_city VARCHAR(100) DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    today DATE := CURRENT_DATE;
    current_states JSONB;
    current_cities JSONB;
    state_found BOOLEAN := false;
    city_found BOOLEAN := false;
    updated_states JSONB;
    updated_cities JSONB;
BEGIN
    -- Insert or update daily analytics
    INSERT INTO public.listing_analytics (
        listing_id,
        date,
        views_count,
        contact_clicks,
        whatsapp_clicks,
        phone_clicks
    ) VALUES (
        listing_id_param,
        today,
        views_increment,
        contact_increment,
        whatsapp_increment,
        phone_increment
    )
    ON CONFLICT (listing_id, date)
    DO UPDATE SET
        views_count = listing_analytics.views_count + views_increment,
        contact_clicks = listing_analytics.contact_clicks + contact_increment,
        whatsapp_clicks = listing_analytics.whatsapp_clicks + whatsapp_increment,
        phone_clicks = listing_analytics.phone_clicks + phone_increment,
        updated_at = NOW();
    
    -- Update geographic data if provided
    IF viewer_state IS NOT NULL THEN
        -- Get current states data
        SELECT COALESCE(top_viewer_states, '[]'::jsonb)
        INTO current_states
        FROM public.listing_analytics
        WHERE listing_id = listing_id_param AND date = today;
        
        -- Update state count
        SELECT jsonb_agg(
            CASE 
                WHEN item->>'state' = viewer_state THEN
                    jsonb_set(item, '{count}', ((item->>'count')::int + 1)::text::jsonb)
                ELSE item
            END
        ), bool_or(item->>'state' = viewer_state)
        INTO updated_states, state_found
        FROM jsonb_array_elements(current_states) item;
        
        -- Add new state if not found
        IF NOT state_found THEN
            updated_states := COALESCE(updated_states, '[]'::jsonb) || 
                jsonb_build_array(jsonb_build_object('state', viewer_state, 'count', 1));
        END IF;
        
        -- Update city data if provided
        IF viewer_city IS NOT NULL THEN
            SELECT COALESCE(top_viewer_cities, '[]'::jsonb)
            INTO current_cities
            FROM public.listing_analytics
            WHERE listing_id = listing_id_param AND date = today;
            
            SELECT jsonb_agg(
                CASE 
                    WHEN item->>'city' = viewer_city AND item->>'state' = viewer_state THEN
                        jsonb_set(item, '{count}', ((item->>'count')::int + 1)::text::jsonb)
                    ELSE item
                END
            ), bool_or(item->>'city' = viewer_city AND item->>'state' = viewer_state)
            INTO updated_cities, city_found
            FROM jsonb_array_elements(current_cities) item;
            
            IF NOT city_found THEN
                updated_cities := COALESCE(updated_cities, '[]'::jsonb) || 
                    jsonb_build_array(jsonb_build_object('city', viewer_city, 'state', viewer_state, 'count', 1));
            END IF;
        END IF;
        
        -- Update the record with new geographic data
        UPDATE public.listing_analytics
        SET 
            top_viewer_states = updated_states,
            top_viewer_cities = COALESCE(updated_cities, top_viewer_cities),
            updated_at = NOW()
        WHERE listing_id = listing_id_param AND date = today;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate and update performance metrics (Premium feature)
CREATE OR REPLACE FUNCTION update_listing_performance_metrics(listing_id_param UUID)
RETURNS void AS $$
DECLARE
    total_views INTEGER;
    total_contacts INTEGER;
    calc_conversion_rate DECIMAL(5,2);
    calc_engagement_score INTEGER;
    category_id_val INTEGER;
    avg_category_views INTEGER;
    avg_category_contacts INTEGER;
    performance_diff DECIMAL(5,2);
BEGIN
    -- Get listing category
    SELECT category_id INTO category_id_val
    FROM public.listings
    WHERE id = listing_id_param;
    
    -- Calculate totals from analytics
    SELECT 
        COALESCE(SUM(views_count), 0),
        COALESCE(SUM(contact_clicks + whatsapp_clicks + phone_clicks), 0)
    INTO total_views, total_contacts
    FROM public.listing_analytics
    WHERE listing_id = listing_id_param
      AND date >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Calculate conversion rate
    calc_conversion_rate := CASE 
        WHEN total_views > 0 THEN (total_contacts::DECIMAL / total_views * 100)
        ELSE 0 
    END;
    
    -- Calculate engagement score (simplified algorithm)
    calc_engagement_score := LEAST(100, 
        (total_views * 0.3 + total_contacts * 2.0 + 
         COALESCE((SELECT COUNT(*) FROM public.reviews WHERE listing_id = listing_id_param), 0) * 5.0)::INTEGER
    );
    
    -- Get category averages
    SELECT 
        COALESCE(AVG(a.views_count), 0)::INTEGER,
        COALESCE(AVG(a.contact_clicks + a.whatsapp_clicks + a.phone_clicks), 0)::INTEGER
    INTO avg_category_views, avg_category_contacts
    FROM public.listing_analytics a
    JOIN public.listings l ON a.listing_id = l.id
    WHERE l.category_id = category_id_val
      AND a.date >= CURRENT_DATE - INTERVAL '30 days';
    
    -- Calculate performance vs category
    performance_diff := CASE 
        WHEN avg_category_views > 0 THEN 
            ((total_views::DECIMAL / 30 - avg_category_views) / avg_category_views * 100)
        ELSE 0 
    END;
    
    -- Update today's analytics with calculated metrics
    UPDATE public.listing_analytics
    SET 
        conversion_rate = calc_conversion_rate,
        engagement_score = calc_engagement_score,
        category_avg_views = avg_category_views,
        category_avg_contacts = avg_category_contacts,
        performance_vs_category = performance_diff,
        updated_at = NOW()
    WHERE listing_id = listing_id_param 
      AND date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;