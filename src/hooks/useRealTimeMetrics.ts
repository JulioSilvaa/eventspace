import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { realTimeService, type RealTimeMetrics } from '@/services/realTimeService'
import { useAuth } from '@/hooks/useAuth'

interface UseRealTimeMetricsOptions {
  listingId?: string
  userId?: string
  pollingInterval?: number
  enableRealTime?: boolean
  enabled?: boolean
  includePremiumFeatures?: boolean
}

interface UseRealTimeMetricsReturn {
  metrics: RealTimeMetrics | null
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => Promise<void>
}

export function useRealTimeMetrics(options: UseRealTimeMetricsOptions = {}): UseRealTimeMetricsReturn {
  const {
    listingId,
    userId,
    pollingInterval = 30000, // 30 segundos
    enableRealTime = true,
    enabled = true,
    includePremiumFeatures = false
  } = options

  const { user } = useAuth()
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Refs para controle de intervalos e subscriptions
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const realtimeSubscriptionRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const isActiveRef = useRef(true)

  // Função para buscar métricas
  const fetchMetrics = useCallback(async () => {
    if (!enabled || (!listingId && !userId)) return

    try {
      setError(null)
      
      let metricsData: RealTimeMetrics

      if (listingId) {
        // Buscar métricas para um anúncio específico
        if (includePremiumFeatures) {
          metricsData = await realTimeService.getListingMetricsWithPremiumInsights(listingId)
        } else {
          metricsData = await realTimeService.getListingMetrics(listingId)
        }
      } else if (userId) {
        // Buscar métricas consolidadas do usuário
        if (includePremiumFeatures) {
          const userMetrics = await realTimeService.getUserMetricsWithPremiumInsights(userId)
          metricsData = userMetrics
        } else {
          const userMetrics = await realTimeService.getUserMetrics(userId)
          metricsData = {
            ...userMetrics,
            dailyMetrics: []
          }
        }
      } else {
        return
      }

      setMetrics(metricsData)
      setLastUpdated(new Date())

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar métricas'
      setError(errorMessage)
      console.error('Erro ao buscar métricas:', err)
    }
  }, [listingId, userId, enabled, includePremiumFeatures])

  // Função para refresh manual
  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchMetrics()
    setIsLoading(false)
  }, [fetchMetrics])

  // Função para rastrear eventos
  const trackEvent = useCallback(async (eventType: string, metadata?: Record<string, unknown>) => {
    if (!listingId) return

    try {
      await realTimeService.trackEvent({
        listing_id: listingId,
        user_id: user?.id,
        event_type: eventType as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        metadata
      })

      // Atualizar métricas após rastrear evento
      if (isActiveRef.current) {
        await fetchMetrics()
      }

    } catch (err) {
      console.error('Erro ao rastrear evento:', err)
    }
  }, [listingId, user?.id, fetchMetrics])

  // Setup polling inteligente
  useEffect(() => {
    if (!enabled) return

    const setupPolling = () => {
      // Limpar intervalo anterior
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }

      // Configurar novo intervalo
      pollingIntervalRef.current = setInterval(() => {
        if (isActiveRef.current && document.visibilityState === 'visible') {
          fetchMetrics()
        }
      }, pollingInterval)
    }

    // Buscar dados iniciais
    refresh()

    // Configurar polling
    setupPolling()

    // Ajustar frequência baseado na visibilidade da página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        isActiveRef.current = true
        fetchMetrics() // Buscar dados atualizados quando volta ao foco
        setupPolling()
      } else {
        isActiveRef.current = false
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      isActiveRef.current = false
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, pollingInterval, refresh, fetchMetrics])

  // Setup Supabase Realtime (para updates instantâneos)
  useEffect(() => {
    if (!enableRealTime || !enabled || (!listingId && !userId)) return

    const setupRealtime = async () => {
      try {
        // Subscription para activity_events
        const channel = supabase
          .channel('activity-events')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'activity_events',
              filter: listingId ? `listing_id=eq.${listingId}` : undefined
            },
            () => {
              // Atualizar métricas quando houver novos eventos
              if (isActiveRef.current) {
                setTimeout(() => fetchMetrics(), 1000) // Pequeno delay para consolidação
              }
            }
          )
          .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
              console.log('Supabase Realtime connected successfully')
            } else if (status === 'CHANNEL_ERROR') {
              console.warn('Supabase Realtime connection failed, falling back to polling only:', err)
              // Continue usando polling mesmo se WebSocket falhar
            } else if (status === 'TIMED_OUT') {
              console.warn('Supabase Realtime connection timed out, using polling only')
            }
          })

        realtimeSubscriptionRef.current = channel

      } catch (err) {
        console.warn('Erro ao configurar Supabase Realtime, continuando com polling:', err)
        // Não é um erro crítico - o polling ainda funciona
      }
    }

    setupRealtime()

    // Cleanup
    return () => {
      if (realtimeSubscriptionRef.current) {
        try {
          supabase.removeChannel(realtimeSubscriptionRef.current)
        } catch (err) {
          console.warn('Error removing realtime channel:', err)
        }
      }
    }
  }, [enableRealTime, enabled, listingId, userId, fetchMetrics])

  return {
    metrics,
    isLoading,
    error,
    lastUpdated,
    refresh,
    trackEvent
  }
}

// Hook específico para métricas de um anúncio
export function useListingRealTimeMetrics(listingId: string, options: Omit<UseRealTimeMetricsOptions, 'listingId'> = {}) {
  return useRealTimeMetrics({
    ...options,
    listingId
  })
}

// Hook específico para métricas consolidadas do usuário
export function useUserRealTimeMetrics(options: Omit<UseRealTimeMetricsOptions, 'userId'> & { 
  includePremiumFeatures?: boolean 
} = {}) {
  const { user } = useAuth()
  const { includePremiumFeatures = false, ...restOptions } = options
  
  return useRealTimeMetrics({
    ...restOptions,
    userId: user?.id,
    includePremiumFeatures
  })
}

// Hook para rastreamento simples de eventos
export function useEventTracking(listingId?: string) {
  const { user } = useAuth()

  const trackView = useCallback(async () => {
    if (!listingId) return
    await realTimeService.incrementViews(listingId)
  }, [listingId])

  const trackWhatsAppContact = useCallback(async () => {
    if (!listingId) return
    await realTimeService.trackWhatsAppContact(listingId, user?.id)
  }, [listingId, user?.id])

  const trackPhoneContact = useCallback(async () => {
    if (!listingId) return
    await realTimeService.trackPhoneContact(listingId, user?.id)
  }, [listingId, user?.id])

  const trackFavorite = useCallback(async (isAdding: boolean) => {
    if (!listingId || !user?.id) return
    
    if (isAdding) {
      await realTimeService.trackFavoriteAdd(listingId, user.id)
    } else {
      await realTimeService.trackFavoriteRemove(listingId, user.id)
    }
  }, [listingId, user?.id])

  const trackShare = useCallback(async (platform: string) => {
    if (!listingId) return
    await realTimeService.trackShare(listingId, platform)
  }, [listingId])

  const trackReview = useCallback(async () => {
    if (!listingId || !user?.id) return
    await realTimeService.trackReview(listingId, user.id)
  }, [listingId, user?.id])

  const trackListingCreated = useCallback(async (metadata?: Record<string, unknown>) => {
    if (!listingId || !user?.id) return
    await realTimeService.trackListingCreated(listingId, user.id, metadata)
  }, [listingId, user?.id])

  const trackListingUpdated = useCallback(async (changedFields: string[], metadata?: Record<string, unknown>) => {
    if (!listingId || !user?.id) return
    await realTimeService.trackListingUpdated(listingId, user.id, changedFields, metadata)
  }, [listingId, user?.id])

  const trackPriceUpdated = useCallback(async (oldPrice: number, newPrice: number) => {
    if (!listingId || !user?.id) return
    await realTimeService.trackPriceUpdated(listingId, user.id, oldPrice, newPrice)
  }, [listingId, user?.id])

  const trackPhotosUpdated = useCallback(async (action: 'added' | 'removed' | 'updated', photoCount?: number) => {
    if (!listingId || !user?.id) return
    await realTimeService.trackPhotosUpdated(listingId, user.id, action, photoCount)
  }, [listingId, user?.id])

  const trackDescriptionUpdated = useCallback(async () => {
    if (!listingId || !user?.id) return
    await realTimeService.trackDescriptionUpdated(listingId, user.id)
  }, [listingId, user?.id])

  const trackContactUpdated = useCallback(async (updatedFields: string[]) => {
    if (!listingId || !user?.id) return
    await realTimeService.trackContactUpdated(listingId, user.id, updatedFields)
  }, [listingId, user?.id])

  return {
    trackView,
    trackWhatsAppContact,
    trackPhoneContact,
    trackFavorite,
    trackShare,
    trackReview,
    trackListingCreated,
    trackListingUpdated,
    trackPriceUpdated,
    trackPhotosUpdated,
    trackDescriptionUpdated,
    trackContactUpdated
  }
}