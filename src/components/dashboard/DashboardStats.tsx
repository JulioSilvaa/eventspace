import { Eye, MessageCircle, Star, Package, Ban, Trash2, XCircle, AlertCircle } from 'lucide-react'
import DashboardCard from './DashboardCard'

export interface DashboardStatsData {
  totalAds: number
  activeAds: number
  inactiveAds: number
  canceledAds: number
  deletedAds: number
  canceledPlans: number
  totalViews: number
  totalContacts: number
  averageRating?: number
  thisMonthViews: number
  lastMonthViews: number
  thisMonthContacts: number
  lastMonthContacts: number
}

interface DashboardStatsProps {
  data?: DashboardStatsData
  loading?: boolean
  isRealTime?: boolean
  lastUpdated?: Date | null
}

export default function DashboardStats({
  data,
  loading = false,
  isRealTime = false,
  lastUpdated
}: DashboardStatsProps) {

  // Ensure all numeric values are valid and not NaN
  const safeData = data ? {
    ...data,
    totalViews: isNaN(data.totalViews) ? 0 : data.totalViews,
    totalContacts: isNaN(data.totalContacts) ? 0 : data.totalContacts,
    thisMonthViews: isNaN(data.thisMonthViews) ? 0 : data.thisMonthViews,
    lastMonthViews: isNaN(data.lastMonthViews) ? 0 : data.lastMonthViews,
    thisMonthContacts: isNaN(data.thisMonthContacts) ? 0 : data.thisMonthContacts,
    lastMonthContacts: isNaN(data.lastMonthContacts) ? 0 : data.lastMonthContacts,
    inactiveAds: data.inactiveAds || 0,
    canceledAds: data.canceledAds || 0,
    deletedAds: data.deletedAds || 0,
    canceledPlans: data.canceledPlans || 0
  } : {
    totalAds: 0,
    activeAds: 0,
    inactiveAds: 0,
    canceledAds: 0,
    deletedAds: 0,
    canceledPlans: 0,
    totalViews: 0,
    totalContacts: 0,
    averageRating: 0,
    thisMonthViews: 0,
    lastMonthViews: 0,
    thisMonthContacts: 0,
    lastMonthContacts: 0
  }

  const statsData = safeData

  // Calculate trends with protection against division by zero
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) {
      // If no previous data, show current as 100% if positive, or 0% if zero
      return current > 0 ? 100 : 0
    }
    return Math.round(((current - previous) / previous) * 100)
  }

  const viewsTrend = {
    value: calculateTrend(statsData.thisMonthViews, statsData.lastMonthViews),
    label: 'vs mês anterior',
    isPositive: statsData.thisMonthViews > statsData.lastMonthViews
  }

  const contactsTrend = {
    value: calculateTrend(statsData.thisMonthContacts, statsData.lastMonthContacts),
    label: 'vs mês anterior',
    isPositive: statsData.thisMonthContacts > statsData.lastMonthContacts
  }

  const stats = [
    {
      title: 'Visualizações',
      value: (statsData.totalViews || 0).toLocaleString(),
      description: 'Total de visualizações',
      icon: Eye,
      iconColor: 'text-green-600',
      trend: viewsTrend
    },
    {
      title: 'Contatos Recebidos',
      value: statsData.totalContacts || 0,
      description: 'WhatsApp e ligações',
      icon: MessageCircle,
      iconColor: 'text-purple-600',
      trend: contactsTrend
    },
    {
      title: 'Anúncios Inativos',
      value: statsData.inactiveAds,
      description: 'Criados mas não pagos',
      icon: AlertCircle,
      iconColor: 'text-yellow-600'
    },

    ...(statsData.averageRating ? [{
      title: 'Avaliação Média',
      value: statsData.averageRating.toFixed(1),
      description: 'Baseado em avaliações',
      icon: Star,
      iconColor: 'text-yellow-600'
    }] : [])
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Resumo dos seus anúncios
          </h2>
          {isRealTime && (
            <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full self-start sm:self-auto">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-1"></div>
              Real-time
              {lastUpdated && (
                <span className="text-gray-500 ml-2 border-l border-green-200 pl-2">
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Acompanhe o desempenho dos seus anúncios no EventSpace
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
            trend={stat.trend}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}