import { apiClient } from '@/lib/api-client'
import { geolocationService, type GeographicInsight } from './geolocationService'
import { competitorAnalysisService, type CompetitiveInsight } from './competitorAnalysisService'

// Tipos para eventos de atividade
export type ActivityEventType =
  | 'view'
  | 'contact_whatsapp'
  | 'contact_phone'
  | 'favorite_add'
  | 'favorite_remove'
  | 'review'
  | 'share'
  | 'listing_created'
  | 'listing_updated'
  | 'price_updated'
  | 'photos_updated'
  | 'description_updated'
  | 'contact_updated'
  | 'status_change'
  | 'subscription_updated'
  | 'payment_succeeded'

export interface ActivityEvent {
  id?: string
  listing_id: string
  user_id?: string
  event_type: ActivityEventType
  created_at?: string
  metadata?: Record<string, unknown>
}

export interface MetricsSummary {
  id?: string
  listing_id: string
  date: string
  views_count: number
  contacts_count: number
  favorites_count: number
  reviews_count: number
  shares_count: number
  updated_at?: string
}

export interface RealTimeMetrics {
  totalViews: number
  totalContacts: number
  totalFavorites: number
  totalReviews: number
  recentEvents: ActivityEvent[]
  dailyMetrics: MetricsSummary[]
  geographicInsights?: GeographicInsight
  competitiveInsights?: CompetitiveInsight[]
}

interface MetricsResponse {
  totalViews: number
  totalContacts: number
  totalFavorites: number
  totalReviews: number
  recentEvents?: ActivityEvent[]
  dailyMetrics?: MetricsSummary[]
}

class RealTimeService {
  private eventQueue: ActivityEvent[] = []
  private isProcessingQueue = false
  private readonly BATCH_SIZE = 10
  private readonly QUEUE_FLUSH_INTERVAL = 5000

  constructor() {
    // Process queue periodically
    setInterval(() => {
      this.flushEventQueue()
    }, this.QUEUE_FLUSH_INTERVAL)
  }

  /**
   * Track an activity event
   */
  async trackEvent(event: Omit<ActivityEvent, 'id' | 'created_at'>): Promise<void> {
    // Add to queue for batch processing
    this.eventQueue.push({
      ...event,
      created_at: new Date().toISOString()
    })

    // Flush immediately if queue is full
    if (this.eventQueue.length >= this.BATCH_SIZE) {
      await this.flushEventQueue()
    }
  }

  /**
   * Process event queue in batch
   */
  private async flushEventQueue(): Promise<void> {
    if (this.isProcessingQueue || this.eventQueue.length === 0) return

    this.isProcessingQueue = true
    const eventsToProcess = [...this.eventQueue]
    this.eventQueue = []

    try {
      // Send events to API
      await apiClient.post('/api/events/batch', { events: eventsToProcess })
    } catch (error) {
      // Events tracking may not be implemented, just log and continue
      console.log('Event tracking not available:', error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  /**
   * Get metrics for a listing
   */
  async getListingMetrics(listingId: string): Promise<RealTimeMetrics> {
    try {
      const { data, error } = await apiClient.get<MetricsResponse>(
        `/api/spaces/${listingId}/metrics`
      )

      if (error) {
        // Return default metrics if endpoint not available
        return {
          totalViews: 0,
          totalContacts: 0,
          totalFavorites: 0,
          totalReviews: 0,
          recentEvents: [],
          dailyMetrics: []
        }
      }

      return {
        totalViews: data?.totalViews || 0,
        totalContacts: data?.totalContacts || 0,
        totalFavorites: data?.totalFavorites || 0,
        totalReviews: data?.totalReviews || 0,
        recentEvents: data?.recentEvents || [],
        dailyMetrics: data?.dailyMetrics || []
      }
    } catch (error) {
      return {
        totalViews: 0,
        totalContacts: 0,
        totalFavorites: 0,
        totalReviews: 0,
        recentEvents: [],
        dailyMetrics: []
      }
    }
  }

  /**
   * Get consolidated metrics for all user listings
   */
  async getUserMetrics(userId: string): Promise<{
    totalViews: number
    totalContacts: number
    totalFavorites: number
    totalReviews: number
    recentEvents: ActivityEvent[]
  }> {
    try {
      const { data, error } = await apiClient.get<MetricsResponse>(
        `/api/user/${userId}/metrics`
      )

      if (error) {
        return {
          totalViews: 0,
          totalContacts: 0,
          totalFavorites: 0,
          totalReviews: 0,
          recentEvents: []
        }
      }

      return {
        totalViews: data?.totalViews || 0,
        totalContacts: data?.totalContacts || 0,
        totalFavorites: data?.totalFavorites || 0,
        totalReviews: data?.totalReviews || 0,
        recentEvents: data?.recentEvents || []
      }
    } catch (error) {
      return {
        totalViews: 0,
        totalContacts: 0,
        totalFavorites: 0,
        totalReviews: 0,
        recentEvents: []
      }
    }
  }

  // Convenience methods for tracking specific events
  async incrementViews(listingId: string): Promise<void> {
    await this.trackEvent({ listing_id: listingId, event_type: 'view' })
  }

  async trackWhatsAppContact(listingId: string, userId?: string): Promise<void> {
    await this.trackEvent({ listing_id: listingId, user_id: userId, event_type: 'contact_whatsapp' })
  }

  async trackPhoneContact(listingId: string, userId?: string): Promise<void> {
    await this.trackEvent({ listing_id: listingId, user_id: userId, event_type: 'contact_phone' })
  }

  async trackFavoriteAdd(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({ listing_id: listingId, user_id: userId, event_type: 'favorite_add' })
  }

  async trackFavoriteRemove(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({ listing_id: listingId, user_id: userId, event_type: 'favorite_remove' })
  }

  async trackReview(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({ listing_id: listingId, user_id: userId, event_type: 'review' })
  }

  async trackShare(listingId: string, platform: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      event_type: 'share',
      metadata: { platform }
    })
  }

  async trackListingCreated(listingId: string, userId: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'listing_created',
      metadata
    })
  }

  async trackListingUpdated(listingId: string, userId: string, changedFields: string[], metadata?: Record<string, unknown>): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'listing_updated',
      metadata: { changedFields, ...metadata }
    })
  }

  async trackPriceUpdated(listingId: string, userId: string, oldPrice: number, newPrice: number): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'price_updated',
      metadata: { oldPrice, newPrice }
    })
  }

  async trackPhotosUpdated(listingId: string, userId: string, action: 'added' | 'removed' | 'updated', photoCount?: number): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'photos_updated',
      metadata: { action, photoCount }
    })
  }

  async trackDescriptionUpdated(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'description_updated'
    })
  }

  async trackContactUpdated(listingId: string, userId: string, updatedFields: string[]): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'contact_updated',
      metadata: { updatedFields }
    })
  }

  /**
   * Get user metrics with premium insights
   */
  async getUserMetricsWithPremiumInsights(userId: string): Promise<RealTimeMetrics & {
    geographicInsights?: GeographicInsight
    competitiveInsights?: CompetitiveInsight[]
  }> {
    const [metrics, compInsights] = await Promise.all([
      this.getUserMetrics(userId),
      competitorAnalysisService.getUserCompetitiveInsights(userId).catch(() => [] as CompetitiveInsight[])
    ])

    let geoInsights: GeographicInsight | undefined

    if (metrics.recentEvents && metrics.recentEvents.length > 0) {
      const listingIds = Array.from(new Set(metrics.recentEvents.map(e => e.listing_id)))
      geoInsights = await geolocationService.getUserGeographicInsights(
        listingIds,
        metrics.recentEvents as Record<string, any>[]
      ).catch(() => undefined)
    }

    return {
      ...metrics,
      dailyMetrics: [],
      geographicInsights: geoInsights,
      competitiveInsights: compInsights
    }
  }
}

export const realTimeService = new RealTimeService()