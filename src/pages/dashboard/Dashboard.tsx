import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Plus, TrendingUp, Crown, LogOut, Home } from 'lucide-react'
import DashboardStats from '@/components/dashboard/DashboardStats'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentActivity from '@/components/dashboard/RecentActivity'
import UpgradeModal from '@/components/modals/UpgradeModal'
import { useAuth } from '@/hooks/useAuth'
import { useAdsStore } from '@/stores/adsStore'

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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)


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

  // Calcular estatísticas baseadas nos anúncios reais
  useEffect(() => {
    if (userAds.length > 0) {
      console.log('📊 Dashboard calculating stats for ads:', userAds)
      const activeAds = userAds.filter(ad => ad.status === 'active')
      const totalViews = userAds.reduce((sum, ad) => {
        const views = ad.views_count || 0 // Default to 0 if views_count is undefined/null
        console.log(`📊 Ad "${ad.title}" has ${views} views`)
        return sum + views
      }, 0)
      
      // Para contatos, usaremos um valor simulado baseado nas visualizações
      // Idealmente, isso viria de uma tabela de contatos/mensagens
      const totalContacts = Math.floor(totalViews * 0.08) // ~8% conversion rate
      console.log('📊 Calculated totals:', { totalViews, totalContacts })
      
      const recentAds = userAds.slice(0, 3).map(ad => ({
        id: ad.id,
        title: ad.title,
        category: ad.categories?.name || 'Categoria não encontrada',
        status: ad.status,
        views: ad.views_count || 0, // Default to 0 if views_count is undefined/null
        contacts: Math.floor((ad.views_count || 0) * 0.08),
        createdAt: ad.created_at.split('T')[0]
      }))

      setData({
        totalAds: userAds.length,
        activeAds: activeAds.length,
        totalViews,
        totalContacts,
        averageRating: 4.8, // Mock por enquanto
        thisMonthViews: Math.floor(totalViews * 0.6), // Mock - 60% do total
        lastMonthViews: Math.floor(totalViews * 0.4), // Mock - 40% do total
        thisMonthContacts: Math.floor(totalContacts * 0.6),
        lastMonthContacts: Math.floor(totalContacts * 0.4),
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
  }, [userAds])

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {isWelcome ? '🎉 Bem-vindo ao EventSpace!' : `Olá, ${profile?.full_name?.split(' ')[0] || 'Anunciante'}! 👋`}
              </h1>
              <p className="text-gray-600">
                {userAds.length > 0 ? 'Acompanhe o desempenho do seu anúncio no EventSpace' : 'Gerencie seu perfil e navegue pelos espaços disponíveis'}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Plano Atual */}
              <div className={`flex items-center gap-2 px-3 py-2 border rounded-lg ${
                profile?.plan_type === 'free' 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <Crown className={`w-4 h-4 ${
                  profile?.plan_type === 'free' ? 'text-gray-600' : 'text-blue-600'
                }`} />
                <span className={`text-sm font-medium ${
                  profile?.plan_type === 'free' ? 'text-gray-900' : 'text-blue-900'
                }`}>
                  {profile?.plan_type === 'free' ? 'Conta Gratuita' :
                   profile?.plan_type === 'basic' ? 'Plano Básico' : 
                   profile?.plan_type === 'premium' ? 'Plano Premium' : 'Conta Gratuita'}
                </span>
              </div>

              {/* Botão Voltar para Home */}
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home className="w-4 h-4" />
                Voltar para Home
              </Link>
              {userAds.length === 0 && profile?.plan_type !== 'free' && (
                <Link
                  to="/dashboard/criar-anuncio"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar Anúncio
                </Link>
              )}
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Mensagem de sucesso para novo anúncio */}
        {isNewAd && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">
                  🎉 Anúncio criado com sucesso!
                </h3>
                <p className="text-green-700 mb-4">
                  Seu anúncio foi publicado e já está disponível para visualização. 
                  Agora os interessados podem encontrá-lo e entrar em contato.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/dashboard/meus-anuncios"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Ver Meus Anúncios
                  </Link>
                  <Link
                    to="/espacos"
                    className="border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                  >
                    Ver na Busca Pública
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem de boas-vindas */}
        {isWelcome && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Conta criada com sucesso!
                </h3>
                <p className="text-blue-700 mb-4">
                  Para criar seu anúncio, escolha um de nossos planos pagos. 
                  Navegue gratuitamente pelos espaços disponíveis!
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/pricing"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Ver Planos
                  </Link>
                  <Link
                    to="/espacos"
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                  >
                    Navegar Espaços
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conta Gratuita - Upgrade Required */}
        {profile?.plan_type === 'free' && !isWelcome && (
          <div className="mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 p-3 rounded-lg">
                  <Crown className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-1">
                    Pronto para criar seu anúncio?
                  </h3>
                  <p className="text-indigo-700">
                    Escolha um plano pago para criar seu anúncio e alcançar mais clientes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/pricing"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Ver Planos
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <DashboardStats 
          data={data || undefined}
          loading={loadingData}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Recent Activity - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentActivity 
              userPlan={profile?.plan_type}
              userAds={userAds}
            />
          </div>

          {/* Quick Actions - Takes 1 column */}
          <div>
            <QuickActions userAds={userAds} planType={profile?.plan_type} />
          </div>
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Dicas para melhorar seu desempenho
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Anúncios com fotos de qualidade e descrições completas recebem até 5x mais contatos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Adicione mais fotos aos seus anúncios
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Complete todas as informações
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Responda rapidamente aos contatos
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Mantenha preços atualizados
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          context="feature_ad"
          description="Para destacar anúncios, você precisa de um plano pago. Anúncios em destaque recebem até 3x mais visualizações!"
        />
      )}
    </div>
  )
}