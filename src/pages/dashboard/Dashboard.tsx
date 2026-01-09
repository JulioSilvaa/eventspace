import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus, TrendingUp, LogOut, Home } from 'lucide-react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { useAuth } from '@/hooks/useAuth'
import { useAdsStore } from '@/stores/adsStore'
import { useUserRealTimeMetrics } from '@/hooks/useRealTimeMetrics'

interface DashboardData {
  totalAds: number
  activeAds: number
  totalViews: number
  totalContacts: number
  averageRating?: number
  thisMonthViews: number
  lastMonthViews: number
  thisMonthContacts: number
  lastMonthContacts: number
  recentAds: Array<{
    id: string
    title: string
    category: string
    status: 'active' | 'inactive' | 'pending' | 'rejected'
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
  const isWelcome = searchParams.get('welcome') === 'true'
  const isNewAd = searchParams.get('newAd') === 'true'
  const [data, setData] = useState<DashboardData | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  // Hook para métricas em tempo real
  const {
    metrics: realTimeMetrics,
    isLoading: metricsLoading
  } = useUserRealTimeMetrics(user?.id, {
    pollingInterval: 30000, // 30 segundos
    enablePolling: true // Endpoint implementado!
  })


  // Carregar anúncios do usuário e refresh profile se voltando do checkout
  useEffect(() => {
    if (user) {
      fetchUserAds(user.id)

      // Se vem de uma página de checkout, força refresh do perfil
      const urlParams = new URLSearchParams(window.location.search)
      const fromCheckout = urlParams.get('from_checkout') === 'true'
      if (fromCheckout) {
        refreshProfile()
        // Remove o parâmetro da URL
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [user, fetchUserAds, refreshProfile])

  // Calcular estatísticas usando dados real-time quando disponíveis
  useEffect(() => {
    if (userAds.length > 0) {
      const activeAds = userAds.filter(ad => ad.status === 'active')

      // Usar métricas real-time se disponíveis, senão fallback para dados existentes
      let totalViews = 0
      let totalContacts = 0

      if (realTimeMetrics) {
        // Usar dados consolidados real-time com proteção contra NaN
        totalViews = isNaN(realTimeMetrics.totalViews) ? 0 : (realTimeMetrics.totalViews || 0)
        totalContacts = isNaN(realTimeMetrics.totalContacts) ? 0 : (realTimeMetrics.totalContacts || 0)
      } else {
        // Fallback para dados existentes
        totalViews = userAds.reduce((sum, ad) => {
          const views = isNaN(ad.views_count) ? 0 : (ad.views_count || 0)
          return sum + views
        }, 0)
        totalContacts = Math.floor(totalViews * 0.08) // Simulado até termos dados reais
      }

      const recentAds = userAds.slice(0, 3).map(ad => ({
        id: ad.id,
        title: ad.title,
        category: ad.categories?.name || 'Categoria não encontrada',
        status: ad.status,
        views: ad.views_count || 0, // Default to 0 if views_count is undefined/null
        contacts: Math.floor((ad.views_count || 0) * 0.08),
        createdAt: ad.created_at ? ad.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }))

      // Garantir que todos os valores são números válidos
      const safeTotalViews = isNaN(totalViews) ? 0 : totalViews
      const safeTotalContacts = isNaN(totalContacts) ? 0 : totalContacts

      setData({
        totalAds: userAds.length,
        activeAds: activeAds.length,
        totalViews: safeTotalViews,
        totalContacts: safeTotalContacts,
        averageRating: 4.8, // Mock por enquanto
        thisMonthViews: Math.floor(safeTotalViews * 0.6), // Mock - 60% do total
        lastMonthViews: Math.floor(safeTotalViews * 0.4), // Mock - 40% do total
        thisMonthContacts: Math.floor(safeTotalContacts * 0.6),
        lastMonthContacts: Math.floor(safeTotalContacts * 0.4),
        recentAds,
        quickStats: {
          pendingMessages: Math.floor(totalContacts * 0.3), // 30% mensagens pendentes
          expiringAds: userAds.filter(ad => ad.status === 'active').length > 0 ? 1 : 0,
          recommendedActions: 2 // Mock
        }
      })
    } else {
      // Dados vazios se não há anúncios
      setData({
        totalAds: 0,
        activeAds: 0,
        totalViews: 0,
        totalContacts: 0,
        averageRating: 0,
        thisMonthViews: 0,
        lastMonthViews: 0,
        thisMonthContacts: 0,
        lastMonthContacts: 0,
        recentAds: [],
        quickStats: {
          pendingMessages: 0,
          expiringAds: 0,
          recommendedActions: 0
        }
      })
    }
    setLoadingData(false)
  }, [userAds, realTimeMetrics])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-5 md:py-6 gap-5">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {isWelcome ? '🎉 Bem-vindo!' : `Olá, ${profile?.full_name?.split(' ')[0] || 'Anunciante'}! 👋`}
              </h1>
              <p className="text-gray-500 font-medium text-xs md:text-base mt-1 truncate max-w-[200px] md:max-w-none">
                {userAds.length > 0 ? 'Acompanhe seu desempenho' : 'Gerencie seus espaços'}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botão Voltar para Home */}
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-primary-600 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              <button
                onClick={signOut}
                className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Mensagem de sucesso para novo anúncio */}
        {isNewAd && (
          <div className="mb-8 bg-white border border-green-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="relative flex flex-col sm:flex-row items-start gap-4">
              <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
                <svg className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  🎉 Anúncio criado com sucesso!
                </h3>
                <p className="text-gray-600 font-medium mb-4 text-sm leading-relaxed">
                  Seu anúncio foi publicado e já está disponível para visualização.
                  Agora os interessados podem encontrá-lo e entrar em contato.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/dashboard/meus-anuncios"
                    className="flex-1 sm:flex-none justify-center bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all text-sm font-bold active:scale-95"
                  >
                    Ver Meus Anúncios
                  </Link>
                  <Link
                    to="/espacos"
                    className="flex-1 sm:flex-none justify-center border border-green-200 text-green-700 bg-green-50 px-5 py-2.5 rounded-xl hover:bg-green-100 transition-all text-sm font-bold active:scale-95"
                  >
                    Ver na Busca Pública
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Stats Cards */}
        <DashboardStats
          data={data || undefined}
          loading={loadingData}
          isRealTime={!!realTimeMetrics}
          lastUpdated={realTimeMetrics ? new Date() : null}
        />

        {/* Main Content Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 md:gap-8 mt-6 md:mt-8">
          {/* Quick Actions - Takes 1 column (Sidebar) */}
          {/* Mobile: Order 1 (Top) | Desktop: Order 2 (Right Sidebar) */}
          <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
            <QuickActions userAds={userAds} />
          </div>

          {/* Recent Activity & Tips - Takes 2 columns (Main Content) */}
          {/* Mobile: Order 2 (Bottom) | Desktop: Order 1 (Left Content) */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-6 md:space-y-8">
            <RecentActivity
              userAds={userAds}
            />

            {/* Performance Tips */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-50 to-transparent rounded-full blur-3xl -translate-y-32 translate-x-32 group-hover:translate-y-[-7rem] transition-transform duration-700"></div>

              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-50 rounded-xl text-green-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Dicas de Desempenho
                  </h3>
                </div>

                <p className="text-sm text-gray-500 font-medium mb-5">
                  Anúncios completos recebem até <strong className="text-green-600">5x mais contatos</strong>. Confira se você já seguiu estas dicas:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>
                    Adicione pelo menos 5 fotos
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm shadow-green-500/50"></div>
                    Preencha todos os campos
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-sm shadow-amber-500/50"></div>
                    Responda em até 1 hora
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-sm shadow-amber-500/50"></div>
                    Mantenha o calendário atualizado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

    </div>
  )
}