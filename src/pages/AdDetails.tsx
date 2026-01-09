import { useState, useEffect, useCallback, useRef } from 'react'
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

interface ImageData {
  url?: string
  image_url?: string
}
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Users,
  Eye,
  Share2,
  ChevronLeft,
  ChevronRight,
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
  X,
  ZoomIn,
  Instagram,
  Facebook,
  Home,
  Navigation,
  Tv,
  Sofa,
  Coffee,
  Microwave,
  Refrigerator,
  WashingMachine,
  Speaker,
  Armchair
} from 'lucide-react'

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

const FEATURES_ICONS = {
  pool: Waves,
  bbq: Flame,
  garden: TreePine,
  soccer_field: Users,
  game_room: Gamepad2,
  gym: Dumbbell,
  sound_system: Music,
  lighting: Lightbulb,
  decoration: Palette,
  professional_sound: Volume2,
  lighting_system: Lightbulb,
  decoration_items: Palette,
  recording_equipment: Camera,
}

const SERVICES_ICONS = {
  cleaning: Sparkles,
  security: Shield,
  waitstaff: UserCheck,
  catering: UtensilsCrossed,
  setup: Users,
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

const FEATURES_LABELS = {
  // Recursos para espaços
  pool: 'Piscina',
  bbq: 'Churrasqueira',
  garden: 'Área Verde/Jardim',
  soccer_field: 'Campo de Futebol',
  game_room: 'Salão de Jogos',
  gym: 'Academia',
  sound_system: 'Som Ambiente',
  lighting: 'Iluminação Especial',
  decoration: 'Decoração Inclusa',
  // Recursos para equipamentos
  professional_sound: 'Som Profissional',
  lighting_system: 'Sistema de Iluminação',
  decoration_items: 'Itens Decorativos',
  recording_equipment: 'Equipamento de Gravação',
}

const SERVICES_LABELS = {
  cleaning: 'Limpeza',
  security: 'Segurança',
  waitstaff: 'Garçom/Atendimento',
  catering: 'Buffet/Catering',
  setup: 'Montagem/Desmontagem',
}

import { AMENITY_LABELS } from '@/constants/amenities'

function ComfortItem({ name }: { name: string }) {
  const normalized = name.toLowerCase().trim()
  // Try to find translation by key (name) or match normalized
  // The database stores keys like 'wifi', 'pool' which match keys in AMENITY_LABELS
  const label = AMENITY_LABELS[name] || AMENITY_LABELS[normalized] || name

  const icons: Record<string, any> = {
    'wifi': Wifi,
    'wi-fi': Wifi,
    'internet': Wifi,
    'ar condicionado': Snowflake,
    'ar-condicionado': Snowflake,
    'ar_conditioning': Snowflake, // key from constants
    'climatização': Snowflake,
    'ventilation': Wind, // key from constants
    'som': Speaker,
    'sound_basic': Speaker, // key from constants
    'iluminação': Lightbulb,
    'cadeiras': Armchair,
    'mesas': Armchair, // Using Armchair as generic furniture
    'furniture': Sofa, // key from constants
    'cozinha': Utensils,
    'kitchen': Utensils, // key from constants
    'freezer': Snowflake,
    'geladeira': Refrigerator,
    'refrigerator': Refrigerator, // key from constants
    'microwave': Microwave, // key from constants
    'coffee_area': Coffee, // key from constants
    'washing_machine': WashingMachine, // key from constants
    'phone': Phone, // key from constants
    'location_access': MapPin, // key from constants
    'tv': Tv, // key from constants
    'piscina': Waves,
    'pool': Waves, // key from constants
    'churrasqueira': Flame,
    'bbq': Flame, // key from constants
    'estacionamento': Car,
    'parking': Car, // key from constants
    'segurança': Shield,
    'security': Shield, // key from constants
    'limpeza': Sparkles,
    'cleaning': Sparkles, // key from constants
    'jogos': Gamepad2,
    'game_room': Gamepad2, // key from constants
    'futebol': Users, // Generic for sports
    'soccer_field': Users, // key from constants
    'garden': TreePine, // key from constants
    'gym': Dumbbell, // key from constants
    'sound_system': Music, // key from constants
    'lighting': Lightbulb, // key from constants
    'decoration': Palette, // key from constants
    'professional_sound': Volume2, // key from constants
    'lighting_system': Lightbulb, // key from constants
    'decoration_items': Palette, // key from constants
    'recording_equipment': Camera, // key from constants
    'waitstaff': UserCheck, // key from constants
    'catering': UtensilsCrossed, // key from constants
    'setup': Users, // key from constants
  }

  // Find a matching icon
  // First check if the exact name exists as key (for english keys like 'wifi')
  // Then check normalized includes for partial matches
  let Icon = icons[name] || icons[normalized]

  if (!Icon) {
    const key = Object.keys(icons).find(k => normalized.includes(k))
    Icon = key ? icons[key] : Sparkles // Default icon
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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)

  const images = ad?.listing_images
    ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    ?.map(img => img.image_url) || []

  const nextModalImage = useCallback(() => {
    setModalImageIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevModalImage = useCallback(() => {
    setModalImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

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
      // Rastrear view apenas uma vez por sessão
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
          // Tentar primeiro com bairro para maior precisão
          let result = await geocodingService.geocodeCity(
            ad.city,
            ad.state,
            ad.neighborhood
          )

          // Se falhar ou estiver em local genérico (bairro estranho), tenta apenas cidade/estado
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return

      if (e.key === 'Escape') {
        closeModal()
      } else if (e.key === 'ArrowLeft') {
        prevModalImage()
      } else if (e.key === 'ArrowRight') {
        nextModalImage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, nextModalImage, prevModalImage])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Anúncio não encontrado</h1>
          <p className="text-gray-600 mb-6">O anúncio que você está procurando não existe ou foi removido.</p>
          <Link
            to="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  // images already defined at top of component
  const specifications = ad.specifications || {}
  const amenities = Array.isArray(specifications.amenities) ? specifications.amenities : []
  const features = Array.isArray(specifications.features) ? specifications.features : []
  const services = Array.isArray(specifications.services) ? specifications.services : []


  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const limitedNumbers = numbers.slice(0, 11)

    if (limitedNumbers.length <= 10) {
      return limitedNumbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else {
      return limitedNumbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    }
  }

  // Funções removidas - não utilizadas na galeria em grid
  // const nextImage = () => {
  //   setCurrentImageIndex((prev) => (prev + 1) % images.length)
  // }

  // const prevImage = () => {
  //   setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  // }

  const openWhatsApp = () => {
    const phone = ad.contact_whatsapp || ad.contact_phone
    if (!phone) {
      toast.warning('WhatsApp não disponível', 'Este anunciante não cadastrou um número de WhatsApp para este espaço.')
      return
    }

    trackWhatsAppContact()
    toast.success('Redirecionando...', 'Abrindo conversa no WhatsApp')

    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(`Olá! Vi seu anúncio no EventSpace: ${ad.title}. Gostaria de mais informações.`)
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  const callPhone = () => {
    const phone = ad.contact_phone || ad.contact_whatsapp
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

  const openModal = (index: number) => {
    setModalImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Helper getters for contact info (only use listing contacts, no fallback to owner)
  const displayPhone = ad.contact_phone;
  const displayWhatsapp = ad.contact_whatsapp;
  const displayEmail = ad.contact_email;
  const displayInstagram = ad.contact_instagram;
  const displayFacebook = ad.contact_facebook;

  const hasAnyContact = displayPhone || displayWhatsapp || displayEmail || displayInstagram || displayFacebook;
  const hasActionableContact = displayPhone || displayWhatsapp;

  return (
    <div className="min-h-screen bg-gray-50 pb-40 lg:pb-0">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={shareAd}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <FavoriteButton
              adId={ad.id}
              size="md"
              variant="button"
              className="hover:bg-gray-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de imagens */}
            {images.length > 0 ? (
              <div className="space-y-4">
                {/* Mobile Gallery (Swipeable Carousel) */}
                <div className="md:hidden relative -mx-4">
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-video">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="snap-center flex-shrink-0 w-full h-full relative"
                        onClick={() => openModal(index)}
                      >
                        <img
                          src={typeof image === 'string' ? image : (image as ImageData)?.url || (image as ImageData)?.image_url || '/placeholder-image.jpg'}
                          alt={`${ad.title} - Imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {images.length > 1 && (
                    <div className="absolute bottom-3 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1 pointer-events-none">
                      <Camera className="w-3 h-3" />
                      <span>{images.length} fotos</span>
                    </div>
                  )}
                </div>

                {/* Desktop Gallery (Grid) */}
                <div className="hidden md:grid gap-4">
                  {images.length === 1 ? (
                    /* Uma única imagem - exibir maior */
                    <div className="relative group">
                      <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => openModal(0)}>
                        <img
                          src={typeof images[0] === 'string' ? images[0] : (images[0] as ImageData)?.url || (images[0] as ImageData)?.image_url || '/placeholder-image.jpg'}
                          alt={`${ad.title} - Imagem 1`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer" onClick={() => openModal(0)}>
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : images.length === 2 ? (
                    /* Duas imagens - lado a lado */
                    <div className="grid grid-cols-2 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => openModal(index)}>
                            <img
                              src={typeof image === 'string' ? image : (image as ImageData)?.url || (image as ImageData)?.image_url || '/placeholder-image.jpg'}
                              alt={`${ad.title} - Imagem ${index + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer" onClick={() => openModal(index)}>
                            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : images.length === 3 ? (
                    /* Três imagens - primeira grande, duas menores */
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => openModal(0)}>
                          <img
                            src={typeof images[0] === 'string' ? images[0] : (images[0] as ImageData)?.url || (images[0] as ImageData)?.image_url || '/placeholder-image.jpg'}
                            alt={`${ad.title} - Imagem 1`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer" onClick={() => openModal(0)}>
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div className="grid grid-rows-2 gap-4">
                        {images.slice(1, 3).map((image, index) => (
                          <div key={index + 1} className="relative group">
                            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => openModal(index + 1)}>
                              <img
                                src={typeof image === 'string' ? image : (image as ImageData)?.url || (image as ImageData)?.image_url || '/placeholder-image.jpg'}
                                alt={`${ad.title} - Imagem ${index + 2}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer" onClick={() => openModal(index + 1)}>
                              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Quatro ou mais imagens - layout complexo */
                    <div className="grid grid-cols-2 gap-4">
                      {/* Primeira imagem - grande */}
                      <div className="relative group">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => openModal(0)}>
                          <img
                            src={typeof images[0] === 'string' ? images[0] : (images[0] as ImageData)?.url || (images[0] as ImageData)?.image_url || '/placeholder-image.jpg'}
                            alt={`${ad.title} - Imagem 1`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer" onClick={() => openModal(0)}>
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Grid 2x2 para as outras imagens */}
                      <div className="grid grid-cols-2 grid-rows-2 gap-2">
                        {images.slice(1, 5).map((image, index) => (
                          <div key={index + 1} className="relative group">
                            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer" onClick={() => openModal(index + 1)}>
                              <img
                                src={typeof image === 'string' ? image : (image as ImageData)?.url || (image as ImageData)?.image_url || '/placeholder-image.jpg'}
                                alt={`${ad.title} - Imagem ${index + 2}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                              {/* Mostrar contador se for a última imagem e houver mais */}
                              {index === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                  <span className="text-white text-lg font-semibold">+{images.length - 5}</span>
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center cursor-pointer" onClick={() => openModal(index + 1)}>
                              {!(index === 3 && images.length > 5) && (
                                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contador total de imagens */}
                {images.length > 1 && (
                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      {images.length} {images.length === 1 ? 'imagem' : 'imagens'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p>Nenhuma imagem disponível</p>
                </div>
              </div>
            )}

            {/* Informações principais */}
            <div className="bg-white lg:rounded-lg lg:shadow px-4 py-6 md:p-6 -mx-4 md:mx-0 border-b md:border-b-0 border-gray-100">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900 break-words leading-snug">{ad.title}</h1>
                  </div>
                  <p className="text-lg md:text-xl text-green-600 font-bold tracking-tight">{formatPrice(ad.price, ad.price_type)}</p>
                </div>
                {ad.featured && (
                  <span className="flex-shrink-0 bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-wide">
                    Destaque
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{ad.city}, {ad.state}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{new Date(ad.created_at).toLocaleDateString('pt-BR')}</span>
                </span>
              </div>

              {/* Informações específicas para espaços */}
              {typeof specifications.capacity === 'number' && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex flex-col justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-gray-500 uppercase">Capacidade</span>
                    </div>
                    <p className="font-bold text-gray-900">{String(specifications.capacity)} pessoas</p>
                  </div>
                  {typeof specifications.area_sqm === 'number' && (
                    <div className="flex flex-col justify-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Ruler className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Área</span>
                      </div>
                      <p className="font-bold text-gray-900">{String(specifications.area_sqm)} m²</p>
                    </div>
                  )}
                </div>
              )}

              <div className="prose prose-sm md:prose-base max-w-none text-gray-600 overflow-hidden">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Descrição</h3>
                <p className="whitespace-pre-wrap break-words break-all leading-relaxed">{ad.description}</p>
              </div>
            </div>

            {/* Comodidades e Recursos (Unified Comfort List) */}
            {(ad.comfort && ad.comfort.length > 0) || amenities.length > 0 || features.length > 0 || services.length > 0 ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">O que esse lugar oferece</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                  {/* Render ad.comfort items with flexible matching */}
                  {ad.comfort && ad.comfort.map((item: string) => (
                    <ComfortItem key={item} name={item} />
                  ))}

                  {/* Fallback for legacy amenities/features if comfort is empty but others exist */}
                  {(!ad.comfort || ad.comfort.length === 0) && amenities.map((amenity: any) => {
                    const Icon = AMENITIES_ICONS[amenity as keyof typeof AMENITIES_ICONS] || Wifi
                    const label = AMENITIES_LABELS[amenity as keyof typeof AMENITIES_LABELS] || amenity
                    return (
                      <div key={String(amenity)} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">{String(label)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {/* Localização */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>

              {/* Informações de endereço */}
              <div className="space-y-3 mb-6">
                {/* Cidade e Estado - Principal */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{ad.city}, {ad.state}</p>
                    <p className="text-xs text-blue-600">Localização principal</p>
                  </div>
                </div>

                {/* Detalhes do endereço */}
                <div className="space-y-2">
                  {ad.neighborhood && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Home className="w-3 h-3 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Bairro:</span>
                        <span className="ml-2 text-gray-600">{ad.neighborhood}</span>
                      </div>
                    </div>
                  )}

                  {typeof ad.specifications?.address === 'string' && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-3 h-3 text-purple-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Endereço:</span>
                        <span className="ml-2 text-gray-600">{String(ad.specifications.address)}</span>
                      </div>
                    </div>
                  )}

                  {ad.postal_code && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-3 h-3 text-indigo-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">CEP:</span>
                        <span className="ml-2 text-gray-600 font-mono">{ad.postal_code}</span>
                      </div>
                    </div>
                  )}

                  {typeof ad.specifications?.reference_point === 'string' && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-3 h-3 text-orange-600" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Referência:</span>
                        <span className="ml-2 text-gray-600">{String(ad.specifications.reference_point)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mapa ou fallback */}
              {isGeocodingLoading ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mx-auto"></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-4">Carregando localização no mapa...</p>
                </div>
              ) : coordinates ? (
                <LocationMap
                  latitude={coordinates.lat}
                  longitude={coordinates.lng}
                  title={ad.title}
                  address={`${ad.neighborhood ? ad.neighborhood + ', ' : ''}${ad.city}, ${ad.state}`}
                  height="300px"
                />
              ) : (
                <LocationFallback
                  city={ad.city}
                  state={ad.state}
                  neighborhood={ad.neighborhood}
                />
              )}
            </div>
          </div>

          {/* Sidebar - Contato */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Entre em Contato</h3>

              <div className="mb-6 pb-6 border-b border-gray-100">
                <span className="block text-sm text-gray-500 mb-1">Valor</span>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(ad.price, ad.price_type).split('/')[0]}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    /{formatPrice(ad.price, ad.price_type).split('/')[1]}
                  </span>
                </p>
              </div>

              <div className="space-y-3 mb-8 hidden lg:block">
                {hasActionableContact && (
                  <>
                    {displayWhatsapp && (
                      <button
                        onClick={openWhatsApp}
                        className="w-full bg-[#25D366] text-white py-4 px-4 rounded-xl hover:bg-[#20ba5a] transition-all flex items-center justify-center gap-3 font-bold shadow-lg shadow-green-100 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <MessageCircle className="w-6 h-6" />
                        Chamar no WhatsApp
                      </button>
                    )}

                    {displayPhone && (
                      <button
                        onClick={callPhone}
                        className="w-full bg-blue-600 text-white py-4 px-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 font-bold shadow-lg shadow-blue-100 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Phone className="w-6 h-6" />
                        Ligar Agora
                      </button>
                    )}
                  </>
                )}

                {!hasActionableContact && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                    Nenhum contato direto disponível
                  </div>
                )}
              </div>

              {/* Informações de Contato Explícitas */}
              {hasAnyContact && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 px-1 text-center">Contatos Diretos</p>
                  <div className="space-y-3">
                    {displayPhone && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          <span>Telefone</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{formatPhone(displayPhone)}</span>
                      </div>
                    )}
                    {displayWhatsapp && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MessageCircle className="w-4 h-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                          <span>WhatsApp</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{formatPhone(displayWhatsapp)}</span>
                      </div>
                    )}
                    {displayEmail && (
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-lg">📧</span>
                          <span className="ml-1">Email</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 truncate ml-2 max-w-[150px]" title={ad.contact_email}>{ad.contact_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Redes Sociais */}
              {(displayInstagram || displayFacebook) && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3 px-1 text-center">Redes Sociais</p>
                  <div className="grid grid-cols-1 gap-2">
                    {displayInstagram && (
                      <a
                        href={String(displayInstagram).startsWith('http')
                          ? displayInstagram
                          : `https://instagram.com/${String(displayInstagram).replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-100 text-pink-700 rounded-xl hover:from-pink-100 hover:to-purple-100 hover:border-pink-200 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Instagram className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight text-pink-900">Instagram</p>
                          <p className="text-[10px] text-pink-600 font-medium">@{String(displayInstagram).replace('@', '')}</p>
                        </div>
                      </a>
                    )}

                    {displayFacebook && (
                      <a
                        href={String(displayFacebook).startsWith('http')
                          ? displayFacebook
                          : `https://facebook.com/${displayFacebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-700 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-200 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Facebook className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-sm leading-tight text-blue-900">Facebook</p>
                          <p className="text-[10px] text-blue-600 font-medium">{String(displayFacebook).replace('facebook.com/', '').replace('https://', '').replace('http://', '').split('/')[0]}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-[10px] text-green-700 text-center font-medium leading-relaxed">
                  🔒 Contato direto, sem intermediação.<br />Negocie com segurança!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Avaliações */}
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <ReviewForm
                listingId={ad.id}
                onReviewSubmitted={() => setReviewsRefreshTrigger(prev => prev + 1)}
              />
            </div>
            <div>
              <ReviewsList
                listingId={ad.id}
                refreshTrigger={reviewsRefreshTrigger}
              />
            </div>
          </div>
        </div>

        {/* Modal de imagem */}
        {/* Modal de imagens */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col items-center justify-center p-4 md:p-8">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-white/20 transition-colors z-50 backdrop-blur-sm"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
              <img
                src={typeof images[modalImageIndex] === 'string' ? images[modalImageIndex] : (images[modalImageIndex] as ImageData)?.url || (images[modalImageIndex] as ImageData)?.image_url || '/placeholder-image.jpg'}
                alt={`Imagem ${modalImageIndex + 1}`}
                className="max-w-full max-h-full md:max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Navigation buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevModalImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8 md:w-12 md:h-12 drop-shadow-lg" />
                  </button>
                  <button
                    onClick={nextModalImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/75 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-8 h-8 md:w-12 md:h-12 drop-shadow-lg" />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-20 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border border-white/10">
                {modalImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails - Hidden on mobile, visible on desktop */}
            {images.length > 1 && (
              <div className="hidden md:block absolute bottom-4 left-4 right-4">
                <div className="flex justify-center gap-2 max-w-full overflow-x-auto py-2">
                  {images.map((image, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden cursor-pointer border-2 transition-all ${index === modalImageIndex
                        ? 'border-white ring-2 ring-primary-400'
                        : 'border-transparent hover:border-gray-300'
                        }`}
                      onClick={() => setModalImageIndex(index)}
                    >
                      <img
                        src={typeof image === 'string' ? image : (image as ImageData)?.url || (image as ImageData)?.image_url || '/placeholder-image.jpg'}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}


      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      {hasActionableContact && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[5000] bg-white border-t border-gray-100 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] box-border max-w-[100vw] overflow-x-hidden">
          <div className="w-full max-w-md mx-auto px-6 py-4 flex flex-col gap-2 box-border">
            {displayWhatsapp && (
              <button
                onClick={openWhatsApp}
                className="w-full bg-[#25D366] text-white font-bold h-11 rounded-xl shadow-sm hover:bg-[#20ba5a] active:scale-[0.95] transition-all flex items-center justify-center gap-2 text-sm box-border"
              >
                <MessageCircle className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">WhatsApp</span>
              </button>
            )}

            {displayPhone && (
              <button
                onClick={callPhone}
                className="w-full bg-blue-600 text-white font-bold h-11 rounded-xl shadow-sm hover:bg-blue-700 active:scale-[0.95] transition-all flex items-center justify-center gap-2 text-sm box-border"
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">Ligar</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}