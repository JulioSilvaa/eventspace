-- Create activity_events table for real-time event tracking
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- 'view', 'contact_whatsapp', 'contact_phone', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_activity_events_listing_id ON public.activity_events(listing_id);
CREATE INDEX idx_activity_events_user_id ON public.activity_events(user_id);
CREATE INDEX idx_activity_events_type ON public.activity_events(event_type);
CREATE INDEX idx_activity_events_created_at ON public.activity_events(created_at DESC);

-- Composite index for listing events with date filtering
CREATE INDEX idx_activity_events_listing_date 
  ON public.activity_events(listing_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view events for their listings" ON public.activity_events
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM public.listings WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert events" ON public.activity_events
    FOR INSERT WITH CHECK (true); -- Allow system inserts

-- Function to create user activity from activity event (bridge between systems)
CREATE OR REPLACE FUNCTION process_activity_event()
RETURNS TRIGGER AS $$
DECLARE
    listing_owner_id UUID;
    listing_title VARCHAR(255);
    activity_title VARCHAR(255);
    activity_description TEXT;
BEGIN
    -- Get listing owner and title
    SELECT l.user_id, l.title
    INTO listing_owner_id, listing_title
    FROM public.listings l
    WHERE l.id = NEW.listing_id;
    
    -- Only create user activity for significant events
    CASE NEW.event_type
        WHEN 'view' THEN
            RETURN NEW; -- Views are handled by listing view triggers for milestones only
            
        WHEN 'contact_whatsapp' THEN
            activity_title := '📱 Contato WhatsApp';
            activity_description := 'Alguém entrou em contato via WhatsApp sobre "' || listing_title || '"';
            
        WHEN 'contact_phone' THEN
            activity_title := '📞 Ligação recebida';
            activity_description := 'Alguém ligou sobre "' || listing_title || '"';
            
        WHEN 'contact_email' THEN
            activity_title := '📧 Contato por email';
            activity_description := 'Alguém enviou um email sobre "' || listing_title || '"';
            
        WHEN 'favorite_add' THEN
            activity_title := '⭐ Novo favorito';
            activity_description := '"' || listing_title || '" foi adicionado aos favoritos';
            
        WHEN 'review_add' THEN
            activity_title := '💬 Nova avaliação';
            activity_description := 'Você recebeu uma nova avaliação em "' || listing_title || '"';
            
        WHEN 'share' THEN
            activity_title := '🔗 Compartilhamento';
            activity_description := '"' || listing_title || '" foi compartilhado';
            
        WHEN 'listing_created' THEN
            activity_title := '🎉 Anúncio Publicado';
            activity_description := '"' || listing_title || '" foi publicado com sucesso';
            
        WHEN 'listing_updated' THEN
            activity_title := '✏️ Anúncio Atualizado';
            activity_description := '"' || listing_title || '" foi atualizado';
            
        WHEN 'price_updated' THEN
            activity_title := '💰 Preço Atualizado';
            activity_description := 'Preço de "' || listing_title || '" foi alterado';
            
        WHEN 'photos_updated' THEN
            activity_title := '📸 Fotos Atualizadas';
            activity_description := 'Fotos de "' || listing_title || '" foram atualizadas';
            
        WHEN 'description_updated' THEN
            activity_title := '📝 Descrição Atualizada';
            activity_description := 'Descrição de "' || listing_title || '" foi atualizada';
            
        WHEN 'contact_updated' THEN
            activity_title := '📞 Contato Atualizado';
            activity_description := 'Informações de contato de "' || listing_title || '" foram atualizadas';
            
        ELSE
            RETURN NEW; -- Skip unknown event types
    END CASE;
    
    -- Create user activity for the listing owner
    IF listing_owner_id IS NOT NULL AND activity_title IS NOT NULL THEN
        PERFORM create_user_activity(
            listing_owner_id,
            NEW.event_type,
            activity_title,
            activity_description,
            NEW.listing_id,
            NEW.user_id,
            NEW.metadata,
            false -- Most events are not premium-only
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to process activity events into user activities
CREATE TRIGGER trigger_process_activity_event
    AFTER INSERT ON public.activity_events
    FOR EACH ROW
    EXECUTE FUNCTION process_activity_event();