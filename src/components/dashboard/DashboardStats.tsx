import { Eye, MessageCircle, Star, Package } from 'lucide-react'
import DashboardCard from './DashboardCard'

interface DashboardStatsData {
  totalAds: number
  activeAds: number
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
  
  // Mock data for demonstration
  const mockData: DashboardStatsData = {
    totalAds: 5,
    activeAds: 4,
    totalViews: 287,
    totalContacts: 23,
    averageRating: 4.8,
    thisMonthViews: 156,
    lastMonthViews: 131,
    thisMonthContacts: 15,
    lastMonthContacts: 8
  }
  
  const statsData = data || mockData
  
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
      title: 'Total de Anúncios',
      value: statsData.totalAds,
      description: `${statsData.activeAds} ativos`,
      icon: Package,
      iconColor: 'text-blue-600'
    },
    {
      title: 'Visualizações',
      value: statsData.totalViews.toLocaleString(),
      description: 'Total de visualizações',
      icon: Eye,
      iconColor: 'text-green-600',
      trend: viewsTrend
    },
    {
      title: 'Contatos Recebidos',
      value: statsData.totalContacts,
      description: 'WhatsApp e ligações',
      icon: MessageCircle,
      iconColor: 'text-purple-600',
      trend: contactsTrend
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Resumo dos seus anúncios
          </h2>
          {isRealTime && (
            <div className="flex items-center text-xs text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-1"></div>
              Real-time
              {lastUpdated && (
                <span className="text-gray-500 ml-2">
                  Atualizado {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Acompanhe o desempenho dos seus anúncios no EventSpace
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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