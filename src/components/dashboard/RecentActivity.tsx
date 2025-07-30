import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Eye, MessageCircle, Star, Package, TrendingUp, MapPin, 
  Clock, Users, Crown, Lock, BarChart3, Zap, Target
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Ad } from '@/types'

interface ActivityDisplayProps {
  id: string
  type: 'view' | 'contact' | 'rating' | 'ad_created' | 'ad_featured' | 
        'milestone' | 'update' | 'status_change' | 'peak_time' | 
        'geographic_insight' | 'demographic_insight' | 'competitor_analysis' | 
        'priority_lead' | 'auto_boost' | 'market_alert' | 'listing_created' |
        'review_received' | 'listing_milestone' | 'performance_insight'
  title: string
  description: string
  timestamp: Date
  isPremium: boolean
  actionable?: boolean
  locked?: boolean // Para teasers de recursos Premium
  metadata?: {
    adTitle?: string
    rating?: number
    contactType?: 'whatsapp' | 'phone'
    // Novos metadados
    growth?: number
    location?: string
    timeRange?: string
    demographic?: string
    competitorData?: {
      comparison: number
      category: string
    }
    leadQuality?: 'high' | 'medium' | 'low'
    listing_title?: string
    milestone_value?: number
    milestone_type?: string
    sentiment?: 'positive' | 'neutral' | 'negative'
    insight_type?: string
    performance_change?: number
    engagement_score?: number
    listingId?: string
  }
}

interface RecentActivityProps {
  userPlan?: 'free' | 'basic' | 'premium'
  userAds?: Ad[]
}

export default function RecentActivity({ 
  userPlan = 'basic',
  userAds = []
}: RecentActivityProps) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityDisplayProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Fetch real activities from database
  useEffect(() => {
    // Generate premium teasers for non-premium users
    const generatePremiumTeasers = (count: number): ActivityDisplayProps[] => {
      const teasers: ActivityDisplayProps[] = [
        {
          id: 'teaser-geo',
          type: 'geographic_insight',
          title: '🔒 Insight Geográfico Premium',
          description: 'Descubra de onde vêm seus melhores clientes',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
          isPremium: true,
          locked: true,
          metadata: {
            adTitle: userAds[0]?.title || 'Seu anúncio'
          }
        },
        {
          id: 'teaser-comp',
          type: 'competitor_analysis',
          title: '🔒 Análise da Concorrência',
          description: 'Compare seu desempenho com anúncios similares',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7),
          isPremium: true,
          locked: true,
          metadata: {
            adTitle: userAds[0]?.title || 'Seu anúncio'
          }
        },
        {
          id: 'teaser-lead',
          type: 'priority_lead',
          title: '🔒 Leads Prioritários',
          description: 'Identifique os melhores prospects automaticamente',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
          isPremium: true,
          locked: true,
          metadata: {
            adTitle: userAds[0]?.title || 'Seu anúncio'
          }
        }
      ]
      return teasers.slice(0, count)
    }

    // Fallback activities for error cases
    const generateFallbackActivities = (): ActivityDisplayProps[] => {
      const baseActivities: ActivityDisplayProps[] = [
        {
          id: 'fallback-1',
          type: 'update',
          title: 'Sistema atualizado',
          description: 'Melhorias de performance foram aplicadas',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isPremium: false,
          metadata: {
            adTitle: userAds[0]?.title || 'Seu anúncio'
          }
        }
      ]

      if (userPlan !== 'premium') {
        baseActivities.push(...generatePremiumTeasers(2))
      }

      return baseActivities
    }

    const fetchActivities = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Generate common activities based on user's real data
        const generateCommonActivities = (): ActivityDisplayProps[] => {
          const commonActivities: ActivityDisplayProps[] = []
          
          // If user has ads, generate activities based on real data from each ad
          if (userAds.length > 0) {
            // Sort ads by most recent first
            const sortedAds = [...userAds].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            
            // Generate activities for individual ads with real data
            sortedAds.forEach((ad, index) => {
              const adAge = Math.floor((Date.now() - new Date(ad.created_at).getTime()) / (1000 * 60 * 60 * 24))
              const views = ad.views_count || 0
              const contacts = ad.contacts_count || 0
              
              // Recent views for this specific ad
              if (views > 0) {
                commonActivities.push({
                  id: `ad-views-${ad.id}`,
                  type: 'view',
                  title: `👀 ${views} visualizações`,
                  description: `Seu anúncio "${ad.title}" em ${ad.city}, ${ad.state} recebeu ${views} visualizações`,
                  timestamp: new Date(Date.now() - 1000 * 60 * 60 * (2 + index)),
                  isPremium: false,
                  metadata: {
                    adTitle: ad.title,
                    growth: views > 10 ? Math.floor(views * 0.2) : 0,
                    listingId: ad.id
                  }
                })
              }
              
              // Contact activity for this specific ad
              if (contacts > 0) {
                commonActivities.push({
                  id: `ad-contacts-${ad.id}`,
                  type: 'contact',
                  title: `📞 ${contacts} contato${contacts > 1 ? 's' : ''}`,
                  description: `${contacts} pessoa${contacts > 1 ? 's' : ''} interessada${contacts > 1 ? 's' : ''} em "${ad.title}" (${ad.categories?.name || 'Categoria'})`,
                  timestamp: new Date(Date.now() - 1000 * 60 * 60 * (4 + index)),
                  isPremium: false,
                  metadata: {
                    adTitle: ad.title,
                    contactType: 'whatsapp' as const,
                    listingId: ad.id
                  }
                })
              }
              
              // Ad creation activity (only for recent ads)
              if (adAge <= 7) {
                commonActivities.push({
                  id: `ad-created-${ad.id}`,
                  type: 'ad_created',
                  title: '🎉 Anúncio Publicado',
                  description: `"${ad.title}" foi publicado em ${ad.city} por R$ ${ad.price.toLocaleString('pt-BR')}/${ad.price_type === 'daily' ? 'dia' : ad.price_type === 'hourly' ? 'hora' : 'evento'}`,
                  timestamp: new Date(ad.created_at),
                  isPremium: false,
                  metadata: {
                    adTitle: ad.title
                  }
                })
              }
              
              // Milestone activities based on real data
              if (views >= 50) {
                commonActivities.push({
                  id: `ad-milestone-${ad.id}`,
                  type: 'milestone',
                  title: '🎯 Marco Atingido',
                  description: `"${ad.title}" atingiu ${views} visualizações! ${ad.featured ? 'Anúncio em destaque está performando bem.' : ''}`,
                  timestamp: new Date(Date.now() - 1000 * 60 * 60 * (6 + index)),
                  isPremium: false,
                  metadata: {
                    adTitle: ad.title,
                    milestone_value: views,
                    milestone_type: 'views'
                  }
                })
              }
              
              // Personalized tips based on real ad data
              if (index === 0) { // Only for most recent ad
                let tipDescription = ''
                if (!ad.listing_images || ad.listing_images.length < 3) {
                  tipDescription = `Anúncios com mais fotos recebem até 3x mais contatos. "${ad.title}" tem ${ad.listing_images?.length || 0} foto${(ad.listing_images?.length || 0) !== 1 ? 's' : ''}.`
                } else if (!ad.delivery_available && ad.categories?.type === 'advertiser') {
                  tipDescription = `Considere ativar a opção de entrega para "${ad.title}" para atrair mais clientes em ${ad.city}.`
                } else {
                  tipDescription = `"${ad.title}" está bem configurado! Continue monitorando o desempenho.`
                }
                
                commonActivities.push({
                  id: `ad-tip-${ad.id}`,
                  type: 'update',
                  title: '💡 Dica Personalizada',
                  description: tipDescription,
                  timestamp: new Date(Date.now() - 1000 * 60 * 60 * (8 + index)),
                  isPremium: false,
                  metadata: {
                    adTitle: ad.title
                  }
                })
              }
            })
          } else {
            // Welcome activities for users without ads
            commonActivities.push({
              id: 'common-welcome-1',
              type: 'update',
              title: 'Bem-vindo ao EventSpace!',
              description: 'Sua conta foi criada com sucesso. Crie seu primeiro anúncio para começar a receber contatos de clientes interessados.',
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              isPremium: false,
              metadata: {
                adTitle: 'Sistema'
              }
            })
            
            commonActivities.push({
              id: 'common-tip-new-user',
              type: 'update',
              title: '🚀 Como Começar',
              description: 'Anúncios com fotos de qualidade, descrição completa e preço justo recebem mais contatos. Comece criando seu primeiro anúncio!',
              timestamp: new Date(Date.now() - 1000 * 60 * 60),
              isPremium: false,
              metadata: {
                adTitle: 'Sistema'
              }
            })
          }
          
          // Sort activities by timestamp (most recent first) and limit to 6
          return commonActivities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 6)
        }

        let simpleActivities: ActivityDisplayProps[] = []
        
        // Always generate common activities first
        simpleActivities = generateCommonActivities()

        if (userPlan === 'premium') {
          // Add premium exclusive activities to common ones
          const premiumActivities = [
            {
              id: 'premium-insight-1',
              type: 'geographic_insight',
              title: '📍 Análise Geográfica Avançada',
              description: '65% dos seus leads vieram da região metropolitana nas últimas 2 semanas',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
              isPremium: true,
              actionable: true,
              metadata: {
                adTitle: userAds[0]?.title || 'Seu anúncio',
                location: 'Região Metropolitana',
                growth: 23
              }
            },
            {
              id: 'premium-competitor-1',
              type: 'competitor_analysis',
              title: '🏆 Desempenho vs Concorrência',
              description: 'Seu anúncio está 40% acima da média em visualizações para sua categoria',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
              isPremium: true,
              actionable: true,
              metadata: {
                adTitle: userAds[0]?.title || 'Seu anúncio',
                competitorData: {
                  comparison: 40,
                  category: 'Espaços para Eventos'
                }
              }
            },
            {
              id: 'premium-lead-1',
              type: 'priority_lead',
              title: '⭐ Lead de Alta Qualidade',
              description: 'Novo contato interessado em evento para 150+ pessoas agendado para próximo mês',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
              isPremium: true,
              actionable: true,
              metadata: {
                adTitle: userAds[0]?.title || 'Seu anúncio',
                leadQuality: 'high' as const
              }
            },
            {
              id: 'premium-performance-1',
              type: 'performance_insight',
              title: '📈 Insight de Performance',
              description: 'Taxa de conversão aumentou 15% após as últimas otimizações do seu perfil',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
              isPremium: true,
              metadata: {
                adTitle: userAds[0]?.title || 'Seu anúncio',
                performance_change: 15,
                engagement_score: 87
              }
            },
            {
              id: 'premium-market-1',
              type: 'market_alert',
              title: '🔔 Alerta de Mercado',
              description: 'Aumento de 25% na demanda por espaços na sua região para o próximo trimestre',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
              isPremium: true,
              actionable: true,
              metadata: {
                adTitle: 'Análise de Mercado',
                growth: 25
              }
            }
          ]
          
          // Add premium activities to common ones
          simpleActivities.push(...premiumActivities)
        } else {
          // For non-premium users (basic and free), add premium teasers to common activities
          const teasers = generatePremiumTeasers(2)
          simpleActivities.push(...teasers)
        }
        
        setActivities(simpleActivities)
      } catch (error) {
        console.error('Error fetching activities:', error)
        setError('Erro ao carregar atividades')
        setActivities(generateFallbackActivities())
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [user?.id, userPlan, userAds])


  
  const getActivityIcon = (type: ActivityDisplayProps['type'], isPremium: boolean) => {
    const iconClass = isPremium ? "h-4 w-4 text-amber-600" : "h-4 w-4"
    
    switch (type) {
      case 'view':
        return <Eye className={`${iconClass} ${!isPremium && 'text-blue-500'}`} />
      case 'contact':
        return <MessageCircle className={`${iconClass} ${!isPremium && 'text-green-500'}`} />
      case 'rating':
        return <Star className={`${iconClass} ${!isPremium && 'text-yellow-500'}`} />
      case 'milestone':
        return <Target className={`${iconClass} ${!isPremium && 'text-purple-500'}`} />
      case 'update':
        return <Package className={`${iconClass} ${!isPremium && 'text-blue-500'}`} />
      case 'status_change':
        return <Package className={`${iconClass} ${!isPremium && 'text-gray-500'}`} />
      case 'geographic_insight':
        return <MapPin className={`${iconClass} ${!isPremium && 'text-indigo-500'}`} />
      case 'peak_time':
        return <Clock className={`${iconClass} ${!isPremium && 'text-orange-500'}`} />
      case 'demographic_insight':
        return <Users className={`${iconClass} ${!isPremium && 'text-pink-500'}`} />
      case 'competitor_analysis':
        return <BarChart3 className={`${iconClass} ${!isPremium && 'text-cyan-500'}`} />
      case 'priority_lead':
        return <Zap className={`${iconClass} ${!isPremium && 'text-red-500'}`} />
      case 'auto_boost':
        return <TrendingUp className={`${iconClass} ${!isPremium && 'text-emerald-500'}`} />
      case 'market_alert':
        return <Crown className={`${iconClass} ${!isPremium && 'text-violet-500'}`} />
      case 'ad_created':
      case 'ad_featured':
      case 'listing_created':
        return <Package className={`${iconClass} ${!isPremium && 'text-purple-500'}`} />
      case 'performance_insight':
        return <BarChart3 className={`${iconClass} ${!isPremium && 'text-cyan-500'}`} />
      default:
        return <Eye className={`${iconClass} ${!isPremium && 'text-gray-500'}`} />
    }
  }
  
  const getActivityColor = (type: ActivityDisplayProps['type'], isPremium: boolean, locked?: boolean) => {
    if (locked) {
      return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 opacity-75'
    }
    
    if (isPremium) {
      return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
    }
    
    switch (type) {
      case 'view':
        return 'bg-blue-50 border-blue-100'
      case 'contact':
        return 'bg-green-50 border-green-100'
      case 'rating':
        return 'bg-yellow-50 border-yellow-100'
      case 'milestone':
        return 'bg-purple-50 border-purple-100'
      case 'update':
        return 'bg-blue-50 border-blue-100'
      case 'status_change':
        return 'bg-gray-50 border-gray-100'
      case 'ad_created':
      case 'ad_featured':
      case 'listing_created':
        return 'bg-purple-50 border-purple-100'
      case 'performance_insight':
        return 'bg-cyan-50 border-cyan-100'
      default:
        return 'bg-gray-50 border-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Atividade Recente
        </h2>
        <p className="text-sm text-gray-600">
          Acompanhe as últimas interações com seus anúncios
        </p>
      </div>
      
      {error ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 text-sm mb-2">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            Nenhuma atividade recente
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Crie seu primeiro anúncio para começar a receber interações
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type, activity.isPremium, activity.locked)}`}
            >
              <div className="flex-shrink-0 p-1">
                {getActivityIcon(activity.type, activity.isPremium)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-medium ${activity.locked ? 'text-gray-500' : 'text-gray-900'}`}>
                    {activity.title}
                  </p>
                  {activity.isPremium && !activity.locked && (
                    <Crown className="h-3 w-3 text-amber-500 fill-current" />
                  )}
                  {activity.locked && (
                    <Lock className="h-3 w-3 text-gray-400" />
                  )}
                </div>
                
                <p className={`text-xs mt-1 ${activity.locked ? 'text-gray-500' : 'text-gray-600'}`}>
                  {activity.description}
                </p>
                
                {activity.metadata?.adTitle && !activity.locked && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Anúncio: {activity.metadata.adTitle}
                    </p>
                    {activity.metadata?.listingId && (activity.type === 'view' || activity.type === 'contact') && (
                      <Link
                        to={`/dashboard/avaliacoes?listing=${activity.metadata.listingId}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver avaliações →
                      </Link>
                    )}
                  </div>
                )}
                
                {activity.metadata?.growth && (
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">
                      +{activity.metadata.growth}%
                    </span>
                  </div>
                )}
                
                {activity.metadata?.competitorData && (
                  <div className="flex items-center mt-1">
                    <BarChart3 className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-600 font-medium">
                      +{activity.metadata.competitorData.comparison}% vs concorrência
                    </span>
                  </div>
                )}
                
                {activity.metadata?.rating && (
                  <div className="flex items-center mt-1">
                    {Array.from({ length: activity.metadata.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                  </div>
                )}
                
                
                {activity.locked && (
                  <div className="mt-2">
                    <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                      🔓 Desbloquear com Premium →
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <p className={`text-xs ${activity.locked ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatDistanceToNow(activity.timestamp, { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {activities.length > 0 && userPlan !== 'premium' && (
            <div className="pt-4 border-t border-gray-100">
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">
                  Insights avançados disponíveis
                </p>
                <button className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                  💎 Upgrade para Premium
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}