import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAdsStore } from '@/stores/adsStore'
import ReviewForm from '@/components/reviews/ReviewForm'
import ReviewsList from '@/components/reviews/ReviewsList'
import FavoriteButton from '@/components/favorites/FavoriteButton'
import PremiumBadge from '@/components/ui/PremiumBadge'
import LocationMap, { LocationFallback } from '@/components/maps/LocationMap'
import { geocodingService } from '@/services/geocodingService'
import { useToast } from '@/contexts/ToastContext'
import { useEventTracking } from '@/hooks/useRealTimeMetrics'

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
  Speaker
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

export default function AdDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { ads, fetchAds } = useAdsStore()
  const toast = useToast()
  const { trackView, trackWhatsAppContact, trackPhoneContact } = useEventTracking(id)
  // const [currentImageIndex, setCurrentImageIndex] = useState(0) // Removido - não usado na galeria
  const [isLoading, setIsLoading] = useState(true)
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0)
  const viewTrackedRef = useRef(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false)

  const ad = ads.find(ad => ad.id === id)
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
    if (!ad) {
      fetchAds().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [ad, fetchAds])

  useEffect(() => {
    if (ad && id && !viewTrackedRef.current) {
      // Rastrear view apenas uma vez por sessão
      viewTrackedRef.current = true
      trackView()
    }
  }, [ad, id])

  // Geocode the ad location
  useEffect(() => {
    if (ad && !coordinates) {
      const geocodeLocation = async () => {
        setIsGeocodingLoading(true)
        try {
          const result = await geocodingService.geocodeCity(
            ad.city,
            ad.state,
            ad.neighborhood
          )
          if (result) {
            setCoordinates({ lat: result.latitude, lng: result.longitude })
          }
        } catch {
          // Erro silencioso para geocoding - não precisa mostrar toast pois não afeta a funcionalidade principal
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

  const formatPrice = (price: number, priceType: string) => {
    const formatted = price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
    return `${formatted}/${priceType === 'daily' ? 'dia' : priceType === 'hourly' ? 'hora' : 'evento'}`
  }

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
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
      toast.warning('WhatsApp não disponível', 'Este anúncio não possui um número de WhatsApp cadastrado.')
      return
    }

    // Track the contact before opening WhatsApp
    trackWhatsAppContact()
    toast.success('Redirecionando para WhatsApp...', 'Você será redirecionado para conversar com o anunciante.')

    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(`Olá! Tenho interesse no seu anúncio: ${ad.title}`)
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  const callPhone = () => {
    if (ad.contact_phone) {
      // Track the contact before making the call
      trackPhoneContact()
      toast.success('Ligando...', 'Você será redirecionado para ligar para o anunciante.')
      window.open(`tel:${ad.contact_phone}`, '_self')
    } else {
      toast.warning('Telefone não disponível', 'Este anúncio não possui um número de telefone cadastrado.')
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
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
                {/* Galeria em grid */}
                <div className="grid gap-4">
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
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{ad.title}</h1>
                    <PremiumBadge userPlanType={(ad as { user_plan_type?: string }).user_plan_type} size="md" />
                  </div>
                  <p className="text-lg text-green-600 font-semibold">{formatPrice(ad.price, ad.price_type)}</p>
                </div>
                {ad.featured && (
                  <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium">
                    ⭐ Destaque
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {ad.city}, {ad.state}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Publicado em {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {ad.views_count} visualizações
                </span>
              </div>

              {/* Informações específicas para espaços */}
              {/* Informações específicas para espaços */}
              {typeof specifications.capacity === 'number' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Capacidade</p>
                      <p className="text-sm text-gray-600">{String(specifications.capacity)} pessoas</p>
                    </div>
                  </div>
                  {typeof specifications.area_sqm === 'number' && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                      <Ruler className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Área</p>
                        <p className="text-sm text-gray-600">{String(specifications.area_sqm)} m²</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{ad.description}</p>
              </div>
            </div>

            {/* Comodidades e Recursos */}
            {(amenities.length > 0 || features.length > 0 || services.length > 0) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Comodidades e Recursos</h3>

                {amenities.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Comodidades Básicas</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {amenities.map((amenity) => {
                        const Icon = AMENITIES_ICONS[amenity as keyof typeof AMENITIES_ICONS] || Wifi
                        const label = AMENITIES_LABELS[amenity as keyof typeof AMENITIES_LABELS] || amenity
                        return (
                          <div key={String(amenity)} className="flex items-center gap-2 p-2 bg-primary-50 rounded-lg">
                            <Icon className="w-4 h-4 text-primary-600" />
                            <span className="text-sm font-medium text-gray-900">{String(label)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Recursos Especiais</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {features.map((feature) => {
                        const Icon = FEATURES_ICONS[feature as keyof typeof FEATURES_ICONS] || Music
                        const label = FEATURES_LABELS[feature as keyof typeof FEATURES_LABELS] || feature
                        return (
                          <div key={String(feature)} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <Icon className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-900">{String(label)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {services.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Serviços Inclusos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {services.map((service) => {
                        const Icon = SERVICES_ICONS[service as keyof typeof SERVICES_ICONS] || UserCheck
                        const label = SERVICES_LABELS[service as keyof typeof SERVICES_LABELS] || service
                        return (
                          <div key={String(service)} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <Icon className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900">{String(label)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

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

              <div className="space-y-3 mb-6">
                <button
                  onClick={openWhatsApp}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </button>

                <button
                  onClick={callPhone}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Ligar
                </button>
              </div>

              {/* Redes Sociais */}
              {(ad.contact_instagram || ad.contact_facebook) && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">🌐 Redes Sociais</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {ad.contact_instagram && (
                      <a
                        href={ad.contact_instagram.startsWith('@')
                          ? `https://instagram.com/${ad.contact_instagram.substring(1)}`
                          : ad.contact_instagram.startsWith('http')
                            ? ad.contact_instagram
                            : `https://instagram.com/${ad.contact_instagram}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 text-pink-700 rounded-lg hover:from-pink-100 hover:to-purple-100 hover:border-pink-300 transition-all duration-200 group"
                        onClick={() => { }}
                      >
                        <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                          <Instagram className="w-4 h-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="font-medium">Instagram</p>
                          <p className="text-xs text-pink-600">@{ad.contact_instagram.replace('@', '')}</p>
                        </div>
                      </a>
                    )}

                    {ad.contact_facebook && (
                      <a
                        href={ad.contact_facebook.startsWith('http')
                          ? ad.contact_facebook
                          : `https://facebook.com/${ad.contact_facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 group"
                        onClick={() => { }}
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <Facebook className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Facebook</p>
                          <p className="text-xs text-blue-600">{ad.contact_facebook.replace('facebook.com/', '').replace('https://', '').replace('http://', '')}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Phone className="w-4 h-4" />
                  <span>{formatPhone(ad.contact_phone || '')}</span>
                </div>
                {ad.contact_whatsapp && ad.contact_whatsapp !== ad.contact_phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>{formatPhone(ad.contact_whatsapp)}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Contato direto, sem intermediação. Negocie com segurança!
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
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" onClick={closeModal}>
            <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              {/* Botão fechar */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Imagem */}
              <div className="relative max-w-full max-h-full">
                <img
                  src={typeof images[modalImageIndex] === 'string'
                    ? images[modalImageIndex]
                    : (images[modalImageIndex] as ImageData)?.url || (images[modalImageIndex] as ImageData)?.image_url || '/placeholder-image.jpg'}
                  alt={`${ad.title} - Imagem ${modalImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />

                {/* Navegação do modal */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevModalImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                      onClick={nextModalImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronRight className="w-8 h-8" />
                    </button>
                  </>
                )}

                {/* Contador no modal */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  {modalImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Miniaturas no modal */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4">
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
          </div>
        )}
      </div>
    </div>
  )
}