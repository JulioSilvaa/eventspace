import { useState, useEffect, useRef, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from './useAuth'
import { realTimeService } from '@/services/realTimeService'

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

export interface MetricsSummary {
  listing_id: string
  date: string
  views_count: number
  contacts_count: number
  favorites_count: number
  reviews_count: number
  shares_count: number
}

export interface RealTimeMetrics {
  totalViews: number
  totalContacts: number
  totalFavorites: number
  totalReviews: number
  recentEvents: Array<{
    id: string
    event_type: ActivityEventType
    created_at: string
    listing_id: string
    metadata?: Record<string, any>
  }>
  dailyMetrics: MetricsSummary[]
  geographicInsights?: any
  competitiveInsights?: any[]
}

interface UseRealTimeMetricsOptions {
  pollingInterval?: number // in milliseconds
  enablePolling?: boolean
}

interface MetricsResponse {
  totalViews: number
  totalContacts: number
  totalFavorites: number
  totalReviews: number
  recentEvents?: Array<{
    id: string
    event_type: ActivityEventType
    created_at: string
    listing_id: string
  }>
  dailyMetrics?: MetricsSummary[]
}

export function useRealTimeMetrics(
  userId: string | undefined,
  options: UseRealTimeMetricsOptions = {}
) {
  const {
    pollingInterval = 30000, // 30 seconds default
    enablePolling = true
  } = options

  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    totalViews: 0,
    totalContacts: 0,
    totalFavorites: 0,
    totalReviews: 0,
    recentEvents: [],
    dailyMetrics: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!userId) return

    try {
      setError(null)

      // Fetch user metrics from API
      // Note: Adjust endpoint based on actual API implementation
      const { data, error: apiError } = await apiClient.get<MetricsResponse>(
        `/api/user/${userId}/metrics`
      )

      if (apiError) {
        // If endpoint doesn't exist, use fallback with empty metrics
        if (apiError.status === 404) {
          return
        }
        throw new Error(apiError.message)
      }

      if (data) {
        setMetrics({
          totalViews: data.totalViews || 0,
          totalContacts: data.totalContacts || 0,
          totalFavorites: data.totalFavorites || 0,
          totalReviews: data.totalReviews || 0,
          recentEvents: data.recentEvents || [],
          dailyMetrics: data.dailyMetrics || []
        })
      }
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchMetrics()
    }
  }, [userId, fetchMetrics])

  // Setup polling
  useEffect(() => {
    if (!userId || !enablePolling) return

    pollingRef.current = setInterval(fetchMetrics, pollingInterval)

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [userId, enablePolling, pollingInterval, fetchMetrics])

  const refresh = useCallback(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    isLoading,
    error,
    refresh
  }
}

// Alias for dashboard usage
export const useUserRealTimeMetrics = useRealTimeMetrics

export function useEventTracking(listingId?: string) {
  const { user } = useAuth()

  const trackListingUpdated = async (changedFields: string[], metadata?: Record<string, unknown>) => {
    if (!user?.id || !listingId) return
    await realTimeService.trackListingUpdated(listingId, user.id, changedFields, metadata)
  }

  const trackPriceUpdated = async (oldPrice: number, newPrice: number) => {
    if (!user?.id || !listingId) return
    await realTimeService.trackPriceUpdated(listingId, user.id, oldPrice, newPrice)
  }

  const trackPhotosUpdated = async (action: 'added' | 'removed' | 'updated', photoCount?: number) => {
    if (!user?.id || !listingId) return
    await realTimeService.trackPhotosUpdated(listingId, user.id, action, photoCount)
  }

  const trackDescriptionUpdated = async () => {
    if (!user?.id || !listingId) return
    await realTimeService.trackDescriptionUpdated(listingId, user.id)
  }

  const trackContactUpdated = async (updatedFields: string[]) => {
    if (!user?.id || !listingId) return
    await realTimeService.trackContactUpdated(listingId, user.id, updatedFields)
  }

  const trackView = async () => {
    if (!listingId) return
    await realTimeService.trackEvent({
      listing_id: listingId,
      user_id: user?.id, // Optional - allows anonymous tracking
      event_type: 'view'
    })
  }

  const trackWhatsAppContact = async () => {
    if (!user?.id || !listingId) return
    await realTimeService.trackEvent({
      listing_id: listingId,
      user_id: user.id,
      event_type: 'contact_whatsapp'
    })
  }

  const trackPhoneContact = async () => {
    if (!user?.id || !listingId) return
    await realTimeService.trackEvent({
      listing_id: listingId,
      user_id: user.id,
      event_type: 'contact_phone'
    })
  }

  return {
    trackListingUpdated,
    trackPriceUpdated,
    trackPhotosUpdated,
    trackDescriptionUpdated,
    trackContactUpdated,
    trackView,
    trackWhatsAppContact,
    trackPhoneContact
  }
}

export default useRealTimeMetrics