import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Search, Trash2 } from 'lucide-react'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useAdsStore } from '@/stores/adsStore'
import { useAuth } from '@/hooks/useAuth'
import AdCard from '@/components/ads/AdCard'
import { Ad } from '@/types'

export default function FavoritesList() {
  const { user } = useAuth()
  const { favorites, clearFavorites } = useFavoritesStore()
  const { ads, fetchAds, isLoading: adsLoading } = useAdsStore()
  const [favoriteAds, setFavoriteAds] = useState<Ad[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Só executa se não for usuário logado
    if (user) return

    const loadFavoriteAds = async () => {
      // Se não há favoritos, não carrega nada
      if (favorites.length === 0) {
        setFavoriteAds([])
        setIsLoading(false)
        return
      }

      try {
        // Se os ads ainda não foram carregados, carrega primeiro
        if (ads.length === 0 && !adsLoading) {
          await fetchAds()
          return // O useEffect vai rodar novamente quando ads for atualizado
        }

        // Se ainda está carregando ads, aguarda
        if (adsLoading) {
          return
        }

        // Agora filtra os ads que estão nos favoritos
        const filteredAds = ads.filter(ad => favorites.includes(ad.id))
        setFavoriteAds(filteredAds)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading favorite ads:', error)
        setIsLoading(false)
      }
    }

    loadFavoriteAds()
  }, [favorites, ads, adsLoading, fetchAds, user])

  // Don't show for logged in users
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Favoritos não disponíveis</h1>
          <p className="text-gray-600 mb-6">
            Esta funcionalidade é exclusiva para visitantes. Como usuário logado, você pode gerenciar seus próprios anúncios.
          </p>
          <Link
            to="/dashboard"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ir para Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleClearAllFavorites = () => {
    if (window.confirm('Tem certeza que deseja remover todos os favoritos?')) {
      clearFavorites()
    }
  }

  if (isLoading || adsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
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
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
              <p className="text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'anúncio favoritado' : 'anúncios favoritados'}
              </p>
            </div>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={handleClearAllFavorites}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Limpar todos os favoritos"
            >
              <Trash2 className="w-4 h-4" />
              Limpar tudo
            </button>
          )}
        </div>

        {/* Empty state */}
        {favorites.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Explore os anúncios e clique no ❤️ para adicionar aos seus favoritos.
              Assim você pode revisitá-los facilmente mais tarde!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/espacos"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Explorar Espaços
              </Link>
              <Link
                to="/equipamentos"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Explorar Equipamentos
              </Link>
            </div>
          </div>
        )}

        {/* Favorites not found */}
        {favorites.length > 0 && favoriteAds.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Favoritos não encontrados
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Alguns dos seus anúncios favoritos podem ter sido removidos ou não estão mais disponíveis.
            </p>
            <button
              onClick={handleClearAllFavorites}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Limpar favoritos
            </button>
          </div>
        )}

        {/* Favorites grid */}
        {favoriteAds.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  size="medium"
                  showViewCount={false}
                />
              ))}
            </div>

            {/* Botões para explorar mais */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quer explorar mais opções?
              </h3>
              <p className="text-gray-600 mb-6">
                Descubra milhares de espaços e equipamentos disponíveis em todo o Brasil.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/espacos"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Ver Todos os Espaços
                </Link>
                <Link
                  to="/equipamentos"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Ver Todos os Equipamentos
                </Link>
              </div>
            </div>
          </>
        )}

        {/* Info box */}
        {favorites.length > 0 && (
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-medium text-blue-900 mb-2">💡 Sobre os Favoritos</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Seus favoritos são salvos no seu navegador e ficam disponíveis apenas neste dispositivo.</p>
              <p>• Os favoritos persistem mesmo se você fechar o navegador.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}