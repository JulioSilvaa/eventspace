-- Create reviews table for listing reviews and ratings
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous reviews
  reviewer_name VARCHAR(100) NOT NULL, -- Name from profile or manually entered for anonymous
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_listing_id ON public.reviews(listing_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);

-- Create compound index for preventing duplicate reviews from same user
CREATE UNIQUE INDEX idx_reviews_user_listing_unique 
  ON public.reviews(listing_id, user_id) 
  WHERE user_id IS NOT NULL;

-- Create trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (
        -- Allow if user is authenticated and matches user_id, or if anonymous (user_id is null)
        (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
        (auth.uid() IS NULL AND user_id IS NULL)
    );

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND auth.uid() = user_id
    );

CREATE POLICY "Users can delete own reviews" ON public.reviews
    FOR DELETE USING (
        auth.uid() IS NOT NULL AND auth.uid() = user_id
    );

-- Function to calculate average rating for a listing
CREATE OR REPLACE FUNCTION calculate_listing_rating(listing_id_param UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT ROUND(AVG(rating::DECIMAL), 2)
    INTO avg_rating
    FROM public.reviews
    WHERE listing_id = listing_id_param;
    
    RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get review count for a listing
CREATE OR REPLACE FUNCTION get_listing_review_count(listing_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    review_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO review_count
    FROM public.reviews
    WHERE listing_id = listing_id_param;
    
    RETURN COALESCE(review_count, 0);
END;
$$ LANGUAGE plpgsql;