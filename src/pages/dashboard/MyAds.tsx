import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAdsStore } from '@/stores/adsStore'
import subscriptionService, { Subscription } from '@/services/subscriptionService'
import AlertModal from '@/components/ui/AlertModal'
import ConfirmModal from '@/components/ui/ConfirmModal'

import {
  Plus,
  Eye,
  MessageCircle,
  Edit,
  Pause,
  Play,
  Trash2,
  Star,
  MapPin,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'
import { useUserRealTimeMetrics } from '@/hooks/useRealTimeMetrics'
import { formatPrice } from '@/lib/utils'

export default function MyAds() {
  const { user, profile } = useAuth()
  const { userAds, fetchUserAds, isLoading: adsLoading, updateAd, deleteAd } = useAdsStore()
  const { metrics, isLoading: metricsLoading } = useUserRealTimeMetrics(user?.id)

  const isLoading = adsLoading || metricsLoading

  // Modal states
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'default'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'default'
  })



  const [userSubscriptions, setUserSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    if (user) {
      fetchUserAds(user.id)
      subscriptionService.getUserSubscriptions(user.id).then(subs => {
        setUserSubscriptions(subs)
      })
    }
  }, [user, fetchUserAds])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'pending': return 'Pendente'
      case 'rejected': return 'Rejeitado'
      default: return status
    }
  }

  const [redirecting, setRedirecting] = useState(false)

  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    if (currentStatus === 'inactive' || currentStatus === 'suspended') {
      setRedirecting(true)

      // Check if this ad already has an active subscription
      const activeSub = userSubscriptions.find(
        sub => sub.space_id === adId && sub.status === 'active'
      )

      if (activeSub) {
        // Just reactivate the ad locally
        await updateAd(adId, { status: 'active' })
        setRedirecting(false)
        showAlert('success', 'Anúncio Ativado', 'Seu anúncio foi reativado com sucesso.')
        return
      }

      try {
        const pricing = await subscriptionService.getCurrentPricing()

        // Logic: 'activation' for Founder Plan (creates one-time charge), 'month' for Standard Plan (subscription)
        let interval: 'activation' | 'month' = 'month';

        if (pricing?.plan_type === 'founder' && pricing?.spots_remaining > 0) {
          interval = 'activation';
        }

        const result = await subscriptionService.createCheckoutSession(adId, interval);

        if (!result) {
          showAlert('error', 'Erro', 'Não foi possível configurar o pagamento.');
          setRedirecting(false)
          return;
        }

        if (result.url) {
          window.location.href = result.url;
        } else {
          // Success but no URL means it was just reactivated (already had active subscription)
          setRedirecting(false)
          showAlert('success', 'Anúncio Ativado', 'Seu anúncio possui uma assinatura ativa e foi reativado com sucesso.')
          await fetchUserAds(user!.id)
        }

      } catch (error) {
        console.error("Error creating checkout session", error);
        showAlert('error', 'Erro', 'Ocorreu um erro ao processar sua solicitação.');
        setRedirecting(false)
      }
      return;
    }

    // Toggle from active to inactive
    const newStatus = 'inactive';
    await updateAd(adId, { status: newStatus as any });
  }

  const handleDeleteAd = (adId: string) => {
    const performDelete = async () => {
      const result = await deleteAd(adId)
      if (result.error) {
        showAlert('error', 'Erro ao Excluir', `Erro ao excluir anúncio: ${result.error}`)
      } else {
        showAlert('success', 'Anúncio Excluído', 'O anúncio foi excluído com sucesso!')
      }
    }

    showConfirm(
      'Excluir Anúncio',
      'Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita e todas as imagens serão removidas.',
      performDelete,
      'danger'
    )
  }

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertModal({
      isOpen: true,
      type,
      title,
      message
    })
  }

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'default' = 'default') => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    })
  }


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link
                  to="/dashboard"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-48"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Meus Anúncios</h1>
              <p className="text-sm font-medium text-gray-500">{userAds.length > 0 ? 'Gerencie seus anúncios' : 'Seus anúncios aparecerão aqui'}</p>
            </div>
          </div>
          {userAds.length === 0 && (
            <Link
              to="/dashboard/criar-anuncio"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all font-bold active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Criar Meu Anúncio
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-8">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-gray-400 mb-1">Visualizações</p>
                <p className="text-xl md:text-3xl font-black text-purple-600 tracking-tight">{metrics.totalViews}</p>
              </div>
              <div className="bg-purple-50 p-2 md:p-3 rounded-xl border border-purple-100 shadow-sm">
                <Eye className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-wider text-gray-400 mb-1">Contatos</p>
                <p className="text-xl md:text-3xl font-black text-orange-600 tracking-tight">{metrics.totalContacts}</p>
              </div>
              <div className="bg-orange-50 p-2 md:p-3 rounded-xl border border-orange-100 shadow-sm">
                <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600 fill-current" />
              </div>
            </div>
          </div>
        </div>


        {/* Ads List */}
        {userAds.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Star className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Você ainda não criou seu anúncio
            </h3>
            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">
              Crie seu anúncio agora e comece a receber contatos de pessoas interessadas em alugar seu espaço ou equipamento.
            </p>
            <Link
              to="/dashboard/criar-anuncio"
              className="bg-primary-600 text-white px-8 py-3.5 rounded-xl hover:bg-primary-700 shadow-xl shadow-primary-500/20 transition-all inline-flex items-center gap-2 font-bold hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              Começar Agora
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {userAds.map((ad) => (
              <div key={ad.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group">
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail Section */}
                  <div className="w-full md:w-72 h-56 md:h-auto relative bg-gray-100 shrink-0 overflow-hidden">
                    {ad.listing_images && ad.listing_images.length > 0 ? (
                      <img
                        src={ad.listing_images[0].image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <Star className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {ad.status && (
                      <div className="absolute top-4 left-4">
                        <span className={`text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg font-bold shadow-sm backdrop-blur-md bg-white/90 ${ad.status === 'active' ? 'text-green-700' :
                          ad.status === 'inactive' ? 'text-yellow-700' : 'text-gray-700'
                          }`}>
                          {getStatusText(ad.status)}
                        </span>
                      </div>
                    )}
                    {/* Mobile Overlay Gradient for text readability if needed, but text is outside */}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-5 md:p-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {ad.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 flex-wrap text-sm">
                            <span className="font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                              {ad.categories?.name || 'Geral'}
                            </span>
                            <span className="text-gray-400 font-medium flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {ad.city}, {ad.state}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mt-6">
                        <div className="flex flex-col items-center justify-center p-3 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                          <span className="text-xl font-bold text-blue-600 mb-0.5">{ad.views_count || 0}</span>
                          <span className="text-[10px] text-blue-400 uppercase font-black tracking-wider">Views</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-3 bg-green-50/50 rounded-2xl border border-green-100/50">
                          <span className="text-xl font-bold text-green-600 mb-0.5">{ad.contacts_count || 0}</span>
                          <span className="text-[10px] text-green-500 uppercase font-black tracking-wider">Contatos</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-3 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                          <span className="text-sm font-bold text-gray-700 mb-1">{formatPrice(ad.price, ad.price_type)}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Valor</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start">
                        <Calendar className="w-3.5 h-3.5" />
                        Publicado em {ad.created_at ? new Date(ad.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                        <Tooltip content="Editar anúncio">
                          <Link
                            to={`/dashboard/anuncios/${ad.id}/editar`}
                            className="flex-1 sm:flex-none flex items-center justify-center h-11 px-4 text-gray-600 hover:text-primary-600 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl transition-all font-bold"
                          >
                            <span className="sm:hidden mr-2 text-sm">Editar</span>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Tooltip>

                        {/* Activate Button for Inactive/Suspended Ads */}
                        {(ad.status === 'inactive' || ad.status === 'suspended') && (
                          <Tooltip content="Ativar Anúncio">
                            <button
                              onClick={() => handleToggleStatus(ad.id, ad.status)}
                              className="flex-1 sm:flex-none flex items-center justify-center h-11 px-6 text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20 rounded-xl transition-all font-bold hover:-translate-y-0.5"
                            >
                              <span className="mr-2 text-sm">Ativar</span>
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                          </Tooltip>
                        )}

                        {/* Pause Button for Active Ads */}
                        {ad.status === 'active' && (
                          <Tooltip content="Pausar Anúncio">
                            <button
                              onClick={() => handleToggleStatus(ad.id, ad.status)}
                              className="flex-1 sm:flex-none flex items-center justify-center h-11 px-4 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-200 rounded-xl transition-all"
                            >
                              <span className="sm:hidden mr-2 text-sm">Pausar</span>
                              <Pause className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        )}

                        <Tooltip content="Ver anúncio público">
                          <Link
                            to={`/anuncio/${ad.id}`}
                            target="_blank"
                            className="flex-1 sm:flex-none flex items-center justify-center h-11 px-4 text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-100 rounded-xl transition-all"
                          >
                            <span className="sm:hidden mr-2 text-sm font-bold">Ver</span>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Tooltip>

                        <Tooltip content="Excluir anúncio">
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center h-11 px-4 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-xl transition-all"
                          >
                            <span className="sm:hidden mr-2 text-sm font-bold">Excluir</span>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Excluir"
        cancelText="Cancelar"
      />


    </div>
  )
}