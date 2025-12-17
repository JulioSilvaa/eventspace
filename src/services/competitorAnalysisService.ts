import { apiClient } from '@/lib/api-client'

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
  /**
   * Analisar performance competitiva de um anúncio (Premium)
   */
  async analyzeListingCompetitivePerformance(listingId: string): Promise<CompetitiveInsight | null> {
    try {
      const { data, error } = await apiClient.get<CompetitiveInsight>(`/api/competitors/listings/${listingId}/insights`)

      if (error) {
        console.error('Erro ao obter insights do anúncio:', error)
        return null
      }

      return data || null
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
      const { data, error } = await apiClient.get<CompetitiveInsight[]>(`/api/competitors/user/${userId}/insights`)

      if (error) {
        console.error('Erro ao obter insights competitivos do usuário:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Erro ao obter insights competitivos do usuário:', error)
      return []
    }
  }

  /**
   * Limpar cache de benchmarks
   * (Mantido para compatibilidade, mas o cache agora é gerenciado pelo servidor ou navegador)
   */
  clearCache(): void {
    // No-op
  }
}

// Instância singleton
export const competitorAnalysisService = new CompetitorAnalysisService()
export default competitorAnalysisService
export type { CompetitiveInsight, CompetitorMetrics, CategoryBenchmark }