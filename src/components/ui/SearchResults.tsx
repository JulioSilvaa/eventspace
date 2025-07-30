import { MapPin, Star, Phone, MessageCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import PremiumBadge from '@/components/ui/PremiumBadge'
import type { SearchResult } from '@/lib/api/search'
import { realTimeService } from '@/services/realTimeService'

interface SearchResultsProps {
  results: SearchResult[]
  loading?: boolean
  error?: string | null
  totalResults?: number
  currentPage?: number
  totalPages?: number
  onNextPage?: () => void
  onPrevPage?: () => void
  onGoToPage?: (page: number) => void
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export default function SearchResults({
  results,
  loading = false,
  error = null,
  totalResults = 0,
  currentPage = 1,
  totalPages = 0,
  onNextPage,
  onPrevPage,
  onGoToPage,
  hasNextPage = false,
  hasPrevPage = false
}: SearchResultsProps) {
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">Erro ao carregar resultados</div>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  if (!results.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">Nenhum resultado encontrado</div>
        <p className="text-gray-600">Tente ajustar os filtros de busca ou use termos diferentes.</p>
      </div>
    )
  }

  const formatPrice = (price: number, priceType: string) => {
    const formatted = price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    
    return `${formatted}/${priceType === 'daily' ? 'dia' : priceType === 'hourly' ? 'hora' : 'evento'}`
  }

  const handleContactClick = async (type: 'whatsapp' | 'phone', contact: string, adTitle: string, listingId: string) => {
    // Track the contact event first
    try {
      if (type === 'whatsapp') {
        await realTimeService.trackWhatsAppContact(listingId)
      } else {
        await realTimeService.trackPhoneContact(listingId)
      }
    } catch (error) {
      console.error('Error tracking contact:', error)
    }
    
    // Then open the contact method
    if (type === 'whatsapp') {
      const message = encodeURIComponent(`Olá! Tenho interesse no anúncio: ${adTitle}`)
      window.open(`https://wa.me/55${contact.replace(/\D/g, '')}?text=${message}`, '_blank')
    } else {
      window.open(`tel:${contact}`, '_self')
    }
  }

  return (
    <div>
      {/* Header com contador de resultados */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600">
          {totalResults > 0 && (
            <span>
              Mostrando {((currentPage - 1) * 12) + 1}-{Math.min(currentPage * 12, totalResults)} de {totalResults} resultados
            </span>
          )}
        </div>
      </div>

      {/* Grid de Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {results.map((result) => (
          <div key={result.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            {/* Imagem do Anúncio */}
            <div className="relative h-48 bg-gray-200">
              {result.listing_images && result.listing_images.length > 0 ? (
                <img
                  src={result.listing_images[0].image_url}
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                  <span>Imagem do {result.category_type === 'advertiser' ? 'anúncio' : 'espaço'}</span>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-2">
                <PremiumBadge userPlanType={result.user_plan_type} size="sm" />
                {result.featured && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Destaque
                  </span>
                )}
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {result.category_name}
                </span>
              </div>
              
              {/* Preço */}
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="text-sm font-bold text-gray-900">
                  {formatPrice(result.price, result.price_type)}
                </span>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4">
              {/* Título */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {result.title}
              </h3>

              {/* Localização */}
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {result.neighborhood ? `${result.neighborhood}, ` : ''}{result.city}, {result.state}
                </span>
              </div>

              {/* Descrição */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {result.description}
              </p>

              {/* Estatísticas */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {result.views_count} visualizações
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                {/* Botão Ver Detalhes */}
                <Link
                  to={`/${result.category_type === 'advertiser' ? 'anunciantes' : 'espacos'}/${result.id}`}
                  className="flex-1 bg-primary-600 text-white text-center py-2 px-3 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Ver Detalhes
                </Link>

                {/* Botões de Contato */}
                <div className="flex gap-1">
                  {result.contact_whatsapp && (
                    <button
                      onClick={() => handleContactClick('whatsapp', result.contact_whatsapp!, result.title, result.id)}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                      title="Contato via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                  {result.contact_phone && (
                    <button
                      onClick={() => handleContactClick('phone', result.contact_phone!, result.title, result.id)}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                      title="Ligar diretamente"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={onPrevPage}
            disabled={!hasPrevPage}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onGoToPage?.(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={onNextPage}
            disabled={!hasNextPage}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}