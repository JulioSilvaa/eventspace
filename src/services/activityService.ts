import { supabase } from '@/lib/supabase'

export interface DatabaseActivity {
  id: string
  activity_type: string
  title: string
  description: string | null
  related_listing_id: string | null
  related_user_id: string | null
  metadata: Record<string, unknown>
  is_premium_feature: boolean
  created_at: string
}

export interface CreateActivityParams {
  user_id: string
  activity_type: string
  title: string
  description?: string
  related_listing_id?: string
  related_user_id?: string
  metadata?: Record<string, unknown>
  is_premium_feature?: boolean
}

class ActivityService {
  /**
   * Get recent activities for a user
   */
  async getUserActivities(
    userId: string, 
    limit: number = 10, 
    includePremium: boolean = false
  ): Promise<{ data: DatabaseActivity[]; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('get_user_recent_activities', {
        user_id_param: userId,
        limit_param: limit,
        include_premium: includePremium
      })

      if (error) {
        console.error('Error fetching user activities:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      console.error('Error in getUserActivities:', error)
      return { data: [], error: 'Failed to fetch activities' }
    }
  }

  /**
   * Create a new activity (usually called by system/triggers)
   */
  async createActivity(params: CreateActivityParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('create_user_activity', {
        user_id_param: params.user_id,
        activity_type_param: params.activity_type,
        title_param: params.title,
        description_param: params.description || null,
        related_listing_id_param: params.related_listing_id || null,
        related_user_id_param: params.related_user_id || null,
        metadata_param: params.metadata || {},
        is_premium_feature_param: params.is_premium_feature || false
      })

      if (error) {
        console.error('Error creating activity:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in createActivity:', error)
      return { success: false, error: 'Failed to create activity' }
    }
  }

  /**
   * Record listing view and update analytics
   */
  async recordListingView(
    listingId: string, 
    viewerState?: string, 
    viewerCity?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.rpc('upsert_listing_analytics', {
        listing_id_param: listingId,
        views_increment: 1,
        viewer_state: viewerState || null,
        viewer_city: viewerCity || null
      })

      if (error) {
        console.error('Error recording listing view:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in recordListingView:', error)
      return { success: false, error: 'Failed to record view' }
    }
  }

  /**
   * Record contact interaction (WhatsApp, phone, etc.)
   */
  async recordContactInteraction(
    listingId: string,
    contactType: 'whatsapp' | 'phone' | 'general'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const params: Record<string, string | number> = {
        listing_id_param: listingId,
        contact_increment: contactType === 'general' ? 1 : 0,
        whatsapp_increment: contactType === 'whatsapp' ? 1 : 0,
        phone_increment: contactType === 'phone' ? 1 : 0
      }

      const { error } = await supabase.rpc('upsert_listing_analytics', params)

      if (error) {
        console.error('Error recording contact interaction:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error in recordContactInteraction:', error)
      return { success: false, error: 'Failed to record contact' }
    }
  }

  /**
   * Get listing analytics for Premium users
   */
  async getListingAnalytics(
    listingId: string,
    days: number = 30
  ): Promise<{ data: unknown[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('listing_analytics')
        .select('*')
        .eq('listing_id', listingId)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching listing analytics:', error)
        return { data: [], error: error.message }
      }

      return { data: data || [] }
    } catch (error) {
      console.error('Error in getListingAnalytics:', error)
      return { data: [], error: 'Failed to fetch analytics' }
    }
  }

  /**
   * Get performance insights for Premium users
   */
  async getPerformanceInsights(listingId: string): Promise<{ data: unknown; error?: string }> {
    try {
      // Get latest analytics data
      const { data, error } = await supabase
        .from('listing_analytics')
        .select('*')
        .eq('listing_id', listingId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      if (error && error.code !== 'PGRST116') { // Not found is ok
        console.error('Error fetching performance insights:', error)
        return { data: null, error: error.message }
      }

      if (!data) {
        return { data: null }
      }

      return { 
        data: {
          conversion_rate: data.conversion_rate,
          engagement_score: data.engagement_score,
          performance_vs_category: data.performance_vs_category,
          top_viewer_states: data.top_viewer_states,
          top_viewer_cities: data.top_viewer_cities,
          reviews_count: data.reviews_count,
          average_rating: data.average_rating
        }
      }
    } catch (error) {
      console.error('Error in getPerformanceInsights:', error)
      return { data: null, error: 'Failed to fetch insights' }
    }
  }
}

export const activityService = new ActivityService()