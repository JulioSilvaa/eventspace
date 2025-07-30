import { supabase } from '@/lib/supabase'

interface CompetitorMetrics {
  averageViews: number
  averageContacts: number
  averageFavorites: number
  averageReviews: number
  totalListings: number
  activePeriod: string
}

interface CompetitiveInsight {
  listingId: string
  category: string
  userMetrics: {
    views: number
    contacts: number
    favorites: number
    reviews: number
    engagementRate: number
  }
  categoryAverages: CompetitorMetrics
  performance: {
    viewsComparison: {
      value: number
      percentage: number
      status: 'above' | 'below' | 'average'
    }
    contactsComparison: {
      value: number
      percentage: number
      status: 'above' | 'below' | 'average'
    }
    favoritesComparison: {
      value: number
      percentage: number
      status: 'above' | 'below' | 'average'
    }
    overallRanking: {
      percentile: number
      position: string // 'top 10%', 'top 25%', 'average', 'below average'
    }
  }
  recommendations: string[]
  marketTrends: {
    description: string
    impact: 'positive' | 'negative' | 'neutral'
    actionable: boolean
  }[]
}

interface CategoryBenchmark {
  categoryId: string
  categoryName: string
  metrics: CompetitorMetrics
  topPerformers: {
    listing_id: string
    score: number
  }[]
  lastUpdated: Date
}

class CompetitorAnalysisService {
  private benchmarkCache = new Map<string, CategoryBenchmark>()
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000 // 6 horas

  /**
   * Calcular métricas médias da categoria
   */
  private async calculateCategoryAverages(categoryId: string, excludeListingId?: string): Promise<CompetitorMetrics> {
    try {
      // Buscar todos os anúncios da categoria (excluindo o anúncio atual)
      let query = supabase
        .from('listings')
        .select(`
          id,
          created_at,
          metrics_summary (
            views_count,
            contacts_count,
            favorites_count,
            reviews_count
          )
        `)
        .eq('category_id', categoryId)
        .eq('status', 'active')

      if (excludeListingId) {
        query = query.neq('id', excludeListingId)
      }

      const { data: listings, error } = await query

      if (error) {
        throw error
      }

      if (!listings || listings.length === 0) {
        return {
          averageViews: 0,
          averageContacts: 0,
          averageFavorites: 0,
          averageReviews: 0,
          totalListings: 0,
          activePeriod: 'últimos 30 dias'
        }
      }

      // Calcular médias baseadas nos últimos 30 dias
      const totalViews = listings.reduce((sum, listing) => {
        const metrics = listing.metrics_summary || []
        return sum + metrics.reduce((s: number, m: Record<string, any>) => s + (m.views_count || 0), 0)
      }, 0)

      const totalContacts = listings.reduce((sum, listing) => {
        const metrics = listing.metrics_summary || []
        return sum + metrics.reduce((s: number, m: Record<string, any>) => s + (m.contacts_count || 0), 0)
      }, 0)

      const totalFavorites = listings.reduce((sum, listing) => {
        const metrics = listing.metrics_summary || []
        return sum + metrics.reduce((s: number, m: Record<string, any>) => s + (m.favorites_count || 0), 0)
      }, 0)

      const totalReviews = listings.reduce((sum, listing) => {
        const metrics = listing.metrics_summary || []
        return sum + metrics.reduce((s: number, m: Record<string, any>) => s + (m.reviews_count || 0), 0)
      }, 0)

      const totalListings = listings.length

      return {
        averageViews: Math.round(totalViews / totalListings),
        averageContacts: Math.round(totalContacts / totalListings),
        averageFavorites: Math.round(totalFavorites / totalListings),
        averageReviews: Math.round(totalReviews / totalListings),
        totalListings,
        activePeriod: 'últimos 30 dias'
      }

    } catch (error) {
      console.error('Erro ao calcular médias da categoria:', error)
      return {
        averageViews: 0,
        averageContacts: 0,
        averageFavorites: 0,
        averageReviews: 0,
        totalListings: 0,
        activePeriod: 'últimos 30 dias'
      }
    }
  }

  /**
   * Obter benchmark da categoria (com cache)
   */
  private async getCategoryBenchmark(categoryId: string, categoryName: string, excludeListingId?: string): Promise<CategoryBenchmark> {
    const cacheKey = `${categoryId}-${excludeListingId || 'all'}`
    const cached = this.benchmarkCache.get(cacheKey)

    if (cached && (Date.now() - cached.lastUpdated.getTime()) < this.CACHE_DURATION) {
      return cached
    }

    const metrics = await this.calculateCategoryAverages(categoryId, excludeListingId)
    
    const benchmark: CategoryBenchmark = {
      categoryId,
      categoryName,
      metrics,
      topPerformers: [], // TODO: Implementar top performers
      lastUpdated: new Date()
    }

    this.benchmarkCache.set(cacheKey, benchmark)
    return benchmark
  }

  /**
   * Calcular taxa de engagement
   */
  private calculateEngagementRate(views: number, contacts: number, favorites: number): number {
    if (views === 0) return 0
    return Math.round(((contacts + favorites) / views) * 100)
  }

  /**
   * Determinar status de performance
   */
  private getPerformanceStatus(userValue: number, averageValue: number): 'above' | 'below' | 'average' {
    const threshold = 0.1 // 10% de margem
    const ratio = userValue / (averageValue || 1)

    if (ratio > (1 + threshold)) return 'above'
    if (ratio < (1 - threshold)) return 'below'
    return 'average'
  }

  /**
   * Calcular percentual de diferença
   */
  private calculatePercentage(userValue: number, averageValue: number): number {
    if (averageValue === 0) return userValue > 0 ? 100 : 0
    return Math.round(((userValue - averageValue) / averageValue) * 100)
  }

  /**
   * Gerar recomendações baseadas na performance
   */
  private generateRecommendations(insight: CompetitiveInsight): string[] {
    const recommendations: string[] = []
    const { performance } = insight

    if (performance.viewsComparison.status === 'below') {
      recommendations.push('Melhore o título e as fotos do anúncio para aumentar as visualizações')
      recommendations.push('Considere otimizar as palavras-chave na descrição')
    }

    if (performance.contactsComparison.status === 'below') {
      recommendations.push('Adicione mais informações de contato (WhatsApp, telefone)')
      recommendations.push('Inclua preços competitivos e condições claras')
    }

    if (performance.favoritesComparison.status === 'below') {
      recommendations.push('Invista em fotos de maior qualidade')
      recommendations.push('Destaque os diferenciais do seu produto/serviço')
    }

    if (insight.userMetrics.engagementRate < 5) {
      recommendations.push('Sua taxa de engagement está baixa - revise a descrição e preços')
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue com o excelente trabalho! Seu anúncio está performando bem.')
      recommendations.push('Considere criar mais anúncios para expandir seu alcance')
    }

    return recommendations
  }

  /**
   * Gerar insights de mercado
   */
  private generateMarketTrends(categoryName: string, metrics: CompetitorMetrics): any[] {
    const trends = []

    if (metrics.averageViews > 100) {
      trends.push({
        description: `A categoria "${categoryName}" está com alta demanda - média de ${metrics.averageViews} visualizações`,
        impact: 'positive' as const,
        actionable: true
      })
    }

    if (metrics.totalListings < 10) {
      trends.push({
        description: `Pouca concorrência na categoria "${categoryName}" - apenas ${metrics.totalListings} anúncios ativos`,
        impact: 'positive' as const,
        actionable: true
      })
    } else if (metrics.totalListings > 50) {
      trends.push({
        description: `Alta concorrência na categoria "${categoryName}" - ${metrics.totalListings} anúncios ativos`,
        impact: 'negative' as const,
        actionable: true
      })
    }

    if (metrics.averageContacts / Math.max(metrics.averageViews, 1) > 0.1) {
      trends.push({
        description: 'Taxa de conversão alta nesta categoria - oportunidade de bons resultados',
        impact: 'positive' as const,
        actionable: false
      })
    }

    return trends
  }

  /**
   * Calcular ranking percentil
   */
  private calculateRanking(userScore: number, categoryMetrics: CompetitorMetrics): { percentile: number, position: string } {
    // Calcular score baseado nas métricas (simplificado)
    const avgScore = (categoryMetrics.averageViews + categoryMetrics.averageContacts + categoryMetrics.averageFavorites) / 3
    const ratio = userScore / Math.max(avgScore, 1)

    const percentile = Math.min(Math.round(ratio * 50) + 25, 100) // Normalize to 0-100
    let position = 'average'

    if (percentile >= 90) position = 'top 10%'
    else if (percentile >= 75) position = 'top 25%'
    else if (percentile >= 50) position = 'average'
    else position = 'below average'

    return { percentile, position }
  }

  /**
   * Analisar performance competitiva de um anúncio (Premium)
   */
  async analyzeListingCompetitivePerformance(listingId: string): Promise<CompetitiveInsight | null> {
    try {
      // Buscar dados do anúncio
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          category_id,
          categories (
            id,
            name
          ),
          metrics_summary (
            views_count,
            contacts_count,
            favorites_count,
            reviews_count
          )
        `)
        .eq('id', listingId)
        .single()

      if (listingError || !listing) {
        throw listingError || new Error('Anúncio não encontrado')
      }

      const category = listing.categories
      if (!category) {
        throw new Error('Categoria não encontrada')
      }

      // Calcular métricas do usuário
      const userMetrics = listing.metrics_summary?.reduce((acc: Record<string, any>, metric: Record<string, any>) => ({
        views: acc.views + (metric.views_count || 0),
        contacts: acc.contacts + (metric.contacts_count || 0),
        favorites: acc.favorites + (metric.favorites_count || 0),
        reviews: acc.reviews + (metric.reviews_count || 0)
      }), { views: 0, contacts: 0, favorites: 0, reviews: 0 }) || { views: 0, contacts: 0, favorites: 0, reviews: 0 }

      userMetrics.engagementRate = this.calculateEngagementRate(
        userMetrics.views, 
        userMetrics.contacts, 
        userMetrics.favorites
      )

      // Obter benchmark da categoria
      const benchmark = await this.getCategoryBenchmark(category.id, category.name, listingId)

      // Calcular comparações
      const viewsComparison = {
        value: userMetrics.views - benchmark.metrics.averageViews,
        percentage: this.calculatePercentage(userMetrics.views, benchmark.metrics.averageViews),
        status: this.getPerformanceStatus(userMetrics.views, benchmark.metrics.averageViews)
      }

      const contactsComparison = {
        value: userMetrics.contacts - benchmark.metrics.averageContacts,
        percentage: this.calculatePercentage(userMetrics.contacts, benchmark.metrics.averageContacts),
        status: this.getPerformanceStatus(userMetrics.contacts, benchmark.metrics.averageContacts)
      }

      const favoritesComparison = {
        value: userMetrics.favorites - benchmark.metrics.averageFavorites,
        percentage: this.calculatePercentage(userMetrics.favorites, benchmark.metrics.averageFavorites),
        status: this.getPerformanceStatus(userMetrics.favorites, benchmark.metrics.averageFavorites)
      }

      const userScore = (userMetrics.views + userMetrics.contacts + userMetrics.favorites) / 3
      const overallRanking = this.calculateRanking(userScore, benchmark.metrics)

      const insight: CompetitiveInsight = {
        listingId,
        category: category.name,
        userMetrics,
        categoryAverages: benchmark.metrics,
        performance: {
          viewsComparison,
          contactsComparison,
          favoritesComparison,
          overallRanking
        },
        recommendations: [],
        marketTrends: this.generateMarketTrends(category.name, benchmark.metrics)
      }

      insight.recommendations = this.generateRecommendations(insight)

      return insight

    } catch (error) {
      console.error('Erro ao analisar performance competitiva:', error)
      return null
    }
  }

  /**
   * Obter insights competitivos consolidados do usuário (Premium)
   */
  async getUserCompetitiveInsights(userId: string): Promise<CompetitiveInsight[]> {
    try {
      // Buscar anúncios do usuário
      const { data: userListings, error } = await supabase
        .from('listings')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) {
        throw error
      }

      if (!userListings || userListings.length === 0) {
        return []
      }

      const insights: CompetitiveInsight[] = []

      // Analisar cada anúncio
      for (const listing of userListings) {
        const insight = await this.analyzeListingCompetitivePerformance(listing.id)
        if (insight) {
          insights.push(insight)
        }
      }

      return insights

    } catch (error) {
      console.error('Erro ao obter insights competitivos do usuário:', error)
      return []
    }
  }

  /**
   * Limpar cache de benchmarks
   */
  clearCache(): void {
    this.benchmarkCache.clear()
  }
}

// Instância singleton
export const competitorAnalysisService = new CompetitorAnalysisService()
export default competitorAnalysisService
export type { CompetitiveInsight, CompetitorMetrics, CategoryBenchmark }