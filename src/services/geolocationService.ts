interface GeolocationData {
  ip: string
  city: string
  region: string
  country: string
  country_code: string
  latitude: number
  longitude: number
  timezone: string
  org?: string
}

interface GeographicInsight {
  totalViews: number
  topCities: Array<{
    city: string
    region: string
    count: number
    percentage: number
  }>
  topRegions: Array<{
    region: string
    count: number
    percentage: number
  }>
  countryDistribution: Array<{
    country: string
    country_code: string
    count: number
    percentage: number
  }>
  trends: {
    period: string
    growth: number
    newLocations: number
  }
}

class GeolocationService {
  private cache = new Map<string, GeolocationData>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas

  /**
   * Obter dados de geolocalização para um IP
   */
  async getLocationFromIP(ip: string): Promise<GeolocationData | null> {
    if (!ip || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return null
    }

    // Verificar cache
    const cached = this.cache.get(ip)
    if (cached) {
      return cached
    }

    try {
      // Usar ipapi.co como API gratuita confiável
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        console.warn('Erro na API de geolocalização:', data.reason)
        return null
      }

      const locationData: GeolocationData = {
        ip,
        city: data.city || 'Desconhecido',
        region: data.region || 'Desconhecido',
        country: data.country_name || 'Desconhecido',
        country_code: data.country_code || 'BR',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        timezone: data.timezone || 'America/Sao_Paulo',
        org: data.org
      }

      // Armazenar no cache
      this.cache.set(ip, locationData)

      // Limpar cache após duração especificada
      setTimeout(() => {
        this.cache.delete(ip)
      }, this.CACHE_DURATION)

      return locationData

    } catch (error) {
      console.error('Erro ao obter geolocalização:', error)
      return null
    }
  }

  /**
   * Enriquecer eventos com dados de geolocalização
   */
  async enrichEventWithLocation(event: Record<string, any>): Promise<Record<string, any>> {
    if (!event.metadata?.ip) {
      return event
    }

    const locationData = await this.getLocationFromIP(event.metadata.ip)
    
    if (!locationData) {
      return event
    }

    return {
      ...event,
      metadata: {
        ...event.metadata,
        location: {
          city: locationData.city,
          region: locationData.region,
          country: locationData.country,
          country_code: locationData.country_code,
          coordinates: {
            lat: locationData.latitude,
            lng: locationData.longitude
          }
        }
      }
    }
  }

  /**
   * Analisar padrões geográficos dos eventos (Premium feature)
   */
  async analyzeGeographicPatterns(events: Record<string, any>[]): Promise<GeographicInsight> {
    const eventsWithLocation = []
    
    // Enriquecer todos os eventos com dados de localização
    for (const event of events) {
      if (event.metadata?.ip) {
        const enrichedEvent = await this.enrichEventWithLocation(event)
        if (enrichedEvent.metadata?.location) {
          eventsWithLocation.push(enrichedEvent)
        }
      }
    }

    const totalViews = eventsWithLocation.length

    // Contar por cidade
    const cityMap = new Map<string, { count: number, region: string }>()
    eventsWithLocation.forEach(event => {
      const location = event.metadata.location
      const cityKey = `${location.city}, ${location.region}`
      const current = cityMap.get(cityKey) || { count: 0, region: location.region }
      cityMap.set(cityKey, { count: current.count + 1, region: location.region })
    })

    // Contar por região
    const regionMap = new Map<string, number>()
    eventsWithLocation.forEach(event => {
      const region = event.metadata.location.region
      regionMap.set(region, (regionMap.get(region) || 0) + 1)
    })

    // Contar por país
    const countryMap = new Map<string, { count: number, code: string }>()
    eventsWithLocation.forEach(event => {
      const location = event.metadata.location
      const current = countryMap.get(location.country) || { count: 0, code: location.country_code }
      countryMap.set(location.country, { count: current.count + 1, code: location.country_code })
    })

    // Ordenar e formatar resultados
    const topCities = Array.from(cityMap.entries())
      .map(([city, data]) => ({
        city,
        region: data.region,
        count: data.count,
        percentage: Math.round((data.count / totalViews) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const topRegions = Array.from(regionMap.entries())
      .map(([region, count]) => ({
        region,
        count,
        percentage: Math.round((count / totalViews) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const countryDistribution = Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        country_code: data.code,
        count: data.count,
        percentage: Math.round((data.count / totalViews) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    // Calcular tendências (comparar com período anterior)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentEvents = eventsWithLocation.filter(
      event => new Date(event.created_at) > weekAgo
    )
    const olderEvents = eventsWithLocation.filter(
      event => new Date(event.created_at) <= weekAgo
    )

    const recentLocations = new Set(recentEvents.map(e => e.metadata.location.city))
    const olderLocations = new Set(olderEvents.map(e => e.metadata.location.city))
    const newLocations = recentLocations.size - olderLocations.size

    const growth = olderEvents.length > 0 
      ? Math.round(((recentEvents.length - olderEvents.length) / olderEvents.length) * 100)
      : 100

    return {
      totalViews,
      topCities,
      topRegions,
      countryDistribution,
      trends: {
        period: 'últimos 7 dias',
        growth,
        newLocations: Math.max(0, newLocations)
      }
    }
  }

  /**
   * Obter insights geográficos para um anúncio específico (Premium)
   */
  async getListingGeographicInsights(listingId: string, events: Record<string, any>[]): Promise<GeographicInsight> {
    const listingEvents = events.filter(event => event.listing_id === listingId)
    return this.analyzeGeographicPatterns(listingEvents)
  }

  /**
   * Obter insights geográficos consolidados do usuário (Premium)
   */
  async getUserGeographicInsights(userListingIds: string[], events: Record<string, any>[]): Promise<GeographicInsight> {
    const userEvents = events.filter(event => userListingIds.includes(event.listing_id))
    return this.analyzeGeographicPatterns(userEvents)
  }

  /**
   * Limpar cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Instância singleton
export const geolocationService = new GeolocationService()
export default geolocationService
export type { GeolocationData, GeographicInsight }