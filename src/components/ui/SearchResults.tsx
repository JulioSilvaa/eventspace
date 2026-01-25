import { MapPin, Star, Eye, Wifi, Wind, Speaker, Armchair, Utensils, Music, Waves, Snowflake, Lightbulb } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SearchResult } from '@/services/search'
import { formatPrice, formatCurrency } from '@/lib/utils'
import { useEffect, useRef, Fragment, useMemo } from 'react'
import { AMENITY_LABELS } from '@/constants/amenities'
import FeedSponsor from '@/components/sponsors/FeedSponsor'
import { usePricingModels } from '@/hooks/usePricingModels'

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
    'parking': Armchair,
  }

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
    if (resultsTopRef.current) {
      resultsTopRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentPage])

  if (loading) {
    return (
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" : "flex flex-col gap-4 md:gap-6"}>
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
      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8" : "flex flex-col gap-4 md:gap-6 mb-8"}>
        {results.map((result, index) => (
          <Fragment key={result.id}>
            {index === 6 && import.meta.env.VITE_ENABLE_SPONSORS === 'true' && <FeedSponsor />}
            <div className={`group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col md:flex-row h-auto md:h-64' : 'flex flex-col h-full'}`}>
              {/* Imagem do Anúncio */}
              <div className={`relative bg-gray-100 overflow-hidden group shrink-0 ${viewMode === 'list' ? 'w-full md:w-80 h-56 md:h-full' : 'h-48 md:h-56 w-full'}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 z-10" />
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
                <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[80%] z-20">
                  <span className="bg-white/90 backdrop-blur-md text-secondary-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-white/20">
                    {result.category_name}
                  </span>
                  {result.featured && (
                    <span className="bg-yellow-400 text-yellow-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <Star className="w-3 h-3 fill-current" />
                      Destaque
                    </span>
                  )}
                </div>

                {/* Preço - Now Dark and Compact */}
                <div className="absolute bottom-3 right-3 z-20">
                  <div className="bg-secondary-950/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/10 shadow-lg">
                    <span className="text-sm font-bold">
                      {result.price ? formatCurrency(result.price).split(',')[0] : 'Consulte'}
                      <span className="text-xs font-normal text-gray-300 ml-0.5">
                        {result.price ? ',' + formatCurrency(result.price).split(',')[1] : ''}
                        {unitMap[result.price_type] || ''}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Título */}
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {result.title}
                    </h3>

                    {/* Localização */}
                    <div className="flex items-center text-gray-500 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-gray-400" />
                      <span className="truncate">
                        {result.neighborhood ? `${result.neighborhood}, ` : ''}
                        {result.city || 'Cidade não informada'}
                      </span>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {result.description}
                  </p>

                  {/* Conforto / Amenities */}
                  {result.category_type === 'space' && result.comfort && result.comfort.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
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
                </div>

                {/* Ações */}
                <div className="pt-2 mt-auto">
                  <Link
                    to={`/${result.category_type === 'advertiser' ? 'anunciantes' : 'espacos'}/${result.id}`}
                    className="block w-full bg-white border-2 border-gray-100 text-gray-700 hover:border-primary-500 hover:text-primary-600 font-bold text-center py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md text-sm"
                  >
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            </div>
          </Fragment>
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
      )}
    </div>
  )
}