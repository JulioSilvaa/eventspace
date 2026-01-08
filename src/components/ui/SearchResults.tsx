import { MapPin, Star, Phone, MessageCircle, Eye, Wifi, Wind, Speaker, Armchair, Utensils, Music, Waves, Snowflake, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SearchResult } from '@/lib/api/search'
import { realTimeService } from '@/services/realTimeService'
import { formatPrice } from '@/lib/utils'
import { useEffect, useRef } from 'react'

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
  viewMode?: 'grid' | 'list'
}

import { AMENITY_LABELS } from '@/constants/amenities'

function ComfortIcon({ name }: { name: string }) {
  const normalized = name.toLowerCase().trim()
  const label = AMENITY_LABELS[name] || AMENITY_LABELS[normalized] || name

  const icons: Record<string, React.ElementType> = {
    'wifi': Wifi,
    'wi-fi': Wifi,
    'internet': Wifi,
    'ar condicionado': Snowflake,
    'ar-condicionado': Snowflake,
    'ar_conditioning': Snowflake,
    'climatização': Snowflake,
    'ventilation': Wind,
    'som': Speaker,
    'sound_basic': Speaker,
    'iluminação': Lightbulb,
    'lighting': Lightbulb,
    'cadeiras': Armchair,
    'mesas': Armchair,
    'furniture': Armchair,
    'cozinha': Utensils,
    'kitchen': Utensils,
    'freezer': Snowflake,
    'geladeira': Snowflake,
    'refrigerator': Snowflake,
    'microwave': Snowflake,
    'piscina': Waves,
    'pool': Waves,
    'churrasqueira': Utensils,
    'bbq': Utensils,
    'som e iluminação': Music,
    'parking': Armchair, // using armchair as car replacement if needed, but imported Car is better. 
    // Wait, Car is not imported in original snippet, need to check imports.
    // Checking imports... original imports had: Wifi, Wind, Speaker, Armchair, Utensils, Music, Waves, Snowflake
    // Needs Car for parking.
  }

  // Checking if 'Car' is imported in SearchResults.tsx
  // It is NOT in the import list of original file I viewed (step 302).
  // Step 302 imports: MapPin, Star, Phone, MessageCircle, Eye, Wifi, Wind, Speaker, Armchair, Utensils, Music, Waves, Snowflake
  // So I should stick to available icons or add Car to imports. 
  // I will add Car to imports in a separate edit or just map parking to something else for now to avoid breaking if I can't double edit easily.
  // Actually, I can do multi-edit or just be safe. Let's map 'parking' to 'Armchair' (generic) or 'MapPin' (access) for now, OR better: use existing imports.

  // Find a matching icon
  let Icon = icons[name] || icons[normalized]
  if (!Icon) {
    const key = Object.keys(icons).find(k => normalized.includes(k))
    Icon = key ? icons[key] : Star // Default icon
  }

  return (
    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100" title={label}>
      <Icon className="w-3 h-3 text-gray-500" />
      <span className="text-[10px] text-gray-600 font-medium truncate max-w-[80px]">{label}</span>
    </div>
  )
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
  hasPrevPage = false,
  viewMode = 'grid'
}: SearchResultsProps) {
  const resultsTopRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentPage])

  if (loading) {
    return (
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`bg-white rounded-lg shadow animate-pulse ${viewMode === 'list' ? 'flex flex-col md:flex-row h-auto md:h-48' : ''}`}>
            <div className={`${viewMode === 'list' ? 'w-full md:w-64 h-48 md:h-full rounded-t-lg md:rounded-l-lg md:rounded-tr-none' : 'h-48 rounded-t-lg'} bg-gray-200`} />
            <div className="p-4 space-y-3 flex-1">
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
    <div ref={resultsTopRef}>
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

      {/* Grid/Lista de Resultados */}
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" : "flex flex-col gap-6 mb-8"}>
        {results.map((result) => (
          <div key={result.id} className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col md:flex-row h-auto md:h-64' : 'flex flex-col h-full'}`}>
            {/* Imagem do Anúncio */}
            <div className={`relative bg-gray-100 overflow-hidden group shrink-0 ${viewMode === 'list' ? 'w-full md:w-80 h-56 md:h-full' : 'h-56 w-full'}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
              {result.listing_images && result.listing_images.length > 0 && result.listing_images[0].image_url ? (
                <img
                  src={result.listing_images[0].image_url}
                  alt={result.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = result.category_type === 'space'
                      ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
                      : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                  <img
                    src={result.category_type === 'space'
                      ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
                      : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'}
                    alt="Placeholder"
                    className="w-full h-full object-cover opacity-50"
                  />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[80%]">
                {result.featured && (
                  <span className="bg-yellow-400/90 backdrop-blur-sm text-yellow-950 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    Destaque
                  </span>
                )}
                <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm border border-white/20">
                  {result.category_name}
                </span>
              </div>

              {/* Preço */}
              <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-gray-100">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider block text-right">A partir de</span>
                <span className="text-lg font-bold text-primary-700">
                  {formatPrice(result.price, result.price_type)}
                </span>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-5 flex-1 flex flex-col">
              {/* Título */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {result.title}
              </h3>

              {/* Localização */}
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {result.neighborhood ? `${result.neighborhood}, ` : ''}
                  {result.city || 'Cidade não informada'}
                  {result.state ? `, ${result.state}` : ''}
                </span>
              </div>

              {/* Descrição */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {result.description}
              </p>

              {/* Conforto / Amenities */}
              {result.comfort && result.comfort.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.comfort.slice(0, 3).map((item, i) => (
                    <ComfortIcon key={i} name={item} />
                  ))}
                  {result.comfort.length > 3 && (
                    <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 font-medium">
                      +{result.comfort.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 mt-auto pt-2">
                {/* Botão Ver Detalhes */}
                <Link
                  to={`/${result.category_type === 'advertiser' ? 'anunciantes' : 'espacos'}/${result.id}`}
                  className="flex-1 bg-gray-900 text-white text-center py-2.5 px-4 rounded-xl hover:bg-primary-600 transition-all font-semibold shadow-sm hover:shadow-md"
                >
                  Ver Detalhes
                </Link>

                <div className="flex gap-2">
                  {result.contact_whatsapp && (
                    <button
                      onClick={() => handleContactClick('whatsapp', result.contact_whatsapp!, result.title, result.id)}
                      className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                      title="Contato via WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  )}
                  {result.contact_phone && (
                    <button
                      onClick={() => handleContactClick('phone', result.contact_phone!, result.title, result.id)}
                      className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                      title="Ligar diretamente"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {
        totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={onPrevPage}
              disabled={!hasPrevPage}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <div className="flex gap-1 flex-wrap justify-center">
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
                    className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
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
        )
      }
    </div >
  )
}