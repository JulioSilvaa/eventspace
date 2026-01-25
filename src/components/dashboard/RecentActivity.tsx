import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye, MessageCircle, Star, Package, TrendingUp, MapPin,
  Clock, Users, BarChart3, Target
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRealTimeMetrics } from '@/hooks/useRealTimeMetrics'
import { ActivityEvent } from '@/services/realTimeService'
import { Ad } from '@/types'

interface ActivityDisplayProps {
  id: string
  type: 'view' | 'contact' | 'rating' | 'ad_created' |
  'milestone' | 'update' | 'status_change' | 'peak_time' |
  'geographic_insight' | 'demographic_insight' | 'competitor_analysis' |
  'priority_lead' | 'auto_boost' | 'market_alert' | 'listing_created' |
  'review_received' | 'listing_milestone' | 'performance_insight' |
  'listing_updated' | 'price_updated' | 'photos_updated' |
  'description_updated' | 'contact_updated' | 'subscription_updated' | 'payment_succeeded'
  title: string
  description: string
  timestamp: Date
  actionable?: boolean
  metadata?: {
    adTitle?: string
    rating?: number
    contactType?: 'whatsapp' | 'phone'
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
    comment?: string
    reviewer_name?: string
  }
}

interface RecentActivityProps {
  userAds?: Ad[]
}

export default function RecentActivity({
  userAds = []
}: RecentActivityProps) {
  const { user } = useAuth()
  const [activities, setActivities] = useState<ActivityDisplayProps[]>([])

  // Helper para validar data antes de formatar
  const safeFormatDistanceToNow = (date: any) => {
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) {
        return 'recentemente'
      }
      return formatDistanceToNow(d, {
        addSuffix: true,
        locale: ptBR
      })
    } catch (e) {
      return 'recentemente'
    }
  }

  // Hook para métricas em tempo real
  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError
  } = useUserRealTimeMetrics(user?.id, {
    pollingInterval: 30000, // 30 segundos
    enablePolling: true
  })

  // Converter eventos reais em atividades para display
  const convertEventsToActivities = (events: ActivityEvent[], userAds: Ad[]): ActivityDisplayProps[] => {
    const activities: ActivityDisplayProps[] = []

    events.forEach((event) => {
      const ad = userAds.find(ad => ad.id === event.listing_id)
      const adTitle = ad?.title || 'Anúncio removido'

      let activityType: ActivityDisplayProps['type'] = 'update'
      let title = ''
      let description = ''

      switch (event.event_type) {
        case 'view':
          activityType = 'view'
          title = '👀 Nova visualização'
          description = `Seu anúncio "${adTitle}" foi visualizado`
          break

        case 'contact_whatsapp':
          activityType = 'contact'
          title = '📱 Contato WhatsApp'
          description = `Alguém entrou em contato via WhatsApp sobre "${adTitle}"`
          break

        case 'contact_phone':
          activityType = 'contact'
          title = '📞 Ligação recebida'
          description = `Alguém ligou sobre "${adTitle}"`
          break

        case 'favorite_add':
          activityType = 'rating'
          title = '⭐ Novo favorito'
          description = `"${adTitle}" foi adicionado aos favoritos`
          break

        case 'review':
          activityType = 'rating'
          title = '💬 Nova avaliação'
          description = `Você recebeu uma nova avaliação em "${adTitle}"`
          break

        case 'share':
          activityType = 'update'
          title = '🔗 Compartilhamento'
          description = `"${adTitle}" foi compartilhado${event.metadata?.platform ? ` no ${event.metadata.platform}` : ''}`
          break

        case 'listing_created':
          activityType = 'listing_created'
          title = '🎉 Anúncio Publicado'
          description = `"${adTitle}" foi publicado com sucesso`
          break

        case 'listing_updated': {
          activityType = 'listing_updated'
          title = '✏️ Anúncio Atualizado'
          const fields = (event.metadata?.changedFields as string[]) || []
          description = `"${adTitle}" foi atualizado${fields.length > 0 ? ` (${fields.join(', ')})` : ''}`
          break
        }

        case 'price_updated': {
          activityType = 'price_updated'
          title = '💰 Preço Atualizado'
          const oldPrice = event.metadata?.oldPrice
          const newPrice = event.metadata?.newPrice
          const priceChange = event.metadata?.priceChangePercent as number | undefined
          description = `Preço de "${adTitle}" alterado${oldPrice && newPrice ? ` de R$ ${oldPrice} para R$ ${newPrice}` : ''}${priceChange ? ` (${priceChange > 0 ? '+' : ''}${priceChange}%)` : ''}`
          break
        }

        case 'photos_updated': {
          activityType = 'photos_updated'
          title = '📸 Fotos Atualizadas'
          const photoAction = event.metadata?.photoAction
          const photoCount = event.metadata?.photoCount
          description = `Fotos de "${adTitle}" foram ${photoAction === 'added' ? 'adicionadas' :
            photoAction === 'removed' ? 'removidas' :
              'atualizadas'
            }${photoCount ? ` (${photoCount} fotos)` : ''}`
          break
        }

        case 'description_updated':
          activityType = 'description_updated'
          title = '📝 Descrição Atualizada'
          description = `Descrição de "${adTitle}" foi atualizada`
          break

        case 'contact_updated': {
          activityType = 'contact_updated'
          title = '📞 Contato Atualizado'
          const contactFields = (event.metadata?.updatedContactFields as string[]) || []
          description = `Informações de contato de "${adTitle}" foram atualizadas${contactFields.length > 0 ? ` (${contactFields.join(', ')})` : ''}`
          break
        }

        case 'status_change': {
          activityType = 'status_change'
          const newStatus = event.metadata?.newStatus
          const isPaused = newStatus === 'inactive' || newStatus === 'paused'
          title = isPaused ? '⏸️ Anúncio Pausado' : '▶️ Anúncio Ativado'
          description = `O status de "${adTitle}" mudou para ${isPaused ? 'Pausado' : 'Ativo'}`
          break
        }

        case 'subscription_updated': {
          activityType = 'subscription_updated'
          const status = event.metadata?.status
          const isCanceled = status === 'cancelled' || status === 'canceled'
          title = isCanceled ? '🚫 Assinatura Cancelada' : '⚠️ Atualização de Assinatura'
          description = isCanceled
            ? `A assinatura de "${adTitle}" foi cancelada`
            : `O status da assinatura de "${adTitle}" mudou para ${status}`
          break
        }

        case 'payment_succeeded': {
          activityType = 'payment_succeeded'
          title = '💳 Pagamento Confirmado'
          const amount = event.metadata?.amount as number
          const formattedAmount = amount ? (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''
          description = `Pagamento de ${formattedAmount} confirmado para "${adTitle}"`
          break
        }

        default:
          activityType = 'update'
          title = '📊 Atividade'
          description = `Nova atividade em "${adTitle}"`
      }

      activities.push({
        id: event.id || `event-${Date.now()}-${Math.random()}`,
        type: activityType,
        title,
        description,
        timestamp: new Date(event.created_at || Date.now()),
        metadata: {
          adTitle,
          listingId: event.listing_id,
          contactType: event.event_type === 'contact_whatsapp' ? 'whatsapp' :
            event.event_type === 'contact_phone' ? 'phone' : undefined,
          ...event.metadata
        }
      })
    })

    return activities
  }

  // Função para gerar atividades baseadas em métricas consolidadas
  const generateMetricsBasedActivities = (userAds: Ad[]): ActivityDisplayProps[] => {
    const activities: ActivityDisplayProps[] = []

    userAds.forEach((ad, index) => {
      const views = ad.views_count || 0

      // Atividade de criação/publicação de anúncio
      const isPublished = ad.status === 'active'

      activities.push({
        id: `ad-created-${ad.id}`,
        type: 'listing_created',
        title: isPublished ? '🎉 Anúncio Publicado' : '📝 Anúncio Criado',
        description: `"${ad.title}" foi ${isPublished ? 'publicado' : 'criado'} em ${ad.city}${isPublished ? '' : '. Aguardando ativação.'}`,
        timestamp: new Date(ad.created_at || Date.now()),
        metadata: {
          adTitle: ad.title,
          listingId: ad.id
        }
      })

      // Marco de visualizações
      if (views >= 50 && views % 25 === 0) {
        activities.push({
          id: `milestone-${ad.id}-${views}`,
          type: 'milestone',
          title: '🎯 Marco Atingido',
          description: `"${ad.title}" atingiu ${views} visualizações!`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * (2 + index)),
          metadata: {
            adTitle: ad.title,
            listingId: ad.id,
            milestone_value: views,
            milestone_type: 'views'
          }
        })
      }
    })

    return activities
  }

  // Atualizar atividades quando métricas mudarem
  useEffect(() => {
    if (!metrics) return

    const allActivities: ActivityDisplayProps[] = []

    // 1. Converter eventos reais em atividades
    if (metrics.recentEvents && metrics.recentEvents.length > 0) {
      const realTimeActivities = convertEventsToActivities(metrics.recentEvents, userAds)
      allActivities.push(...realTimeActivities)
    }

    // 2. Adicionar apenas atividades de publicação e marcos (não eventos individuais)
    const staticActivities = generateMetricsBasedActivities(userAds)
    // Filtrar apenas atividades que não sejam baseadas em eventos reais
    const filteredStaticActivities = staticActivities.filter(activity =>
      activity.type === 'listing_created' || activity.type === 'milestone'
    )
    allActivities.push(...filteredStaticActivities)

    // 3. Remover duplicatas e ordenar por timestamp
    const uniqueActivities = allActivities.filter((activity, index, arr) =>
      arr.findIndex(a => a.id === activity.id) === index
    )

    const sortedActivities = uniqueActivities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setActivities(sortedActivities)
  }, [metrics, userAds])

  // Fallback quando não há dados
  useEffect(() => {
    if (!metrics && !metricsLoading && userAds.length === 0) {
      // Usuário sem anúncios - mostrar atividades de boas-vindas
      setActivities([
        {
          id: 'welcome-1',
          type: 'update',
          title: 'Bem-vindo ao EventSpace!',
          description: 'Sua conta foi criada com sucesso. Crie seu primeiro anúncio para começar a receber contatos.',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          metadata: { adTitle: 'Sistema' }
        },
        {
          id: 'tip-1',
          type: 'update',
          title: '🚀 Como Começar',
          description: 'Anúncios com fotos de qualidade e descrição completa recebem mais contatos.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          metadata: { adTitle: 'Sistema' }
        }
      ])
    }
  }, [metrics, metricsLoading, userAds.length])

  const loading = metricsLoading
  const error = metricsError

  const getActivityIcon = (type: ActivityDisplayProps['type']) => {
    const iconClass = "h-4 w-4"

    switch (type) {
      case 'view':
        return <Eye className={`${iconClass} text-blue-500`} />
      case 'contact':
        return <MessageCircle className={`${iconClass} text-green-500`} />
      case 'rating':
        return <Star className={`${iconClass} text-yellow-500`} />
      case 'milestone':
        return <Target className={`${iconClass} text-purple-500`} />
      case 'update':
        return <Package className={`${iconClass} text-blue-500`} />
      case 'status_change':
        return <Package className={`${iconClass} text-gray-500`} />
      case 'geographic_insight':
        return <MapPin className={`${iconClass} text-indigo-500`} />
      case 'peak_time':
        return <Clock className={`${iconClass} text-orange-500`} />
      case 'demographic_insight':
        return <Users className={`${iconClass} text-pink-500`} />
      case 'competitor_analysis':
        return <BarChart3 className={`${iconClass} text-cyan-500`} />
      case 'priority_lead':
        return <Package className={`${iconClass} text-red-500`} />
      case 'auto_boost':
        return <TrendingUp className={`${iconClass} text-emerald-500`} />
      case 'market_alert':
        return <Package className={`${iconClass} text-violet-500`} />
      case 'listing_created':
        return <Package className={`${iconClass} text-purple-500`} />
      case 'listing_updated':
        return <Package className={`${iconClass} text-blue-600`} />
      case 'price_updated':
        return <Package className={`${iconClass} text-green-600`} />
      case 'photos_updated':
        return <Package className={`${iconClass} text-pink-600`} />
      case 'description_updated':
        return <Package className={`${iconClass} text-indigo-600`} />
      case 'contact_updated':
        return <Package className={`${iconClass} text-teal-600`} />
      case 'performance_insight':
        return <BarChart3 className={`${iconClass} text-cyan-500`} />
      case 'subscription_updated':
        return <Package className={`${iconClass} text-red-500`} />
      case 'payment_succeeded':
        return <TrendingUp className={`${iconClass} text-green-600`} />
      default:
        return <Eye className={`${iconClass} text-gray-500`} />
    }
  }

  const getActivityColor = (type: ActivityDisplayProps['type']) => {
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
      case 'listing_created':
        return 'bg-purple-50 border-purple-100'
      case 'listing_updated':
        return 'bg-blue-50 border-blue-100'
      case 'price_updated':
        return 'bg-green-50 border-green-100'
      case 'photos_updated':
        return 'bg-pink-50 border-pink-100'
      case 'description_updated':
        return 'bg-indigo-50 border-indigo-100'
      case 'contact_updated':
        return 'bg-teal-50 border-teal-100'
      case 'performance_insight':
        return 'bg-cyan-50 border-cyan-100'
      case 'subscription_updated':
        return 'bg-red-50 border-red-100'
      case 'payment_succeeded':
        return 'bg-green-50 border-green-100'
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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Atividade Recente
          </h2>
          <p className="text-sm font-medium text-gray-500">
            Últimas interações
          </p>
        </div>
        <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-red-300 mx-auto mb-4" />
          <p className="text-red-500 text-sm mb-2 font-medium">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-primary-600 hover:text-primary-700 font-bold bg-primary-50 px-3 py-1.5 rounded-lg"
          >
            Tentar novamente
          </button>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">
            Nenhuma atividade recente
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Suas notificações aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-4 p-3 md:p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white group`}
            >
              <div className={`flex-shrink-0 p-2.5 rounded-xl ${getActivityColor(activity.type)} group-hover:scale-110 transition-transform duration-300`}>
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 w-full">
                  <p className="text-sm font-medium text-gray-900 break-words line-clamp-2">
                    {activity.title}
                  </p>
                </div>

                <p className="text-xs mt-1 text-gray-600 break-words line-clamp-3">
                  {activity.description}
                </p>

                {activity.type === 'rating' && activity.metadata?.comment && (
                  <div className="mt-2 p-2 bg-gray-50 rounded italic text-xs text-gray-500 border-l-2 border-primary-300">
                    "{activity.metadata.comment}"
                    {activity.metadata.reviewer_name && (
                      <span className="block mt-1 font-semibold">— {activity.metadata.reviewer_name}</span>
                    )}
                  </div>
                )}

                {activity.metadata?.adTitle && (
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 break-words line-clamp-1 flex-1 min-w-0">
                      Anúncio: <span className="text-gray-700">{activity.metadata.adTitle}</span>
                    </p>
                    {activity.metadata?.listingId && (
                      <Link
                        to={activity.type === 'rating'
                          ? `/dashboard/avaliacoes?listing=${activity.metadata.listingId}`
                          : `/dashboard/analytics?listing=${activity.metadata.listingId}`
                        }
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {activity.type === 'rating' ? 'Ver avaliações →' : 'Ver estatísticas →'}
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
              </div>

              <div className="flex-shrink-0">
                <p className="text-xs text-gray-500">
                  {safeFormatDistanceToNow(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}