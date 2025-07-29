-- Create ad_images table for storing multiple images per ad
CREATE TABLE IF NOT EXISTS public.ad_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE public.ad_images ENABLE ROW LEVEL SECURITY;

-- Policies for ad_images
CREATE POLICY "Ad images are viewable by everyone" ON public.ad_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ads 
            WHERE ads.id = ad_images.ad_id 
            AND ads.status = 'active'
        )
    );

CREATE POLICY "Users can view own ad images" ON public.ad_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ads 
            WHERE ads.id = ad_images.ad_id 
            AND ads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert images for own ads" ON public.ad_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.ads 
            WHERE ads.id = ad_images.ad_id 
            AND ads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own ad images" ON public.ad_images
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.ads 
            WHERE ads.id = ad_images.ad_id 
            AND ads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own ad images" ON public.ad_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.ads 
            WHERE ads.id = ad_images.ad_id 
            AND ads.user_id = auth.uid()
        )
    );

-- Index for better performance
CREATE INDEX idx_ad_images_ad_id ON public.ad_images(ad_id);
CREATE INDEX idx_ad_images_display_order ON public.ad_images(ad_id, display_order);