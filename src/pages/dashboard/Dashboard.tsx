import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { TrendingUp, LogOut, Home, ArrowLeft } from 'lucide-react'
import DashboardStats, { DashboardStatsData } from '@/components/dashboard/DashboardStats'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { useAuth } from '@/hooks/useAuth'
import { useAdsStore } from '@/stores/adsStore'
import { useUserRealTimeMetrics } from '@/hooks/useRealTimeMetrics'

interface DashboardData extends DashboardStatsData {
  recentAds: Array<{
    id: string
    title: string
    category: string
    status: 'active' | 'inactive' | 'pending' | 'rejected' | 'suspended'
    views: number
    contacts: number
    createdAt: string
  }>
  quickStats: {
    pendingMessages: number
    expiringAds: number
    recommendedActions: number
  }
}

export default function Dashboard() {
  const {
    user,
    profile,
    signOut,
    isLoading,
    refreshProfile
  } = useAuth()
  const { userAds, fetchUserAds } = useAdsStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isWelcome = searchParams.get('welcome') === 'true'
  const isNewAd = searchParams.get('newAd') === 'true'
  const [data, setData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  // Hook para métricas em tempo real
  const {
    metrics: realTimeMetrics,
    isLoading: metricsLoading
  } = useUserRealTimeMetrics(user?.id, {
    pollingInterval: 30000,
    enablePolling: true
  })

  // Carregar anúncios do usuário e refresh profile se voltando do checkout
  useEffect(() => {
    if (user) {
      fetchUserAds(user.id)
      const urlParams = new URLSearchParams(window.location.search)
      const fromCheckout = urlParams.get('from_checkout') === 'true'
      if (fromCheckout) {
        refreshProfile()
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [user, fetchUserAds, refreshProfile])

  // Calcular estatísticas
  useEffect(() => {
    if (userAds.length > 0) {
      const activeAds = userAds.filter(ad => ad.status === 'active')
      const inactiveAds = userAds.filter(ad => ad.status === 'inactive' || ad.status === 'pending')
      const canceledAds = userAds.filter(ad => ad.status === 'suspended')

      let totalViews = 0
      let totalContacts = 0

      if (realTimeMetrics) {
        totalViews = isNaN(realTimeMetrics.totalViews) ? 0 : (realTimeMetrics.totalViews || 0)
        totalContacts = isNaN(realTimeMetrics.totalContacts) ? 0 : (realTimeMetrics.totalContacts || 0)
      } else {
        totalViews = userAds.reduce((sum, ad) => sum + (ad.views_count || 0), 0)
        totalContacts = Math.floor(totalViews * 0.08)
      }

      const recentAds = userAds.slice(0, 3).map(ad => ({
        id: ad.id,
        title: ad.title,
        category: ad.categories?.name || 'Categoria não encontrada',
        status: ad.status,
        views: ad.views_count || 0,
        contacts: Math.floor((ad.views_count || 0) * 0.08),
        createdAt: ad.created_at ? ad.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }))

      setData({
        totalAds: userAds.length,
        activeAds: activeAds.length,
        inactiveAds: inactiveAds.length,
        canceledAds: canceledAds.length,
        deletedAds: 0,
        canceledPlans: 0,
        totalViews: totalViews,
        totalContacts: totalContacts,
        averageRating: 4.8,
        thisMonthViews: Math.floor(totalViews * 0.6),
        lastMonthViews: Math.floor(totalViews * 0.4),
        thisMonthContacts: Math.floor(totalContacts * 0.6),
        lastMonthContacts: Math.floor(totalContacts * 0.4),
        recentAds,
        quickStats: {
          pendingMessages: Math.floor(totalContacts * 0.3),
          expiringAds: userAds.filter(ad => ad.status === 'active').length > 0 ? 1 : 0,
          recommendedActions: 2
        }
      })
    } else {
      setData({
        totalAds: 0, activeAds: 0, inactiveAds: 0, canceledAds: 0, deletedAds: 0, canceledPlans: 0,
        totalViews: 0, totalContacts: 0, averageRating: 0,
        thisMonthViews: 0, lastMonthViews: 0, thisMonthContacts: 0, lastMonthContacts: 0,
        recentAds: [],
        quickStats: { pendingMessages: 0, expiringAds: 0, recommendedActions: 0 }
      })
    }
    setLoadingData(false)
  }, [userAds, realTimeMetrics])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Carregando painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] selection:bg-primary-500 selection:text-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-4 md:py-6 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-black text-secondary-950 tracking-tight">
                {isWelcome ? 'Bem-vindo!' : `Olá, ${profile?.full_name?.split(' ')[0] || 'Gestor'}!`}
              </h1>
              <p className="text-gray-500 font-medium text-sm mt-1">
                {userAds.length > 0 ? 'Aqui está o resumo dos seus espaços.' : 'Comece a anunciar seus espaços hoje.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-white hover:text-primary-500 hover:shadow-md transition-all active:scale-95 border border-transparent hover:border-gray-100"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              <button
                onClick={async () => {
                  navigate('/')
                  await signOut()
                }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95 border border-transparent hover:border-red-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Success Banner */}
        {isNewAd && (
          <div className="mb-8 bg-white border border-green-100 rounded-3xl p-6 md:p-8 shadow-lg shadow-green-500/5 relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-32 translate-x-16 opacity-50"></div>
            <div className="relative flex flex-col md:flex-row items-start gap-6">
              <div className="bg-green-100 p-4 rounded-2xl flex-shrink-0 text-green-600 shadow-sm">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-secondary-950 mb-2">
                  Anúncio Publicado! 🚀
                </h3>
                <p className="text-gray-600 font-medium mb-6 leading-relaxed max-w-2xl">
                  Seu espaço já está visível para milhares de clientes. Acompanhe as visualizações e contatos por aqui.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/dashboard/meus-anuncios"
                    className="flex-1 sm:flex-none justify-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all text-sm font-bold active:scale-95"
                  >
                    Gerenciar Anúncios
                  </Link>
                  <Link
                    to="/espacos"
                    className="flex-1 sm:flex-none justify-center border-2 border-green-100 text-green-700 bg-white px-6 py-3 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all text-sm font-bold active:scale-95"
                  >
                    Ver meu Anúncio
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <DashboardStats
          data={data || undefined}
          loading={loadingData}
          isRealTime={!!realTimeMetrics}
          lastUpdated={realTimeMetrics ? new Date() : null}
        />

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 mt-8">

          {/* Main Content Area */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-8">
            <RecentActivity userAds={userAds} />

            {/* Pro Tips Card */}
            <div className="bg-secondary-950 rounded-[2.5rem] p-8 relative overflow-hidden text-white shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-[80px] opacity-20 -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 translate-y-20 -translate-x-20"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl">
                    <TrendingUp className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-xl font-bold">Dicas de Especialista</h3>
                </div>

                <p className="text-gray-300 font-medium mb-8 max-w-lg">
                  Anúncios completos recebem até <strong className="text-white">5x mais contatos</strong>. Siga nosso checklist para turbinar seus resultados.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { text: 'Adicione 5+ fotos em alta', done: true },
                    { text: 'Preencha todas as comodidades', done: true },
                    { text: 'Responda rápido no WhatsApp', done: false },
                    { text: 'Mantenha preços atualizados', done: false }
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.done ? 'bg-primary-500/10 border-primary-500/20' : 'bg-white/5 border-white/10'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.done ? 'bg-primary-400' : 'bg-gray-600'}`}></div>
                      <span className={`text-sm font-bold ${item.done ? 'text-primary-200' : 'text-gray-400'}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="order-1 lg:order-2 lg:col-span-1 space-y-8">
            <QuickActions userAds={userAds} />
          </div>

        </div>
      </main>
    </div>
  )
}