import { Link } from 'react-router-dom'
import {
  MapPin,
  Star,
  Building2,
  Wrench,
  Users,
  Calendar,
  Eye,
  Wifi,
  Car,
  Utensils,
  Bath,
  Snowflake,
  Wind,
  Waves,
  Flame,
  TreePine,
  Music,
  Lightbulb,
  Crown
} from 'lucide-react'
import StarRating from '@/components/reviews/StarRating'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import { formatPrice } from '@/lib/utils'
import { AMENITY_LABELS } from '@/constants/amenities'


interface AdCardProps {
  ad: {
    id: string
    title: string
    price: number
    price_type: string
    city: string
    state: string
    categories?: {
      name: string
      type: string
    }
    specifications?: {
      capacity?: number
      amenities?: string[]
      features?: string[]
    }
    comfort?: string[]
    featured?: boolean
    views_count: number
    rating?: number
    created_at: string
    listing_images?: Array<{ image_url: string }>
    user_plan_type?: string
    subscription?: {
      plan: string
      status: string
      price?: number
    }
  }
  size?: 'small' | 'medium' | 'large'
  showViewCount?: boolean
  showDate?: boolean
}

// Map old AdCard amenity names to new labels if needed, or better, import generic mapping if possible.
// For now, we reuse existing local map but prioritize 'comfort' array which uses new keys.

const AMENITIES_ICONS = {
  wifi: Wifi,
  parking: Car,
  kitchen: Utensils,
  bathrooms: Bath,
  air_conditioning: Snowflake,
  ventilation: Wind,
  pool: Waves,
  bbq: Flame,
  garden: TreePine,
  sound_system: Music,
  lighting: Lightbulb,
  // Add mappings for new portuguese keys if they appear raw? 
  // The backend sends 'wifi', 'piscina' etc. 
  // We need to map 'piscina' -> Waves.
  piscina: Waves,
  churrasqueira: Flame,
  'ar condicionado': Snowflake,
  estacionamento: Car,
  cozinha: Utensils,
  som: Music,
  iluminação: Lightbulb
} as any

export default function AdCard({
  ad,
  size = 'medium',
  showViewCount = false,
  showDate = false
}: AdCardProps) {

  const getTopAmenities = () => {
    // Prioritize new 'comfort' field
    if (ad.comfort && ad.comfort.length > 0) {
      return ad.comfort.slice(0, 3)
    }
    // Fallback to old specifications
    const allAmenities = [
      ...(ad.specifications?.amenities || []),
      ...(ad.specifications?.features || [])
    ]
    return allAmenities.slice(0, 3)
  }

  const topAmenities = getTopAmenities()
  const totalAmenitiesCount = (ad.comfort?.length || 0) || ((ad.specifications?.amenities || []).length + (ad.specifications?.features || []).length)

  /* Debug logs removed */

  const isSpace = ad.categories?.type === 'space'
  const defaultImage = isSpace
    ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
    : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'

  const cardClasses = {
    small: 'bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full',
    medium: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col h-full',
    large: 'bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow overflow-hidden flex flex-col h-full'
  }

  const imageClasses = {
    small: 'w-full h-40 md:h-48 object-cover',
    medium: 'w-full h-48 md:h-56 object-cover',
    large: 'w-full h-56 md:h-64 object-cover'
  }

  const paddingClasses = {
    small: 'p-3 md:p-4 flex flex-col flex-grow',
    medium: 'p-4 md:p-5 flex flex-col flex-grow',
    large: 'p-5 md:p-6 flex flex-col flex-grow'
  }

  return (
    <Link to={isSpace ? `/espacos/${ad.id}` : `/anunciantes/${ad.id}`} className="block group h-full">
      <div className={cardClasses[size]}>
        {/* Image */}
        <div className="relative">
          <img
            src={ad.listing_images?.[0]?.image_url || defaultImage}
            alt={ad.title}
            className={imageClasses[size]}
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = defaultImage
            }}
          />

          {/* Badges: Category (Top Left) */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs px-2.5 py-1 rounded-lg font-semibold shadow-sm border border-white/20">
              {ad.categories?.name || (isSpace ? 'Espaço' : 'Equipamento')}
            </span>
          </div>

          {/* Badges: Founder (Top Right) */}
          {ad.subscription?.plan === 'founder' && ad.subscription?.status === 'active' && (
            <div className="absolute top-3 right-3 z-10">
              <div className="p-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 shadow-md border border-white/20 flex items-center justify-center">
                <Crown size={14} className="text-white fill-current" />
              </div>
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full">
            <span className="font-bold text-sm">{formatPrice(ad.price, ad.price_type)}</span>
          </div>

          {/* Favorite Button */}
          <div className="absolute bottom-3 right-3">
            <FavoriteButton
              adId={ad.id}
              size="sm"
              variant="button"
              className="bg-white bg-opacity-90 hover:bg-opacity-100 shadow-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className={paddingClasses[size]}>
          {/* Title */}
          <h3 className={`font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 ${size === 'small' ? 'text-sm md:text-base' : size === 'medium' ? 'text-base md:text-lg' : 'text-lg md:text-xl'
            }`}>
            {ad.title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm">{ad.city}, {ad.state}</span>
          </div>

          {/* Capacity for spaces */}
          {isSpace && ad.specifications?.capacity && (
            <div className="flex items-center text-gray-600 mb-3">
              <Users className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-sm">Até {ad.specifications.capacity} pessoas</span>
            </div>
          )}

          {/* Top amenities */}
          {topAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {topAmenities.map((amenity, index) => {
                const normalizedKey = amenity.toLowerCase().trim()
                // Try to find icon by exact match or normalized key
                let IconComponent = AMENITIES_ICONS[amenity] || AMENITIES_ICONS[normalizedKey]

                // Fallback for icon if not found
                if (!IconComponent) {
                  const key = Object.keys(AMENITIES_ICONS).find(k => normalizedKey.includes(k))
                  IconComponent = key ? AMENITIES_ICONS[key] : Star
                }

                // Name lookup
                const amenityName = AMENITY_LABELS[amenity] || AMENITY_LABELS[normalizedKey] || amenity

                return (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span className="truncate max-w-[100px]">{amenityName}</span>
                  </div>
                )
              })}
              {totalAmenitiesCount > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  +{totalAmenitiesCount - 3} mais
                </span>
              )}
            </div>
          )}

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
            <div className="flex items-center gap-3">
              {showDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              {showViewCount && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{ad.views_count} views</span>
                </div>
              )}
            </div>

            {/* Rating */}
            {ad.rating && ad.rating > 0 ? (
              <StarRating
                rating={ad.rating}
                readonly
                size="sm"
                showValue
              />
            ) : (
              <span className="text-xs text-gray-400">Sem avaliações</span>
            )}
          </div>
        </div>
      </div>
    </Link >
  )
}