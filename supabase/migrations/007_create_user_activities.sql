-- Create user_activities table for tracking all user actions
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'listing_created', 'review_received', 'listing_viewed', 'contact_made', etc.
  title VARCHAR(255) NOT NULL, -- Human readable title
  description TEXT, -- Detailed description
  related_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  related_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For activities involving other users
  metadata JSONB DEFAULT '{}', -- Additional data (ratings, counts, etc.)
  is_premium_feature BOOLEAN DEFAULT false, -- Whether this activity type is premium-only
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_type ON public.user_activities(activity_type);
CREATE INDEX idx_user_activities_listing ON public.user_activities(related_listing_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at DESC);
CREATE INDEX idx_user_activities_premium ON public.user_activities(is_premium_feature);

-- Composite index for user activities with premium filtering
CREATE INDEX idx_user_activities_user_premium_date 
  ON public.user_activities(user_id, is_premium_feature, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" ON public.user_activities
    FOR INSERT WITH CHECK (true); -- Allow system inserts

-- Function to create a new activity
CREATE OR REPLACE FUNCTION create_user_activity(
    user_id_param UUID,
    activity_type_param VARCHAR(50),
    title_param VARCHAR(255),
    description_param TEXT DEFAULT NULL,
    related_listing_id_param UUID DEFAULT NULL,
    related_user_id_param UUID DEFAULT NULL,
    metadata_param JSONB DEFAULT '{}',
    is_premium_feature_param BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.user_activities (
        user_id,
        activity_type,
        title,
        description,
        related_listing_id,
        related_user_id,
        metadata,
        is_premium_feature
    ) VALUES (
        user_id_param,
        activity_type_param,
        title_param,
        description_param,
        related_listing_id_param,
        related_user_id_param,
        metadata_param,
        is_premium_feature_param
    )
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recent activities for a user
CREATE OR REPLACE FUNCTION get_user_recent_activities(
    user_id_param UUID,
    limit_param INTEGER DEFAULT 10,
    include_premium BOOLEAN DEFAULT false
)
RETURNS TABLE (
    id UUID,
    activity_type VARCHAR(50),
    title VARCHAR(255),
    description TEXT,
    related_listing_id UUID,
    related_user_id UUID,
    metadata JSONB,
    is_premium_feature BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.activity_type,
        a.title,
        a.description,
        a.related_listing_id,
        a.related_user_id,
        a.metadata,
        a.is_premium_feature,
        a.created_at
    FROM public.user_activities a
    WHERE a.user_id = user_id_param
      AND (include_premium = true OR a.is_premium_feature = false)
    ORDER BY a.created_at DESC
    LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;