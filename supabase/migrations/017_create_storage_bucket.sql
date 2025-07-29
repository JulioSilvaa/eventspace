-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ad-images',
  'ad-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload ad images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ad-images');

-- Create policy for users to view all images (public bucket)
CREATE POLICY "Anyone can view ad images" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'ad-images');

-- Create policy for users to update their own images
CREATE POLICY "Users can update own ad images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'ad-images' AND
    EXISTS (
      SELECT 1 FROM public.ads a
      JOIN public.ad_images ai ON a.id = ai.ad_id
      WHERE ai.image_url LIKE '%' || storage.objects.name
      AND a.user_id = auth.uid()
    )
  );

-- Create policy for users to delete their own images
CREATE POLICY "Users can delete own ad images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'ad-images' AND
    EXISTS (
      SELECT 1 FROM public.ads a
      JOIN public.ad_images ai ON a.id = ai.ad_id
      WHERE ai.image_url LIKE '%' || storage.objects.name
      AND a.user_id = auth.uid()
    )
  );