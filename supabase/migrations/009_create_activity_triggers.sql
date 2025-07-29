-- Create triggers for automatic activity logging

-- Trigger function for when a new listing is created
CREATE OR REPLACE FUNCTION trigger_listing_created_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Create activity for listing creation
    PERFORM create_user_activity(
        NEW.user_id,
        'listing_created',
        'Anúncio publicado com sucesso',
        'Seu anúncio "' || NEW.title || '" foi publicado e já está visível para outros usuários.',
        NEW.id,
        NULL,
        jsonb_build_object(
            'listing_title', NEW.title,
            'category_id', NEW.category_id,
            'price', NEW.price,
            'price_type', NEW.price_type,
            'location', NEW.city || ', ' || NEW.state
        ),
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for when a review is created  
CREATE OR REPLACE FUNCTION trigger_review_received_activity()
RETURNS TRIGGER AS $$
DECLARE
    listing_owner_id UUID;
    listing_title VARCHAR(255);
    user_plan_type VARCHAR(20);
    is_premium BOOLEAN := false;
BEGIN
    -- Get listing owner and title
    SELECT l.user_id, l.title
    INTO listing_owner_id, listing_title
    FROM public.listings l
    WHERE l.id = NEW.listing_id;
    
    -- Get user plan type to determine if this is a premium feature
    SELECT p.plan_type
    INTO user_plan_type
    FROM public.profiles p
    WHERE p.id = listing_owner_id;
    
    is_premium := (user_plan_type = 'premium');
    
    -- Create activity for the listing owner
    PERFORM create_user_activity(
        listing_owner_id,
        'review_received',
        CASE 
            WHEN NEW.rating >= 4 THEN 'Nova avaliação positiva recebida! ⭐'
            WHEN NEW.rating = 3 THEN 'Nova avaliação recebida'
            ELSE 'Nova avaliação recebida'
        END,
        'Seu anúncio "' || listing_title || '" recebeu uma avaliação de ' || NEW.rating || ' estrelas' ||
        CASE 
            WHEN NEW.comment IS NOT NULL THEN ' com comentário: "' || LEFT(NEW.comment, 100) || '"'
            ELSE ''
        END,
        NEW.listing_id,
        NEW.user_id,
        jsonb_build_object(
            'rating', NEW.rating,
            'has_comment', (NEW.comment IS NOT NULL),
            'reviewer_name', NEW.reviewer_name,
            'listing_title', listing_title,
            'sentiment', CASE 
                WHEN NEW.rating >= 4 THEN 'positive'
                WHEN NEW.rating = 3 THEN 'neutral' 
                ELSE 'negative'
            END
        ),
        is_premium
    );
    
    -- Update listing analytics with review data
    UPDATE public.listing_analytics
    SET 
        reviews_count = (
            SELECT COUNT(*) FROM public.reviews r2 
            WHERE r2.listing_id = NEW.listing_id
        ),
        average_rating = (
            SELECT ROUND(AVG(rating::DECIMAL), 2)
            FROM public.reviews r2
            WHERE r2.listing_id = NEW.listing_id
        ),
        updated_at = NOW()
    WHERE listing_id = NEW.listing_id 
      AND date = CURRENT_DATE;
    
    -- Create analytics record if it doesn't exist for today
    INSERT INTO public.listing_analytics (listing_id, date, reviews_count, average_rating)
    SELECT 
        NEW.listing_id,
        CURRENT_DATE,
        1,
        NEW.rating
    WHERE NOT EXISTS (
        SELECT 1 FROM public.listing_analytics 
        WHERE listing_id = NEW.listing_id AND date = CURRENT_DATE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for listing views (called when views_count is updated)
CREATE OR REPLACE FUNCTION trigger_listing_viewed_activity()
RETURNS TRIGGER AS $$
DECLARE
    user_plan_type VARCHAR(20);
    view_milestone INTEGER;
BEGIN
    -- Only create activity for significant view milestones
    SELECT p.plan_type
    INTO user_plan_type
    FROM public.profiles p
    WHERE p.id = NEW.user_id;
    
    -- Check for view milestones (10, 25, 50, 100, 250, 500, 1000)
    IF NEW.views_count IN (10, 25, 50, 100, 250, 500, 1000) AND 
       NEW.views_count > COALESCE(OLD.views_count, 0) THEN
        
        view_milestone := NEW.views_count;
        
        PERFORM create_user_activity(
            NEW.user_id,
            'listing_milestone',
            'Marco de visualizações atingido! 🎉',
            'Seu anúncio "' || NEW.title || '" alcançou ' || view_milestone || ' visualizações.',
            NEW.id,
            NULL,
            jsonb_build_object(
                'milestone_type', 'views',
                'milestone_value', view_milestone,
                'listing_title', NEW.title,
                'total_views', NEW.views_count
            ),
            (user_plan_type = 'premium')
        );
    END IF;
    
    -- Update analytics for today
    PERFORM upsert_listing_analytics(
        NEW.id,
        CASE WHEN NEW.views_count > COALESCE(OLD.views_count, 0) THEN 1 ELSE 0 END
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for Premium analytics insights (runs daily)
CREATE OR REPLACE FUNCTION trigger_premium_analytics_insights()
RETURNS TRIGGER AS $$
DECLARE
    listing_owner_id UUID;
    user_plan_type VARCHAR(20);
    performance_change DECIMAL(5,2);
    engagement_score INTEGER;
BEGIN
    -- Get listing owner and plan
    SELECT l.user_id
    INTO listing_owner_id
    FROM public.listings l
    WHERE l.id = NEW.listing_id;
    
    SELECT p.plan_type
    INTO user_plan_type
    FROM public.profiles p
    WHERE p.id = listing_owner_id;
    
    -- Only generate insights for Premium users
    IF user_plan_type = 'premium' THEN
        -- Update performance metrics
        PERFORM update_listing_performance_metrics(NEW.listing_id);
        
        -- Get updated performance data
        SELECT performance_vs_category, engagement_score
        INTO performance_change, engagement_score
        FROM public.listing_analytics
        WHERE listing_id = NEW.listing_id AND date = CURRENT_DATE;
        
        -- Create insights based on performance
        IF performance_change > 20 THEN
            PERFORM create_user_activity(
                listing_owner_id,
                'performance_insight',
                'Seu anúncio está performando acima da média! 📈',
                'Seu anúncio está ' || ROUND(performance_change, 1) || '% acima da média da categoria.',
                NEW.listing_id,
                NULL,
                jsonb_build_object(
                    'insight_type', 'above_average',
                    'performance_change', performance_change,
                    'engagement_score', engagement_score,
                    'category_comparison', true
                ),
                true
            );
        ELSIF performance_change < -20 THEN
            PERFORM create_user_activity(
                listing_owner_id,
                'performance_insight',
                'Oportunidade de melhoria identificada 💡',
                'Algumas sugestões podem ajudar a melhorar a performance do seu anúncio.',
                NEW.listing_id,
                NULL,
                jsonb_build_object(
                    'insight_type', 'improvement_opportunity',
                    'performance_change', performance_change,
                    'engagement_score', engagement_score,
                    'suggestions', jsonb_build_array(
                        'Considere atualizar as fotos',
                        'Revise o título e descrição',
                        'Verifique o preço competitivo'
                    )
                ),
                true
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the triggers
CREATE TRIGGER trigger_listing_created_activity
    AFTER INSERT ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_listing_created_activity();

CREATE TRIGGER trigger_review_received_activity
    AFTER INSERT ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_review_received_activity();

CREATE TRIGGER trigger_listing_viewed_activity
    AFTER UPDATE OF views_count ON public.listings
    FOR EACH ROW
    WHEN (NEW.views_count > OLD.views_count)
    EXECUTE FUNCTION trigger_listing_viewed_activity();

CREATE TRIGGER trigger_premium_analytics_insights
    AFTER UPDATE ON public.listing_analytics
    FOR EACH ROW
    WHEN (NEW.date = CURRENT_DATE)
    EXECUTE FUNCTION trigger_premium_analytics_insights();