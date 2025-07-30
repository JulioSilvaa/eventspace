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
  Crown,
  ArrowLeft
} from 'lucide-react'

export default function MyAds() {
  const { user, profile } = useAuth()
  const { userAds, fetchUserAds, isLoading, updateAd, deleteAd } = useAdsStore()
  
  // Modal states
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    type: 'success' | 'error' | 'warning' | 'info' | 'premium'
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
    onConfirm: () => {},
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

  const formatPrice = (price: number, priceType: string) => {
    const formatted = price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return `${formatted}/${priceType === 'daily' ? 'dia' : priceType === 'hourly' ? 'hora' : 'evento'}`
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

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info' | 'premium', title: string, message: string) => {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Anúncios</p>
                <p className="text-2xl font-bold text-gray-900">{userAds.length}</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Star className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anúncios Ativos</p>
                <p className="text-2xl font-bold text-green-600">{userAds.filter(ad => ad.status === 'active').length}</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Play className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Visualizações</p>
                <p className="text-2xl font-bold text-purple-600">{userAds.reduce((sum, ad) => sum + ad.views_count, 0)}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contatos</p>
                <p className="text-2xl font-bold text-orange-600">{userAds.reduce((sum, ad) => sum + Math.floor(ad.views_count * 0.08), 0)}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-orange-600" />
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
          <div className="space-y-4">
            {userAds.map((ad) => (
              <div key={ad.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                        {profile?.plan_type === 'premium' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3 fill-current" />
                            Premium
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(ad.status)}`}>
                          {getStatusText(ad.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>{ad.categories?.name || 'Categoria não encontrada'}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ad.city}, {ad.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Criado em {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{ad.views_count}</span> visualizações
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{Math.floor(ad.views_count * 0.08)}</span> contatos
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-green-600">{formatPrice(ad.price, ad.price_type)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/dashboard/anuncios/${ad.id}/editar`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                        title="Editar anúncio"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      
                      <button
                        onClick={() => handleToggleStatus(ad.id, ad.status)}
                        className={`p-2 rounded-lg transition-colors ${
                          ad.status === 'active' 
                            ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' 
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                        title={ad.status === 'active' ? 'Pausar anúncio' : 'Ativar anúncio'}
                      >
                        {ad.status === 'active' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                        title="Excluir anúncio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
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