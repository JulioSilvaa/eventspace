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
import Seo from '@/components/common/Seo'

import {
  ArrowLeft,
  MapPin,
  Users,
  Share2,
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
  MessageCircle,
  ChevronRight
} from 'lucide-react'

import { AMENITY_LABELS } from '@/constants/amenities'

// Reuse existing ComfortItem logic but with updated styles
function ComfortItem({ name }: { name: string }) {
  const normalized = name.toLowerCase().trim()
  const label = AMENITY_LABELS[name] || AMENITY_LABELS[normalized] || name

  const icons: Record<string, any> = {
    'wifi': Wifi,
    'wi-fi': Wifi,
    'internet': Wifi,
    'ar condicionado': Snowflake,
    'ar_conditioning': Snowflake,
    'ventilation': Wind,
    'som': Speaker,
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
    'tv': Tv,
    'piscina': Waves,
    'pool': Waves,
    'churrasqueira': Flame,
    'bbq': Flame,
    'estacionamento': Car,
    'parking': Car,
    'segurança': Shield,
    'limpeza': Sparkles,
    'jogos': Gamepad2,
    'futebol': Users,
    'garden': TreePine,
  }

  let Icon = icons[name] || icons[normalized]
  if (!Icon) {
    const key = Object.keys(icons).find(k => normalized.includes(k))
    Icon = key ? icons[key] : Sparkles
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="p-2 bg-primary-50 rounded-xl text-primary-500">
        <Icon className="w-5 h-5 flex-shrink-0" />
      </div>
      <span className="text-secondary-900 font-medium text-sm leading-tight">{label}</span>
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

  useEffect(() => {
    if (ad && !coordinates && ad.city && ad.state) {
      geocodingService.geocodeCity(ad.city, ad.state, ad.neighborhood)
        .then(res => res && setCoordinates({ lat: res.latitude, lng: res.longitude }))
        .catch(console.error)
    }
  }, [ad, ad?.city, ad?.state, ad?.neighborhood])

  const openWhatsApp = () => {
    const phone = ad?.contact_whatsapp || ad?.contact_phone
    if (!phone) return toast.warning('WhatsApp não disponível')
    trackWhatsAppContact()
    toast.success('Redirecionando...', 'Abrindo conversa no WhatsApp')
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(`Olá! Vi seu anúncio no EventSpace: ${ad?.title}.`)
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  const callPhone = () => {
    const phone = ad?.contact_phone || ad?.contact_whatsapp
    if (!phone) return toast.warning('Telefone não disponível')
    trackPhoneContact()
    toast.success('Ligando...', 'Iniciando chamada para o anunciante.')
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self')
  }

  const shareAd = async () => {
    if (!ad) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: ad.title,
          text: `${ad.title} - ${formatPrice(ad.price, ad.price_type)}`,
          url: window.location.href,
        })
        toast.success('Compartilhado!', 'Anúncio compartilhado.')
      } else {
        throw new Error('Share API not supported')
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado!', 'Link do anúncio copiado para a área de transferência.')
    }
  }

  if (isLoading || !ad) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
        </div>
      </div>
    )
  }

  const specifications = ad.specifications || {}
  const amenities = Array.isArray(specifications.amenities) ? specifications.amenities : []

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 md:pb-20">
      <Seo title={ad.title} description={ad.description.substring(0, 160)} image={ad.listing_images?.[0]?.image_url} />

      {/* Immersive Mobile Header / Desktop Header */}
      <div className="md:max-w-7xl md:mx-auto md:px-4 md:pt-6">
        {/* Navigation Header */}
        <div className="flex justify-between items-center px-4 py-4 md:px-0">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-gray-100 rounded-full text-secondary-950 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={shareAd}
              className="p-3 bg-white border border-gray-100 rounded-full text-secondary-950 hover:text-primary-600 hover:bg-primary-50 transition-all shadow-sm active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <div className="bg-white border border-gray-100 rounded-full shadow-sm">
              <FavoriteButton adId={ad.id} size="lg" variant="button" className="text-secondary-950 hover:text-red-500" />
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="relative md:rounded-[2.5rem] overflow-hidden shadow-2xl">
          <AdGallery title={ad.title} images={ad.listing_images || []} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Title & Key Stats */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {ad.featured && <span className="bg-yellow-400 text-yellow-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider"><Crown className="w-3 h-3" /> Destaque</span>}
                <span className="bg-secondary-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{ad.categories?.name || 'Espaço'}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-secondary-950 mb-4 leading-tight">{ad.title}</h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-500 text-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">{ad.city}, {ad.state}</span>
                </div>
                {ad.capacity !== undefined && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="font-medium">Até {String(ad.capacity)} pessoas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary-950 mb-6">Sobre o espaço</h2>
              <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-wrap break-words max-w-none">
                {ad.description}
              </div>
            </div>

            {/* Amenities */}
            {((ad.comfort && ad.comfort.length > 0) || amenities.length > 0) && (
              <div>
                <h2 className="text-2xl font-bold text-secondary-950 mb-6">Comodidades</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ad.comfort?.map((item: string) => <ComfortItem key={item} name={item} />)}
                  {!ad.comfort && amenities.map((item: any) => <ComfortItem key={String(item)} name={String(item)} />)}
                </div>
              </div>
            )}

            {/* Location Section */}
            <div>
              <h2 className="text-2xl font-bold text-secondary-950 mb-6">Localização</h2>

              {/* Address Card */}
              <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shrink-0">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Endereço do Espaço</p>
                  <p className="text-lg md:text-2xl font-bold text-secondary-950 mb-1 break-words leading-snug">
                    {ad.street}{ad.number && `, ${ad.number}`}{ad.complement && ` - ${ad.complement}`}
                  </p>
                  <p className="text-gray-500 text-base md:text-lg break-words">
                    {ad.neighborhood} • {ad.city}/{ad.state} {ad.postal_code && `• CEP ${ad.postal_code}`}
                  </p>
                  {(ad.reference_point || specifications.reference_point) && (
                    <p className="text-gray-500 text-sm md:text-base mt-2 italic break-words">
                      Ponto de referência: {String(ad.reference_point || specifications.reference_point || '')}
                    </p>
                  )}
                </div>
              </div>

              {/* Map Box */}
              <div className="rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-lg h-[300px] md:h-[400px] relative z-0">
                {coordinates ? (
                  <LocationMap latitude={coordinates.lat} longitude={coordinates.lng} title={ad.title} address={`${ad.street}, ${ad.city}`} height="100%" />
                ) : (
                  <LocationFallback city={ad.city} state={ad.state} neighborhood={ad.neighborhood} />
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <ReviewsList listingId={ad.id} />
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-xl font-bold mb-6">Avalie sua experiência</h3>
                <ReviewForm listingId={ad.id} onReviewSubmitted={() => setReviewsRefreshTrigger(p => p + 1)} />
              </div>
            </div>

          </div>

          {/* Desktop Sticky Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <StickyBookingCard ad={ad} onWhatsApp={openWhatsApp} onCall={callPhone} onShare={shareAd} />
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 lg:hidden z-50 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">A partir de</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-secondary-950">{formatPrice(ad.price, ad.price_type).split('/')[0]}</span>
              <span className="text-xs font-bold text-gray-400">/{ad.price_type === 'hourly' ? 'h' : 'dia'}</span>
            </div>
          </div>
          {(ad.contact_whatsapp || ad.contact_phone) && (
            <button onClick={openWhatsApp} className="flex-1 bg-primary-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/30 active:scale-95 flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Reservar
            </button>
          )}
        </div>
      </div>

    </div>
  )
}