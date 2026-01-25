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
  ArrowLeft,
  XCircle,
  Crown
} from 'lucide-react'
import Tooltip from '@/components/ui/Tooltip'
import { useUserRealTimeMetrics } from '@/hooks/useRealTimeMetrics'
import { formatPrice, formatCurrency } from '@/lib/utils'
import { usePricingModels } from '@/hooks/usePricingModels'
import { useMemo } from 'react'

export default function MyAds() {
  const { user } = useAuth()
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
  const { data: pricingModels } = usePricingModels()

  const unitMap = useMemo(() => {
    const map: Record<string, string> = {}
    if (pricingModels) {
      pricingModels.forEach(pm => {
        if (pm.unit) {
          map[pm.key] = `/${pm.unit}`
        }
      })
    }
    return map
  }, [pricingModels])

  useEffect(() => {
    if (user) {
      fetchUserAds(user.id)
      subscriptionService.getUserSubscriptions(user.id).then(subs => {
        setUserSubscriptions(subs)
      })
    }
  }, [user, fetchUserAds])

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'inactive': return 'Inativo'
      case 'pending': return 'Pendente'
      case 'rejected': return 'Rejeitado'
      default: return status
    }
  }

  const handleCancelSubscription = (adId: string) => {
    const sub = userSubscriptions.find(s => s.space_id === adId && s.status === 'active');

    if (!sub) {
      showAlert('error', 'Erro', 'Nenhuma assinatura ativa encontrada para este anúncio.');
      return;
    }

    const performCancel = async () => {
      const success = await subscriptionService.cancelSubscription(sub.id)
      if (success) {
        // Optimistic update to hide button immediately
        setUserSubscriptions(prev => prev.map(s =>
          s.id === sub.id ? { ...s, cancel_at_period_end: true } : s
        ));

        showAlert('success', 'Assinatura Cancelada', 'Sua assinatura foi cancelada e não será renovada. Seu anúncio continuará ativo até o fim do período pago.')

        // Background refresh
        if (user) {
          const updatedSubs = await subscriptionService.getUserSubscriptions(user.id)
          setUserSubscriptions(updatedSubs)
        }
      } else {
        showAlert('error', 'Erro', 'Não foi possível cancelar a assinatura. Tente novamente.')
      }
    }

    if (sub.cancel_at_period_end) {
      showAlert('info', 'Já Cancelado', 'A assinatura deste anúncio já foi cancelada e não será renovada.');
      return;
    }

    showConfirm(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar a renovação automática? Seu anúncio continuará ativo até o final do período atual.',
      performCancel,
      'warning'
    )
  }

  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    if (currentStatus === 'inactive' || currentStatus === 'suspended') {


      // Check if this ad already has an active subscription
      const activeSub = userSubscriptions.find(
        sub => sub.space_id === adId && sub.status === 'active'
      )

      if (activeSub) {
        // Just reactivate the ad locally
        await updateAd(adId, { status: 'active' })

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

          return;
        }

        if (result.url) {
          window.location.href = result.url;
        } else {
          // Success but no URL means it was just reactivated (already had active subscription)

          showAlert('success', 'Anúncio Ativado', 'Seu anúncio possui uma assinatura ativa e foi reativado com sucesso.')
          await fetchUserAds(user!.id)
        }

      } catch (error) {
        console.error("Error creating checkout session", error);
        showAlert('error', 'Erro', 'Ocorreu um erro ao processar sua solicitação.');

      }
      return;
    }

    // Toggle from active to inactive
    const newStatus = 'inactive';
    await updateAd(adId, { status: newStatus as 'inactive' });
  }

  const handleDeleteAd = (adId: string) => {
    // Check for active recurring subscription
    const activeSub = userSubscriptions.find(s => s.space_id === adId && s.status === 'active' && !s.cancel_at_period_end);

    if (activeSub) {
      showAlert('error', 'Ação Bloqueada', 'Este anúncio possui uma assinatura ativa. Você deve cancelar a assinatura antes de excluir o anúncio para evitar cobranças indevidas.');
      return;
    }

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
              <div key={ad.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group flex flex-col md:flex-row">
                {/* Thumbnail Section */}
                <div className="w-full md:w-64 h-48 md:h-auto relative bg-gray-100 shrink-0 overflow-hidden">
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

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-lg font-bold shadow-sm backdrop-blur-md bg-white/95 border border-white/20 ${ad.status === 'active' ? 'text-green-700' :
                      ad.status === 'inactive' ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                      {getStatusText(ad.status)}
                    </span>
                  </div>

                  {/* Founder Badge */}
                  {(() => {
                    const activeSub = userSubscriptions.find(s => s.space_id === ad.id && s.status === 'active');
                    if (activeSub?.plan === 'founder') {
                      return (
                        <div className="absolute top-3 right-3 z-20">
                          <div className="bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-lg flex items-center justify-center" title="Parceiro Fundador">
                            <Crown size={12} fill="currentColor" />
                          </div>
                        </div>
                      )
                    }
                    return null;
                  })()}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-5 md:p-6 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            {ad.categories?.name || 'Geral'}
                          </span>
                          {ad.featured && <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1"><Star size={10} fill="currentColor" /> Destaque</span>}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors" title={ad.title}>
                          {ad.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-gray-500 truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          {ad.city}, {ad.state}
                        </div>
                      </div>
                    </div>

                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="flex flex-col items-center justify-center p-2 bg-blue-50/50 rounded-xl border border-blue-100/50">
                        <span className="text-lg font-black text-blue-600 leading-none mb-1">{ad.views_count || 0}</span>
                        <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Views</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-2 bg-green-50/50 rounded-xl border border-green-100/50">
                        <span className="text-lg font-black text-green-600 leading-none mb-1">{ad.contacts_count || 0}</span>
                        <span className="text-[10px] text-green-500 uppercase font-bold tracking-wider">Contatos</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-2 bg-gray-50/50 rounded-xl border border-gray-100/50 relative overflow-hidden">
                        <span className="text-sm font-black text-gray-700 leading-none mb-1 truncate max-w-full px-1">
                          {ad.price > 0 ? formatCurrency(ad.price).split(',')[0] : 'Consulte'}
                          <span className="text-[10px] font-normal text-gray-400 align-top">
                            {ad.price > 0 ? ',' + formatCurrency(ad.price).split(',')[1] : ''}
                          </span>
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Valor</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {ad.created_at ? new Date(ad.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Tooltip content="Editar">
                        <Link
                          to={`/dashboard/anuncios/${ad.id}/editar`}
                          className="flex-1 sm:flex-none flex items-center justify-center w-10 h-10 text-gray-600 hover:text-primary-600 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Tooltip>

                      {(ad.status === 'inactive' || ad.status === 'suspended') && (
                        <Tooltip content="Ativar">
                          <button
                            onClick={() => handleToggleStatus(ad.id, ad.status)}
                            className="flex-1 sm:flex-none flex items-center justify-center px-4 h-10 text-white bg-green-600 hover:bg-green-700 shadow-sm shadow-green-500/20 rounded-lg transition-all font-bold hover:-translate-y-0.5 text-sm"
                            title="Ativar"
                          >
                            <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                            Ativar
                          </button>
                        </Tooltip>
                      )}

                      {ad.status === 'active' && (
                        <Tooltip content="Pausar">
                          <button
                            onClick={() => handleToggleStatus(ad.id, ad.status)}
                            className="flex-1 sm:flex-none flex items-center justify-center w-10 h-10 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 border border-gray-200 hover:border-yellow-200 rounded-lg transition-all"
                            title="Pausar"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      )}

                      <Tooltip content="Ver Público">
                        <Link
                          to={`/espacos/${ad.id}`}
                          className="flex-1 sm:flex-none flex items-center justify-center w-10 h-10 text-gray-400 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-100 rounded-lg transition-all"
                          title="Ver Anúncio"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Tooltip>

                      <div className="w-[1px] h-8 bg-gray-200 mx-1 hidden sm:block"></div>

                      <Tooltip content="Excluir">
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center w-10 h-10 text-gray-300 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-100 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
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