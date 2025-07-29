-- Rename ads table to listings and ad_images to listing_images to match frontend code

-- First, drop existing triggers
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
DROP TRIGGER IF EXISTS trigger_listing_created_activity ON public.ads;
DROP TRIGGER IF EXISTS trigger_listing_viewed_activity ON public.ads;

-- Rename the tables
ALTER TABLE public.ads RENAME TO listings;
ALTER TABLE public.ad_images RENAME TO listing_images;

-- Update the foreign key column name in listing_images
ALTER TABLE public.listing_images RENAME COLUMN ad_id TO listing_id;

-- Recreate the updated_at trigger for listings
CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON public.listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Recreate activity triggers for the renamed table
CREATE TRIGGER trigger_listing_created_activity
    AFTER INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_listing_created_activity();

CREATE TRIGGER trigger_listing_viewed_activity
    AFTER UPDATE OF views_count ON public.listings
    FOR EACH ROW
    WHEN (NEW.views_count > OLD.views_count)
    EXECUTE FUNCTION trigger_listing_viewed_activity();

-- Update the increment_ad_views function to work with listings table
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.listings 
    SET views_count = views_count + 1 
    WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function for deleting listings (to handle ad blockers)
CREATE OR REPLACE FUNCTION delete_user_listing(listing_id UUID)
RETURNS JSON AS $$
DECLARE
    current_user_id UUID;
    listing_owner_id UUID;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Não autenticado');
    END IF;
    
    -- Get listing owner
    SELECT user_id INTO listing_owner_id
    FROM public.listings
    WHERE id = listing_id;
    
    IF listing_owner_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Anúncio não encontrado');
    END IF;
    
    -- Check if user owns the listing
    IF current_user_id != listing_owner_id THEN
        RETURN json_build_object('success', false, 'error', 'Não autorizado');
    END IF;
    
    -- Delete listing images first
    DELETE FROM public.listing_images WHERE listing_id = listing_id;
    
    -- Delete the listing
    DELETE FROM public.listings WHERE id = listing_id;
    
    RETURN json_build_object('success', true);
EXCEPTION
    WHEN others THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update indexes that reference the old table names
-- Note: PostgreSQL automatically updates index names when tables are renamed

-- Verify the rename was successful by checking table existence
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings' AND table_schema = 'public') THEN
        RAISE NOTICE 'Successfully renamed ads table to listings';
    ELSE
        RAISE EXCEPTION 'Failed to rename ads table to listings';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listing_images' AND table_schema = 'public') THEN
        RAISE NOTICE 'Successfully renamed ad_images table to listing_images';
    ELSE
        RAISE EXCEPTION 'Failed to rename ad_images table to listing_images';
    END IF;
END $$;