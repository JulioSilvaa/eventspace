import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAdsStore } from '@/stores/adsStore'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReviewsList from '@/components/reviews/ReviewsList'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import LocationMap, { LocationFallback } from '@/components/maps/LocationMap'
import { geocodingService } from '@/services/geocodingService'
import { useToast } from '@/contexts/ToastContext'
import { useEventTracking } from '@/hooks/useRealTimeMetrics'
import { formatPrice } from '@/lib/utils'
import AdGallery from '@/components/ads/AdGallery'
import StickyBookingCard from '@/components/ads/StickyBookingCard'

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Share2,
  Ruler,
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
  Shield,
  UserCheck,
  Sparkles,
  UtensilsCrossed,
  Volume2,
  Lightbulb,
  Palette,
  Gamepad2,
  Camera,
  Dumbbell,
  Tv,
  Sofa,
  Coffee,
  Microwave,
  Refrigerator,
  WashingMachine,
  Speaker,
  Armchair,
  Phone,
  Crown,
  Home,
  MessageCircle
} from 'lucide-react'

import { AMENITY_LABELS } from '@/constants/amenities'

const AMENITIES_ICONS = {
  wifi: Wifi,
  parking: Car,
  kitchen: Utensils,
  bathrooms: Bath,
  air_conditioning: Snowflake,
  ventilation: Wind,
  tv: Tv,
  furniture: Sofa,
  coffee_area: Coffee,
  microwave: Microwave,
  refrigerator: Refrigerator,
  washing_machine: WashingMachine,
  sound_basic: Speaker,
  phone: Phone,
  location_access: MapPin,
}

const AMENITIES_LABELS = {
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
}

function ComfortItem({ name }: { name: string }) {
  const normalized = name.toLowerCase().trim()
  const label = AMENITY_LABELS[name] || AMENITY_LABELS[normalized] || name

  const icons: Record<string, any> = {
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
    'cadeiras': Armchair,
    'mesas': Armchair,
    'furniture': Sofa,
    'cozinha': Utensils,
    'kitchen': Utensils,
    'freezer': Snowflake,
    'geladeira': Refrigerator,
    'refrigerator': Refrigerator,
    'microwave': Microwave,
    'coffee_area': Coffee,
    'washing_machine': WashingMachine,
    'phone': Phone,
    'location_access': MapPin,
    'tv': Tv,
    'piscina': Waves,
    'pool': Waves,
    'churrasqueira': Flame,
    'bbq': Flame,
    'estacionamento': Car,
    'parking': Car,
    'segurança': Shield,
    'security': Shield,
    'limpeza': Sparkles,
    'cleaning': Sparkles,
    'jogos': Gamepad2,
    'game_room': Gamepad2,
    'futebol': Users,
    'soccer_field': Users,
    'garden': TreePine,
    'gym': Dumbbell,
    'sound_system': Music,
    'lighting': Lightbulb,
    'decoration': Palette,
    'professional_sound': Volume2,
    'lighting_system': Lightbulb,
    'decoration_items': Palette,
    'recording_equipment': Camera,
    'waitstaff': UserCheck,
    'catering': UtensilsCrossed,
    'setup': Users,
  }

  let Icon = icons[name] || icons[normalized]

  if (!Icon) {
    const key = Object.keys(icons).find(k => normalized.includes(k))
    Icon = key ? icons[key] : Sparkles
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 h-full">
      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
      <span className="text-gray-700 font-medium text-[11px] sm:text-xs md:text-sm break-words leading-tight">{label}</span>
    </div>
  )
}

export default function AdDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentAd: ad, fetchAdById, isLoading: storeLoading } = useAdsStore()
  const toast = useToast()
  const { trackView, trackWhatsAppContact, trackPhoneContact } = useEventTracking(id)

  const [isLoading, setIsLoading] = useState(true)
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0)
  const viewTrackedRef = useRef(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)

  const images = ad?.listing_images
    ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    ?.map(img => img.image_url) || []

  useEffect(() => {
    if (id && (!ad || ad.id !== id)) {
      setIsLoading(true)
      fetchAdById(id).finally(() => setIsLoading(false))
    } else if (ad) {
      setIsLoading(false)
    }
  }, [id, ad, fetchAdById])

  useEffect(() => {
    if (ad && id && !viewTrackedRef.current) {
      viewTrackedRef.current = true
      trackView()
    }
  }, [ad, id])

  // Geocode the ad location
  useEffect(() => {
    if (ad && !coordinates && ad.city && ad.state) {
      const geocodeLocation = async () => {
        setIsGeocodingLoading(true)
        try {
          let result = await geocodingService.geocodeCity(
            ad.city,
            ad.state,
            ad.neighborhood
          )

          if (!result && ad.neighborhood) {
            result = await geocodingService.geocodeCity(ad.city, ad.state)
          }

          if (result) {
            setCoordinates({ lat: result.latitude, lng: result.longitude })
          }
        } catch (error) {
          console.error('Erro ao buscar coordenadas:', error)
        } finally {
          setIsGeocodingLoading(false)
        }
      }

      geocodeLocation()
    }
  }, [ad, coordinates])

  const openWhatsApp = () => {
    const phone = ad?.contact_whatsapp || ad?.contact_phone
    if (!phone) {
      toast.warning('WhatsApp não disponível', 'Este anunciante não cadastrou um número de WhatsApp para este espaço.')
      return
    }

    trackWhatsAppContact()
    toast.success('Redirecionando...', 'Abrindo conversa no WhatsApp')

    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(`Olá! Vi seu anúncio no EventSpace: ${ad?.title}. Gostaria de mais informações.`)
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  const callPhone = () => {
    const phone = ad?.contact_phone || ad?.contact_whatsapp
    if (!phone) {
      toast.warning('Telefone não disponível', 'Este anunciante não cadastrou um número de telefone para este espaço.')
      return
    }

    trackPhoneContact()
    const cleanPhone = phone.replace(/\D/g, '')
    toast.success('Ligando...', 'Iniciando chamada para o anunciante.')
    window.open(`tel:${cleanPhone}`, '_self')
  }

  const shareAd = async () => {
    if (!ad) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `${ad.title} - ${formatPrice(ad.price, ad.price_type)}`,
          url: window.location.href,
        })
        toast.success('Compartilhado!', 'Anúncio compartilhado com sucesso.')
      } catch {
        // User cancelled sharing - no need to show error
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado!', 'Link do anúncio copiado para a área de transferência.')
      } catch {
        toast.error('Erro ao copiar', 'Não foi possível copiar o link. Tente novamente.')
      }
    }
  }

  if (isLoading || !ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {isLoading ? (
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-32"></div>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Anúncio não encontrado</h1>
            <p className="text-gray-600 mb-6">O anúncio que você está procurando não existe ou foi removido.</p>
            <Link to="/" className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
              Voltar ao início
            </Link>
          </div>
        )}
      </div>
    )
  }

  const specifications = ad.specifications || {}
  const amenities = Array.isArray(specifications.amenities) ? specifications.amenities : []
  const features = Array.isArray(specifications.features) ? specifications.features : []
  const services = Array.isArray(specifications.services) ? specifications.services : []

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* Navigation & Actions Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </button>

          <div className="flex items-center gap-2">
            <button onClick={shareAd} className="p-2 text-gray-600 hover:bg-white hover:text-blue-600 rounded-full transition-all" title="Compartilhar">
              <Share2 className="w-5 h-5" />
            </button>
            <FavoriteButton adId={ad.id} size="md" variant="button" className="hover:bg-white" />
          </div>
        </div>

        {/* Cinematic Gallery */}
        <div className="mb-8">
          <AdGallery title={ad.title} images={ad.listing_images || []} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">

          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Header Info */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {ad.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Destaque
                  </span>
                )}
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                  {ad.categories?.name || 'Espaço'}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>

              <div className="flex items-center text-gray-500 text-sm gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {ad.city}, {ad.state}
                </span>
                {!!specifications.capacity && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> Até {String(specifications.capacity)} pessoas
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="py-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre este espaço</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{ad.description}</p>
            </div>

            {/* Amenities Section */}
            {(ad.comfort && ad.comfort.length > 0 || amenities.length > 0) && (
              <div className="py-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">O que esse lugar oferece</h2>
                <div className="grid grid-cols-2 gap-4">
                  {ad.comfort && ad.comfort.map((item: string) => (
                    <ComfortItem key={item} name={item} />
                  ))}
                  {!ad.comfort && amenities.map((item: any) => (
                    <ComfortItem key={String(item)} name={String(item)} />
                  ))}
                </div>
              </div>
            )}

            {/* Location Map */}
            <div className="py-6 border-t border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Onde você vai estar</h2>

              <div className="space-y-4 mb-8">
                {/* City/State (Main) */}
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600 mt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900 text-lg">{ad.city}, {ad.state}</p>
                    <p className="text-blue-700 text-sm">Localização principal</p>
                  </div>
                </div>

                {/* Bairro */}
                {ad.neighborhood && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Bairro: </span>
                      <span className="text-gray-600">{ad.neighborhood}</span>
                    </div>
                  </div>
                )}

                {/* Address Lines */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Endereço: </span>
                    <span className="text-gray-600">{ad.street}, {ad.number}</span>
                  </div>
                </div>

                {/* CEP */}
                {ad.postal_code && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <Share2 className="w-4 h-4 rotate-90" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">CEP: </span>
                      <span className="text-gray-600">{ad.postal_code}</span>
                    </div>
                  </div>
                )}
              </div>

              {coordinates ? (
                <LocationMap
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                  title={ad.title}
                  address={`${ad.street}, ${ad.number} - ${ad.city}, ${ad.state}`}
                  height="400px"
                />
              ) : (
                <LocationFallback city={ad.city} state={ad.state} neighborhood={ad.neighborhood} />
              )}
            </div>


            {/* Reviews */}
            <div className="py-6 border-t border-gray-200">
              <ReviewsList listingId={ad.id} />
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Avaliar este espaço</h3>
                <ReviewForm listingId={ad.id} onReviewSubmitted={() => setReviewsRefreshTrigger(prev => prev + 1)} />
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-1 hidden lg:block">
            <StickyBookingCard
              ad={ad}
              onWhatsApp={openWhatsApp}
              onCall={callPhone}
              onShare={shareAd}
            />
          </div>

        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 lg:hidden z-[9999] pb-safe shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Valor Total</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-gray-900 leading-tight">
                {formatPrice(ad.price, ad.price_type).split('/')[0]}
              </span>
              <span className="text-[10px] text-gray-500">/{ad.price_type === 'hourly' ? 'h' : 'dia'}</span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {(ad.contact_phone || ad.contact_whatsapp) && (
              <button
                onClick={callPhone}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                aria-label="Ligar"
              >
                <Phone className="w-5 h-5" />
              </button>
            )}

            {(ad.contact_whatsapp || ad.contact_phone) && (
              <button
                onClick={openWhatsApp}
                className="bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#128C7E] transition-colors shadow-sm text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}