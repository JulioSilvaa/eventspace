import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAdsStore } from '@/stores/adsStore'
import AlertModal from '@/components/ui/AlertModal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import {
  Plus,
  Eye,
  MessageCircle,
  MoreVertical,
  Edit,
  Pause,
  Play,
  Trash2,
  Star,
  MapPin,
  Calendar,
  TrendingUp,
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

  useEffect(() => {
    if (user) {
      fetchUserAds(user.id)
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


  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    await updateAd(adId, { status: newStatus })
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Anúncios</h1>
              <p className="text-gray-600">{userAds.length > 0 ? 'Gerencie seus anúncios no EventSpace' : 'Seus anúncios aparecerão aqui quando criados'}</p>
            </div>
          </div>
          {userAds.length === 0 && (
            <Link
              to="/dashboard/criar-anuncio"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Meu Anúncio
            </Link>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1">Visualizações Reais</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.totalViews}</p>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-1">Contatos Convertidos</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.totalContacts}</p>
              </div>
              <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                <MessageCircle className="w-5 h-5 text-orange-600 fill-current" />
              </div>
            </div>
          </div>
        </div>


        {/* Ads List */}
        {userAds.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Você ainda não criou seu anúncio
            </h3>
            <p className="text-gray-600 mb-6">
              Crie seu anúncio e alcance milhares de pessoas interessadas em equipamentos e espaços para eventos
            </p>
            <Link
              to="/dashboard/criar-anuncio"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Meu Anúncio
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {userAds.map((ad) => (
              <div key={ad.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail Section */}
                  <div className="w-full md:w-56 h-48 md:h-auto relative bg-gray-100 shrink-0">
                    {ad.listing_images && ad.listing_images.length > 0 ? (
                      <img
                        src={ad.listing_images[0].image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Star className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg font-bold shadow-sm ${getStatusColor(ad.status)}`}>
                        {getStatusText(ad.status)}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                            {ad.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-gray-400" />
                              {ad.categories?.name || 'Categoria não encontrada'}
                            </span>
                            <span className="text-gray-300 text-xs">•</span>
                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {ad.city}, {ad.state}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="p-2 bg-white rounded-md shadow-sm">
                            <Eye className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Views</span>
                            <span className="text-base font-bold text-gray-900">{ad.views_count || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="p-2 bg-white rounded-md shadow-sm">
                            <MessageCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Contatos</span>
                            <span className="text-base font-bold text-gray-900">{ad.contacts_count || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
                          <div className="p-2 bg-white rounded-md shadow-sm">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[10px] text-green-600/70 uppercase font-black tracking-tighter">Investimento</span>
                            <span className="text-base font-bold text-green-700">{formatPrice(ad.price, ad.price_type)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Publicado em {ad.created_at ? new Date(ad.created_at).toLocaleDateString('pt-BR') : 'Recente'}
                      </div>

                      <div className="flex items-center gap-2">
                        <Tooltip content="Editar anúncio">
                          <Link
                            to={`/dashboard/anuncios/${ad.id}/editar`}
                            className="flex items-center justify-center p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                        </Tooltip>

                        <div className="w-px h-6 bg-gray-100 mx-1 hidden sm:block"></div>

                        <Tooltip content={ad.status === 'active' ? 'Pausar anúncio' : 'Ativar anúncio'}>
                          <button
                            onClick={() => handleToggleStatus(ad.id, ad.status)}
                            className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 ${ad.status === 'active'
                              ? 'text-amber-500 hover:bg-amber-50'
                              : 'text-emerald-500 hover:bg-emerald-50'
                              }`}
                          >
                            {ad.status === 'active' ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current" />
                            )}
                          </button>
                        </Tooltip>

                        <Tooltip content="Ver anúncio público">
                          <Link
                            to={`/anuncio/${ad.id}`}
                            target="_blank"
                            className="flex items-center justify-center p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </Tooltip>

                        <Tooltip content="Excluir anúncio">
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="flex items-center justify-center p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </Tooltip>

                        <button className="flex items-center justify-center p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200">
                          <MoreVertical className="w-5 h-5" />
                        </button>
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