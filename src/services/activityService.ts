import { apiClient } from '@/lib/api-client'

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

interface ActivitiesResponse {
  activities: DatabaseActivity[]
}

interface AnalyticsResponse {
  data: unknown[]
}

interface InsightsResponse {
  conversion_rate?: number
  engagement_score?: number
  performance_vs_category?: number
  top_viewer_states?: string[]
  top_viewer_cities?: string[]
  reviews_count?: number
  average_rating?: number
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
      const { data, error } = await apiClient.get<ActivitiesResponse>(
        `/api/user/${userId}/activities`,
        { limit, include_premium: includePremium }
      )

      if (error) {
        // If endpoint doesn't exist, return empty array
        if (error.status === 404) {
          return { data: [] }
        }
        return { data: [], error: error.message }
      }

      return { data: data?.activities || [] }
    } catch (error) {
      return { data: [], error: 'Failed to fetch activities' }
    }
  }

  /**
   * Create a new activity (usually called by system/triggers)
   */
  async createActivity(params: CreateActivityParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await apiClient.post('/api/activities', params)

      if (error) {
        // Activity tracking may not be implemented in API
        if (error.status === 404) {
          console.log('Activity tracking not available in API')
          return { success: true }
        }
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
    _viewerState?: string,
    _viewerCity?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await apiClient.post(`/api/spaces/${listingId}/view`)

      if (error) {
        // View tracking may not be implemented
        if (error.status === 404) {
          return { success: true }
        }
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
      const { error } = await apiClient.post(`/api/spaces/${listingId}/contact`, {
        type: contactType
      })

      if (error) {
        // Contact tracking may not be implemented
        if (error.status === 404) {
          return { success: true }
        }
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
      const { data, error } = await apiClient.get<AnalyticsResponse>(
        `/api/spaces/${listingId}/analytics`,
        { days }
      )

      if (error) {
        if (error.status === 404) {
          return { data: [] }
        }
        console.error('Error fetching listing analytics:', error)
        return { data: [], error: error.message }
      }

      return { data: data?.data || [] }
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
      const { data, error } = await apiClient.get<InsightsResponse>(
        `/api/spaces/${listingId}/insights`
      )

      if (error) {
        if (error.status === 404) {
          return { data: null }
        }
        console.error('Error fetching performance insights:', error)
        return { data: null, error: error.message }
      }

      return { data }
    } catch (error) {
      console.error('Error in getPerformanceInsights:', error)
      return { data: null, error: 'Failed to fetch insights' }
    }
  }
}

export const activityService = new ActivityService()