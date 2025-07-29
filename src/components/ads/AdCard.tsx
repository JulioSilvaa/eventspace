import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Crown, 
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
  Lightbulb
} from 'lucide-react'
import StarRating from '@/components/reviews/StarRating'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import PremiumBadge from '@/components/ui/PremiumBadge'

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
    featured?: boolean
    views_count: number
    rating?: number
    created_at: string
    listing_images?: Array<{ image_url: string }>
    user_plan_type?: string
  }
  size?: 'small' | 'medium' | 'large'
  showViewCount?: boolean
  showDate?: boolean
}

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
}

const AMENITIES_NAMES = {
  wifi: 'Wi-Fi',
  parking: 'Estacionamento',
  kitchen: 'Cozinha',
  bathrooms: 'Banheiros',
  air_conditioning: 'Ar Condicionado',
  ventilation: 'Ventilação',
  tv: 'TV/Televisão',
  furniture: 'Mobiliário',
  coffee_area: 'Área de Café',
  microwave: 'Micro-ondas',
  refrigerator: 'Geladeira/Frigobar',
  washing_machine: 'Máquina de Lavar',
  sound_basic: 'Som Básico',
  phone: 'Telefone',
  location_access: 'Fácil Acesso',
  pool: 'Piscina',
  bbq: 'Churrasqueira',
  garden: 'Área Verde/Jardim',
  soccer_field: 'Campo de Futebol',
  game_room: 'Salão de Jogos',
  gym: 'Academia',
  sound_system: 'Som Ambiente',
  lighting: 'Iluminação Especial',
  decoration: 'Decoração Inclusa',
  professional_sound: 'Som Profissional',
  lighting_system: 'Sistema de Iluminação',
  decoration_items: 'Itens Decorativos',
  recording_equipment: 'Equipamento de Gravação',
  cleaning: 'Limpeza',
  security: 'Segurança',
  waitstaff: 'Garçom/Atendimento',
  catering: 'Buffet/Catering',
  setup: 'Montagem/Desmontagem',
}

export default function AdCard({ 
  ad, 
  size = 'medium', 
  showViewCount = false, 
  showDate = false 
}: AdCardProps) {
  const formatPrice = (price: number, priceType: string) => {
    const formatted = price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    const period = priceType === 'daily' ? 'dia' : priceType === 'hourly' ? 'hora' : 'evento'
    return `${formatted}/${period}`
  }

  const getTopAmenities = () => {
    const allAmenities = [
      ...(ad.specifications?.amenities || []),
      ...(ad.specifications?.features || [])
    ]
    return allAmenities.slice(0, 3)
  }

  const topAmenities = getTopAmenities()
  const isSpace = ad.categories?.type === 'space'
  const defaultImage = isSpace 
    ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'
    : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'

  const cardClasses = {
    small: 'bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden',
    medium: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden',
    large: 'bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow overflow-hidden'
  }

  const imageClasses = {
    small: 'w-full h-48 object-cover',
    medium: 'w-full h-56 object-cover',
    large: 'w-full h-64 object-cover'
  }

  const paddingClasses = {
    small: 'p-4',
    medium: 'p-5',
    large: 'p-6'
  }

  return (
    <Link to={`/anuncio/${ad.id}`} className="block group">
      <div className={cardClasses[size]}>
        {/* Image */}
        <div className="relative">
          <img
            src={ad.listing_images?.[0]?.image_url || defaultImage}
            alt={ad.title}
            className={imageClasses[size]}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <PremiumBadge userPlanType={ad.user_plan_type} size="sm" />
            {ad.featured && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Destaque
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
              isSpace ? 'bg-green-500' : 'bg-blue-500'
            }`}>
              {isSpace ? (
                <Building2 className="w-3 h-3 inline mr-1" />
              ) : (
                <Wrench className="w-3 h-3 inline mr-1" />
              )}
              {isSpace ? 'Espaço' : 'Equipamento'}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full">
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
          <h3 className={`font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors ${
            size === 'small' ? 'text-base' : size === 'medium' ? 'text-lg' : 'text-xl'
          }`}>
            {ad.title}
          </h3>

          {/* Category */}
          {ad.categories && (
            <p className="text-sm text-gray-600 mb-2">{ad.categories.name}</p>
          )}

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
                const IconComponent = AMENITIES_ICONS[amenity as keyof typeof AMENITIES_ICONS]
                const amenityName = AMENITIES_NAMES[amenity as keyof typeof AMENITIES_NAMES] || amenity
                return (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {IconComponent && <IconComponent className="w-3 h-3" />}
                    <span>{amenityName}</span>
                  </div>
                )
              })}
              {(ad.specifications?.amenities || []).length + (ad.specifications?.features || []).length > 3 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  +{(ad.specifications?.amenities || []).length + (ad.specifications?.features || []).length - 3} mais
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
    </Link>
  )
}