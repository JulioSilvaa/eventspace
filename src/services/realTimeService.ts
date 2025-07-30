import { supabase } from '@/lib/supabase'
import { geolocationService, type GeographicInsight } from './geolocationService'
import { competitorAnalysisService, type CompetitiveInsight } from './competitorAnalysisService'

// Tipos para eventos de atividade
export type ActivityEventType = 
  | 'view' 
  | 'contact_whatsapp' 
  | 'contact_phone' 
  | 'contact_email'
  | 'favorite_add'
  | 'favorite_remove'
  | 'review_add'
  | 'share'
  | 'listing_created'
  | 'listing_updated'
  | 'price_updated'
  | 'photos_updated'
  | 'description_updated'
  | 'contact_updated'

export interface ActivityEvent {
  id?: string
  listing_id: string
  user_id?: string
  event_type: ActivityEventType
  created_at?: string
  metadata?: {
    ip?: string
    user_agent?: string
    referrer?: string
    location?: {
      city?: string
      state?: string
      country?: string
    }
    [key: string]: unknown
  }
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
  geographicInsights?: GeographicInsight // Premium feature
  competitiveInsights?: CompetitiveInsight // Premium feature
}

class RealTimeService {
  private eventQueue: ActivityEvent[] = []
  private isProcessingQueue = false
  private readonly BATCH_SIZE = 10
  private readonly QUEUE_FLUSH_INTERVAL = 5000 // 5 segundos

  constructor() {
    // Processar queue a cada 5 segundos
    setInterval(() => {
      this.flushEventQueue()
    }, this.QUEUE_FLUSH_INTERVAL)
  }

  /**
   * Registra um evento de atividade
   */
  async trackEvent(event: Omit<ActivityEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      // Capturar IP para geolocalização (apenas para premium)
      let ipAddress = null
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipResponse.json()
        ipAddress = ipData.ip
      } catch (ipError) {
        console.warn('Não foi possível capturar IP:', ipError)
      }

      // Adicionar metadata automaticamente
      const enhancedEvent: ActivityEvent = {
        ...event,
        created_at: new Date().toISOString(),
        metadata: {
          ...event.metadata,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          timestamp: Date.now(),
          ip: ipAddress
        }
      }

      // Adicionar à queue para processamento em lote
      this.eventQueue.push(enhancedEvent)

      // Se a queue estiver muito cheia, processar imediatamente
      if (this.eventQueue.length >= this.BATCH_SIZE) {
        await this.flushEventQueue()
      }

    } catch (error) {
      console.error('Erro ao registrar evento:', error)
    }
  }

  /**
   * Processa a queue de eventos em lote
   */
  private async flushEventQueue(): Promise<void> {
    if (this.isProcessingQueue || this.eventQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    try {
      const eventsToProcess = this.eventQueue.splice(0, this.BATCH_SIZE)
      
      const { error } = await supabase
        .from('activity_events')
        .insert(eventsToProcess)

      if (error) {
        console.error('Erro ao salvar eventos:', error)
        // Re-adicionar eventos à queue se houver erro
        this.eventQueue.unshift(...eventsToProcess)
      }

    } catch (error) {
      console.error('Erro ao processar queue de eventos:', error)
    } finally {
      this.isProcessingQueue = false
    }
  }

  /**
   * Busca métricas em tempo real para um anúncio
   */
  async getListingMetrics(listingId: string): Promise<RealTimeMetrics> {
    try {
      // Buscar eventos recentes (últimas 24h)
      const { data: recentEvents, error: eventsError } = await supabase
        .from('activity_events')
        .select('*')
        .eq('listing_id', listingId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50)

      if (eventsError) {
        throw eventsError
      }

      // Buscar métricas consolidadas (últimos 30 dias)
      const { data: dailyMetrics, error: metricsError } = await supabase
        .from('metrics_summary')
        .select('*')
        .eq('listing_id', listingId)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (metricsError) {
        throw metricsError
      }

      // Calcular totais
      const totalViews = (dailyMetrics || []).reduce((sum, day) => sum + day.views_count, 0)
      const totalContacts = (dailyMetrics || []).reduce((sum, day) => sum + day.contacts_count, 0)
      const totalFavorites = (dailyMetrics || []).reduce((sum, day) => sum + day.favorites_count, 0)
      const totalReviews = (dailyMetrics || []).reduce((sum, day) => sum + day.reviews_count, 0)

      return {
        totalViews,
        totalContacts,
        totalFavorites,
        totalReviews,
        recentEvents: recentEvents || [],
        dailyMetrics: dailyMetrics || []
      }

    } catch (error) {
      console.error('Erro ao buscar métricas:', error)
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
   * Busca métricas consolidadas para todos os anúncios do usuário
   */
  async getUserMetrics(userId: string): Promise<{
    totalViews: number
    totalContacts: number
    totalFavorites: number
    totalReviews: number
    recentEvents: ActivityEvent[]
  }> {
    try {
      // Buscar IDs dos anúncios do usuário
      const { data: userListings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', userId)

      if (listingsError) {
        throw listingsError
      }

      const listingIds = userListings?.map(listing => listing.id) || []

      if (listingIds.length === 0) {
        return {
          totalViews: 0,
          totalContacts: 0,
          totalFavorites: 0,
          totalReviews: 0,
          recentEvents: []
        }
      }

      // Buscar eventos recentes para todos os anúncios
      const { data: recentEvents, error: eventsError } = await supabase
        .from('activity_events')
        .select('*')
        .in('listing_id', listingIds)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100)

      if (eventsError) {
        throw eventsError
      }

      // Buscar métricas consolidadas
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics_summary')
        .select('*')
        .in('listing_id', listingIds)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

      if (metricsError) {
        throw metricsError
      }

      // Calcular totais
      const totalViews = (metricsData || []).reduce((sum, day) => sum + day.views_count, 0)
      const totalContacts = (metricsData || []).reduce((sum, day) => sum + day.contacts_count, 0)
      const totalFavorites = (metricsData || []).reduce((sum, day) => sum + day.favorites_count, 0)
      const totalReviews = (metricsData || []).reduce((sum, day) => sum + day.reviews_count, 0)

      return {
        totalViews,
        totalContacts,
        totalFavorites,
        totalReviews,
        recentEvents: recentEvents || []
      }

    } catch (error) {
      console.error('Erro ao buscar métricas do usuário:', error)
      return {
        totalViews: 0,
        totalContacts: 0,
        totalFavorites: 0,
        totalReviews: 0,
        recentEvents: []
      }
    }
  }

  /**
   * Incrementa contador de views (compatibilidade com sistema atual)
   */
  async incrementViews(listingId: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      event_type: 'view'
    })
  }

  /**
   * Registra contato via WhatsApp
   */
  async trackWhatsAppContact(listingId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'contact_whatsapp'
    })
  }

  /**
   * Registra contato via telefone
   */
  async trackPhoneContact(listingId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'contact_phone'
    })
  }

  /**
   * Registra adição aos favoritos
   */
  async trackFavoriteAdd(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'favorite_add'
    })
  }

  /**
   * Registra remoção dos favoritos
   */
  async trackFavoriteRemove(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'favorite_remove'
    })
  }

  /**
   * Registra nova avaliação
   */
  async trackReview(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'review_add'
    })
  }

  /**
   * Registra compartilhamento
   */
  async trackShare(listingId: string, platform: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      event_type: 'share',
      metadata: {
        platform
      }
    })
  }

  /**
   * Registra criação de anúncio
   */
  async trackListingCreated(listingId: string, userId: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'listing_created',
      metadata: {
        ...metadata,
        action: 'created'
      }
    })
  }

  /**
   * Registra atualização geral do anúncio
   */
  async trackListingUpdated(listingId: string, userId: string, changedFields: string[], metadata?: Record<string, unknown>): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'listing_updated',
      metadata: {
        ...metadata,
        changedFields,
        action: 'updated'
      }
    })
  }

  /**
   * Registra atualização de preço
   */
  async trackPriceUpdated(listingId: string, userId: string, oldPrice: number, newPrice: number): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'price_updated',
      metadata: {
        oldPrice,
        newPrice,
        priceChange: newPrice - oldPrice,
        priceChangePercent: oldPrice > 0 ? Math.round(((newPrice - oldPrice) / oldPrice) * 100) : 0,
        action: 'price_updated'
      }
    })
  }

  /**
   * Registra atualização de fotos
   */
  async trackPhotosUpdated(listingId: string, userId: string, action: 'added' | 'removed' | 'updated', photoCount?: number): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'photos_updated',
      metadata: {
        photoAction: action,
        photoCount,
        action: 'photos_updated'
      }
    })
  }

  /**
   * Registra atualização de descrição
   */
  async trackDescriptionUpdated(listingId: string, userId: string): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'description_updated',
      metadata: {
        action: 'description_updated'
      }
    })
  }

  /**
   * Registra atualização de informações de contato
   */
  async trackContactUpdated(listingId: string, userId: string, updatedFields: string[]): Promise<void> {
    await this.trackEvent({
      listing_id: listingId,
      user_id: userId,
      event_type: 'contact_updated',
      metadata: {
        updatedContactFields: updatedFields,
        action: 'contact_updated'
      }
    })
  }

  /**
   * Força o processamento da queue (para testes)
   */
  async forceFlushQueue(): Promise<void> {
    await this.flushEventQueue()
  }

  /**
   * Obter insights geográficos para um anúncio (Premium)
   */
  async getListingGeographicInsights(listingId: string): Promise<GeographicInsight | null> {
    try {
      // Buscar eventos com dados de IP dos últimos 30 dias
      const { data: events, error } = await supabase
        .from('activity_events')
        .select('*')
        .eq('listing_id', listingId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .not('metadata->>ip', 'is', null)

      if (error) {
        throw error
      }

      if (!events || events.length === 0) {
        return null
      }

      return await geolocationService.getListingGeographicInsights(listingId, events)

    } catch (error) {
      console.error('Erro ao obter insights geográficos:', error)
      return null
    }
  }

  /**
   * Obter insights geográficos consolidados do usuário (Premium)
   */
  async getUserGeographicInsights(userId: string): Promise<GeographicInsight | null> {
    try {
      // Buscar IDs dos anúncios do usuário
      const { data: userListings, error: listingsError } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', userId)

      if (listingsError) {
        throw listingsError
      }

      const listingIds = userListings?.map(listing => listing.id) || []

      if (listingIds.length === 0) {
        return null
      }

      // Buscar eventos com dados de IP dos últimos 30 dias
      const { data: events, error: eventsError } = await supabase
        .from('activity_events')
        .select('*')
        .in('listing_id', listingIds)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .not('metadata->>ip', 'is', null)

      if (eventsError) {
        throw eventsError
      }

      if (!events || events.length === 0) {
        return null
      }

      return await geolocationService.getUserGeographicInsights(listingIds, events)

    } catch (error) {
      console.error('Erro ao obter insights geográficos do usuário:', error)
      return null
    }
  }

  /**
   * Buscar métricas com insights geográficos (Premium)
   */
  async getListingMetricsWithGeographicInsights(listingId: string, includePremiumFeatures = false): Promise<RealTimeMetrics> {
    const baseMetrics = await this.getListingMetrics(listingId)

    if (includePremiumFeatures) {
      const geographicInsights = await this.getListingGeographicInsights(listingId)
      return {
        ...baseMetrics,
        geographicInsights
      }
    }

    return baseMetrics
  }

  /**
   * Buscar métricas do usuário com insights geográficos (Premium)
   */
  async getUserMetricsWithGeographicInsights(userId: string, includePremiumFeatures = false): Promise<RealTimeMetrics & { geographicInsights?: GeographicInsight }> {
    const baseMetrics = await this.getUserMetrics(userId)

    if (includePremiumFeatures) {
      const geographicInsights = await this.getUserGeographicInsights(userId)
      return {
        ...baseMetrics,
        dailyMetrics: [], // Not available in user metrics
        geographicInsights
      }
    }

    return {
      ...baseMetrics,
      dailyMetrics: []
    }
  }

  /**
   * Obter insights competitivos para um anúncio (Premium)
   */
  async getListingCompetitiveInsights(listingId: string): Promise<CompetitiveInsight | null> {
    try {
      return await competitorAnalysisService.analyzeListingCompetitivePerformance(listingId)
    } catch (error) {
      console.error('Erro ao obter insights competitivos:', error)
      return null
    }
  }

  /**
   * Obter insights competitivos consolidados do usuário (Premium)
   */
  async getUserCompetitiveInsights(userId: string): Promise<CompetitiveInsight[]> {
    try {
      return await competitorAnalysisService.getUserCompetitiveInsights(userId)
    } catch (error) {
      console.error('Erro ao obter insights competitivos do usuário:', error)
      return []
    }
  }

  /**
   * Buscar métricas completas com todos os insights premium
   */
  async getListingMetricsWithPremiumInsights(listingId: string): Promise<RealTimeMetrics> {
    const baseMetrics = await this.getListingMetrics(listingId)
    const geographicInsights = await this.getListingGeographicInsights(listingId)
    const competitiveInsights = await this.getListingCompetitiveInsights(listingId)

    return {
      ...baseMetrics,
      geographicInsights,
      competitiveInsights
    }
  }

  /**
   * Buscar métricas do usuário com todos os insights premium
   */
  async getUserMetricsWithPremiumInsights(userId: string): Promise<RealTimeMetrics & { 
    geographicInsights?: GeographicInsight
    competitiveInsights?: CompetitiveInsight[]
  }> {
    const baseMetrics = await this.getUserMetrics(userId)
    const geographicInsights = await this.getUserGeographicInsights(userId)
    const competitiveInsights = await this.getUserCompetitiveInsights(userId)

    return {
      ...baseMetrics,
      dailyMetrics: [],
      geographicInsights,
      competitiveInsights
    }
  }
}

// Instância singleton
export const realTimeService = new RealTimeService()
export default realTimeService