import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAdsStore } from '@/stores/adsStore'
import { useEventTracking } from '@/hooks/useRealTimeMetrics'
import { uploadAdImages, deleteSpecificAdImages } from '@/services/imageService'
import { useToast } from '@/contexts/ToastContext'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Building2,
  Users,
  Speaker,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { FormField, FormButton, FormSelect } from '@/components/forms'
import ImageUpload from '@/components/forms/ImageUpload'
import AmenitiesSelector from '@/components/forms/AmenitiesSelector'
import { getBrazilianStates } from '@/lib/api/search'
import Tooltip from '@/components/ui/Tooltip'

// Mapas de tradução das comodidades
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

// Função para traduzir comodidades/recursos/serviços
const translateItem = (item: string) => {
  return AMENITIES_LABELS[item as keyof typeof AMENITIES_LABELS] ||
    FEATURES_LABELS[item as keyof typeof FEATURES_LABELS] ||
    SERVICES_LABELS[item as keyof typeof SERVICES_LABELS] ||
    item // fallback para o ID original se não encontrar tradução
}

const editAdSchema = z.object({
  categoryType: z.enum(['space', 'service', 'equipment', 'advertiser'], {
    required_error: 'Selecione o tipo de anúncio'
  }),

  title: z.string()
    .min(1, 'Título é obrigatório')
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .min(50, 'Descrição deve ter pelo menos 50 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  category_id: z.number({ required_error: 'Selecione uma categoria' }).min(1, 'Selecione uma categoria'),

  capacity: z.number()
    .min(1, 'Capacidade deve ser maior que zero')
    .max(10000, 'Capacidade muito alta')
    .optional(),
  area_sqm: z.number()
    .min(1, 'Área deve ser maior que zero')
    .max(100000, 'Área muito grande')
    .optional(),

  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().optional(),
  address: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  postal_code: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 12345-678)')
    .optional(),
  reference_point: z.string().optional(),

  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),

  price: z.any().optional(),
  price_per_weekend: z.any().optional(),
  priceType: z.string().min(1, 'Selecione o tipo de preço'),

  contactPhone: z.string()
    .min(1, 'Telefone é obrigatório')
    .max(25, 'Telefone muito longo')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  contactWhatsapp: z.string()
    .max(25, 'WhatsApp muito longo')
    .optional(),
  contactWhatsappAlternative: z.string()
    .max(25, 'WhatsApp alternativo muito longo')
    .optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  contactInstagram: z.string()
    .max(50, 'Instagram muito longo')
    .optional(),
  contactFacebook: z.string()
    .max(100, 'Facebook muito longo')
    .optional(),

  featured: z.boolean().optional(),

  images: z.array(z.any()).optional()
}).superRefine((data, ctx) => {
  // Budget/Orcamento doesn't require price
  if (data.priceType !== 'orcamento' && data.priceType !== 'budget') {
    const val = data.price;
    let isValid = false;

    if (typeof val === 'number' && val > 0) isValid = true;
    else if (typeof val === 'string') {
      const num = parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.'));
      if (!isNaN(num) && num > 0) isValid = true;
    }

    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Preço deve ser maior que zero',
        path: ['price']
      });
    }
  }
})

type EditAdData = z.infer<typeof editAdSchema>

const STEPS = [
  { id: 1, title: 'Informações', description: 'Dados principais' },
  { id: 2, title: 'Localização', description: 'Onde está localizado' },
  { id: 3, title: 'Comodidades', description: 'Recursos disponíveis' },
  { id: 4, title: 'Preço', description: 'Valor e condições' },
  { id: 5, title: 'Imagens', description: 'Fotos do seu anúncio' },
  { id: 6, title: 'Contato', description: 'Como te encontrar' },
  { id: 7, title: 'Revisão', description: 'Confirmar alterações' }
]



const SPACE_CATEGORIES = [
  { id: 1, name: 'Salão de Festas' },
  { id: 2, name: 'Chácara' },
  { id: 3, name: 'Área de Lazer' },
  { id: 4, name: 'Buffet' },
  { id: 5, name: 'Decoração' },
  { id: 6, name: 'Fotografia' },
  { id: 7, name: 'Som e Iluminação' },
]
import { maskPhone as utilMaskPhone, maskMoneyFlexible as utilMaskMoney } from '@/utils/masks'
import { handleMaskedChange } from '@/utils/formUtils'
import { apiClient } from '@/lib/api-client'
import {
  PRICING_TYPES,
  CATEGORY_PRICING_CONFIG,
  DEFAULT_PRICING_OPTIONS,
  type PricingType
} from '@/constants/pricing'

const PLACEHOLDERS = {
  space: {
    title: 'Ex: Chácara Recanto Feliz - Piscina e Churrasqueira',
    description: 'Exemplo: Chácara Recanto das Flores: Espaço ideal para casamentos e aniversários com 500m². Possuímos piscina aquecida, área de churrasqueira completa, salão de festas coberto para 200 pessoas e estacionamento para 50 carros. Ambiente familiar e aconchegante, perfeito para celebrar momentos especiais...'
  },
  service: {
    title: 'Ex: Buffet Delícias da Vovó - Churrasco e Massas',
    description: 'Exemplo: Oferecemos serviço completo de buffet para casamentos e eventos corporativos. Equipe treinada, cardápio variado com opções vegetarianas e veganas. Inclusa louça, toalhas e garçons. Atendemos em toda a região com excelência e pontualidade...'
  },
  equipment: {
    title: 'Ex: Kit Som e Iluminação Festa Top',
    description: 'Exemplo: Aluguel de kit completo de som para festas de até 100 pessoas. Inclui 2 caixas ativas, mesa de som, microfone sem fio e iluminação básica (laser e strobo). Equipamentos profissionais das marcas JBL e Yamaha. Entrega e montagem inclusas...'
  },
  advertiser: { // Fallback
    title: 'Ex: Anúncio Exemplo',
    description: ' descreva seu anúncio...'
  }
}



interface Category {
  id: number
  name: string
  slug: string
  type: 'space' | 'service' | 'equipment'
  allowed_pricing_models?: { key: string; label: string }[]
}

const parseCurrency = (value: string | number) => {
  if (typeof value === 'number') return value
  if (!value) return 0
  return parseFloat(value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, ''))
}

export default function EditAd() {
  const { id } = useParams<{ id: string }>()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentAd, fetchAdById, updateAd } = useAdsStore()
  const toast = useToast()
  const {
    trackListingUpdated,
    trackPriceUpdated,
    trackPhotosUpdated,
    trackDescriptionUpdated,
    trackContactUpdated
  } = useEventTracking(id)
  const [brazilianStates, setBrazilianStates] = useState<Array<{ code: string, name: string, region: string }>>([])
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<Array<{ id: string, file: File, preview: string }>>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customAmenities, setCustomAmenities] = useState<string[]>([])
  const [customFeatures, setCustomFeatures] = useState<string[]>([])
  const [customServices, setCustomServices] = useState<string[]>([])
  const [removedExistingImageIds, setRemovedExistingImageIds] = useState<string[]>([])
  const maxImages = 8

  const [categories, setCategories] = useState<Category[]>([])
  const [pricingModels, setPricingModels] = useState<Array<{ id: string, key: string, label: string, unit: string | null, description: string | null }>>([])

  // Fetch categories with type inference logic (Same as CreateAd)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await apiClient.get<Category[]>('/api/categories')
      if (data) {
        const processedCategories = data.map((cat: any) => {
          // Use backend type if available, otherwise infer (fallback)
          let type: 'space' | 'service' | 'equipment' = (cat.type?.toLowerCase() as any) || 'space';

          // Legacy Inference Fallback if backend returns null/undefined properties
          if (!cat.type) {
            const lowerName = cat.name.toLowerCase();
            if (['buffet', 'fotografia', 'foto', 'video', 'filmagem', 'cerimonial', 'segurança', 'limpeza', 'bar', 'garçom', 'dj', 'banda', 'música', 'assessoria', 'recepcionista', 'animador'].some((t: string) => lowerName.includes(t))) {
              type = 'service';
            } else if (['som', 'iluminação', 'luz', 'tendas', 'mesas', 'cadeiras', 'brinquedo', 'gerador', 'palco', 'telão', 'projetor', 'cobertura'].some((t: string) => lowerName.includes(t))) {
              if (lowerName.includes('decoração')) type = 'service';
              else type = 'equipment';
            } else {
              type = 'space';
            }
          }

          return {
            ...cat,
            type
          } as Category
        })
        setCategories(processedCategories)
      }
    }
    fetchCategories()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    reset
  } = useForm<EditAdData>({
    resolver: zodResolver(editAdSchema),
    mode: 'onChange'
  })

  useEffect(() => {
    getBrazilianStates().then(setBrazilianStates)

    // Fetch pricing models
    apiClient.get('/api/pricing-models')
      .then(res => setPricingModels(res.data as any))
      .catch(err => console.error('Error fetching pricing models', err));
  }, [])




  useEffect(() => {
    if (id) {
      fetchAdById(id).then(() => {
        setIsLoading(false)
      })
    }
  }, [id, fetchAdById])

  useEffect(() => {
    if (currentAd && !isLoading && categories.length > 0) {
      // Find the correct category to get the exact type
      // We convert both to string to ensure a match regardless of type (number vs string)
      const matchedCategory = categories.find(c => String(c.id) === String(currentAd.category_id))
      const correctCategoryType = matchedCategory?.type || (currentAd.categories?.type?.toLowerCase() as any) || 'space'

      reset({
        categoryType: correctCategoryType,
        title: currentAd.title,
        description: currentAd.description,
        category_id: currentAd.category_id || undefined,
        capacity: (currentAd.specifications?.capacity as number) || undefined,
        area_sqm: (currentAd.specifications?.area_sqm as number) || undefined,
        state: currentAd.state,
        city: currentAd.city,
        neighborhood: currentAd.neighborhood || '',
        address: currentAd.street || '',
        number: currentAd.number || '',
        complement: currentAd.complement || '',
        postal_code: currentAd.postal_code || '',
        reference_point: (currentAd.specifications?.reference_point as string) || (currentAd.reference_point as string) || '',
        price: currentAd.price
          ? Math.floor(Number(currentAd.price)).toLocaleString('pt-BR')
          : '',
        price_per_weekend: currentAd.price_per_weekend
          ? Math.floor(Number(currentAd.price_per_weekend)).toLocaleString('pt-BR')
          : undefined,
        priceType: currentAd.price_type,
        contactPhone: utilMaskPhone((currentAd.contact_phone || '').replace(/^(\+?55|55)\s?/, '').replace(/^\+55/, '')),
        contactWhatsapp: utilMaskPhone((currentAd.contact_whatsapp || '').replace(/^(\+?55|55)\s?/, '').replace(/^\+55/, '')),
        contactWhatsappAlternative: utilMaskPhone((currentAd.contact_whatsapp_alternative || '').replace(/^(\+?55|55)\s?/, '').replace(/^\+55/, '')),
        contactEmail: currentAd.contact_email || '',
        contactInstagram: currentAd.contact_instagram || '',
        contactFacebook: currentAd.contact_facebook || '',
        featured: currentAd.featured
      })

      // Loading logic: Check specifications first, then fallback to comfort
      if (currentAd.specifications?.amenities && Array.isArray(currentAd.specifications.amenities)) {
        const standardAmenities = Object.keys(AMENITIES_LABELS)
        const selected = (currentAd.specifications.amenities as string[]).filter(item => standardAmenities.includes(item))
        const custom = (currentAd.specifications.amenities as string[]).filter(item => !standardAmenities.includes(item))
        setSelectedAmenities(selected)
        setCustomAmenities(custom)
      } else if (currentAd.comfort && Array.isArray(currentAd.comfort)) {
        const standardAmenities = Object.keys(AMENITIES_LABELS)
        const selected = currentAd.comfort.filter(item => standardAmenities.includes(item))
        // We only extract what matches known amenities. Custom items in 'comfort' might be features or services without labels? 
        // Or we check all lists.
        setSelectedAmenities(selected)
        // Note: We don't extract 'custom' here yet to avoid duplication if it belongs to features/services. 
        // We handle custom items after checking all lists? Or assume logic below handles it.
      }

      if (currentAd.specifications?.features && Array.isArray(currentAd.specifications.features)) {
        const standardFeatures = Object.keys(FEATURES_LABELS)
        const selected = (currentAd.specifications.features as string[]).filter(item => standardFeatures.includes(item))
        const custom = (currentAd.specifications.features as string[]).filter(item => !standardFeatures.includes(item))
        setSelectedFeatures(selected)
        setCustomFeatures(custom)
      } else if (currentAd.comfort && Array.isArray(currentAd.comfort)) {
        const standardFeatures = Object.keys(FEATURES_LABELS)
        const selected = currentAd.comfort.filter(item => standardFeatures.includes(item))
        setSelectedFeatures(selected)
      }

      if (currentAd.specifications?.services && Array.isArray(currentAd.specifications.services)) {
        const standardServices = Object.keys(SERVICES_LABELS)
        const selected = (currentAd.specifications.services as string[]).filter(item => standardServices.includes(item))
        const custom = (currentAd.specifications.services as string[]).filter(item => !standardServices.includes(item))
        setSelectedServices(selected)
        setCustomServices(custom)
      } else if (currentAd.comfort && Array.isArray(currentAd.comfort)) {
        const standardServices = Object.keys(SERVICES_LABELS)
        const selected = currentAd.comfort.filter(item => standardServices.includes(item))
        setSelectedServices(selected)

        // Now handle custom items from comfort (anything not in any label list)
        const allKnown = [
          ...Object.keys(AMENITIES_LABELS),
          ...Object.keys(FEATURES_LABELS),
          ...Object.keys(SERVICES_LABELS)
        ]
        const custom = currentAd.comfort.filter(item => !allKnown.includes(item))
        setCustomAmenities(custom) // Defaulting all unknown items to customAmenities (displayed as 'Outros' or similar)
      }
    }
  }, [currentAd, isLoading, categories, reset])



  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview)
      })
    }
  }, [images])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do anúncio...</p>
        </div>
      </div>
    )
  }

  if (!currentAd) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Anúncio não encontrado</h1>
          <p className="text-gray-600 mb-4">O anúncio que você está tentando editar não foi encontrado.</p>
          <Link
            to="/dashboard/meus-anuncios"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Voltar para Meus Anúncios
          </Link>
        </div>
      </div>
    )
  }

  if (currentAd.user_id !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso negado</h1>
          <p className="text-gray-600 mb-4">Você não tem permissão para editar este anúncio.</p>
          <Link
            to="/dashboard/meus-anuncios"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Voltar para Meus Anúncios
          </Link>
        </div>
      </div>
    )
  }



  const nextStep = async () => {
    let fieldsToValidate: (keyof EditAdData)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['title', 'description', 'category_id', 'capacity']
        break
      case 2:
        fieldsToValidate = ['state', 'city', 'address', 'number', 'neighborhood', 'postal_code']
        break
      case 3:
        break
      case 4:
        fieldsToValidate = ['price', 'priceType']
        break
      case 5:
        break
      case 6:
        fieldsToValidate = ['contactPhone']
        break
    }

    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid) {
      if (currentStep < 7) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      toast.error('Verifique os campos', 'Preencha todos os campos obrigatórios corretamente.')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: EditAdData) => {
    if (!id) return

    setIsSubmitting(true)
    setError(null)

    let loadingToastId: string | number | undefined

    try {
      // Combinar comodidades selecionadas com customizadas
      const allAmenities = [...selectedAmenities, ...customAmenities]
      const allFeatures = [...selectedFeatures, ...customFeatures]
      const allServices = [...selectedServices, ...customServices]


      const specifications = {
        ...(currentAd?.specifications || {}), // Mantém dados existentes incluindo amenities/features/services antigos se não forem sobrescritos
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.area_sqm && { area_sqm: data.area_sqm }),
        ...(data.address?.trim() && { address: data.address.trim() }),
        ...(data.reference_point?.trim() && { reference_point: data.reference_point.trim() }),
        ...(allAmenities.length > 0 && { amenities: allAmenities }),
        ...(allFeatures.length > 0 && { features: allFeatures }),
        ...(allServices.length > 0 && { services: allServices })
      }

      // Helper to ensure phone has +55
      const processPhone = (phone: string | undefined | null) => {
        if (!phone) return undefined
        const digits = phone.replace(/\D/g, '')
        if (!digits) return undefined
        // If it starts with 55 and has length > 12 (55 + 11 digits), usually it's already DDI+DDD+NUM
        // But user input is usually just DDD+NUM (10 or 11 digits).
        // If input is 11 digits (e.g. 11999999999), we add +55.
        // If input is 12 or 13, maybe it already has it.
        // Safer approach: if we stripped it in UI, let's prepend it if it's not there.
        return digits.startsWith('55') && digits.length > 11 ? `+${digits}` : `+55${digits}`
      }

      loadingToastId = toast.loading('Processando alterações...', 'Preparando o anúncio')

      let finalImages: string[] = []

      // 1. Filter out deleted existing images
      // We use currentAd.listing_images (fetched from backend) and filter out IDs that were marked for deletion
      const existingListingImages = currentAd?.listing_images || []
      const keptImageUrls = existingListingImages
        .filter((img: any) => !removedExistingImageIds.includes(img.id))
        .map((img: any) => img.image_url)

      finalImages = [...keptImageUrls]

      try {
        // 2. Upload new images if any
        if (images.length > 0) {
          toast.updateToast(String(loadingToastId), { title: 'Enviando novas imagens...', message: `Otimizando e enviando ${images.length} foto${images.length > 1 ? 's' : ''}` })

          // Prepare images with their optimized versions
          // The ImageUpload component attaches 'optimized' property to the image objects
          // We need to pass this to our new service
          const imagesToUpload = images.map((img: any, index) => ({
            id: img.id,
            optimized: img.optimized, // This comes from ImageUpload component
            display_order: index
          })).filter(img => img.optimized) // Ensure we have optimization data

          if (imagesToUpload.length !== images.length) {
            console.warn('Algumas imagens não tinham versão otimizada e foram ignoradas ou isso indica um erro de estado.')
            // Fallback for safety or retry? For now assuming ImageUpload always populates this before submit if we wait/check.
          }

          // Import dynamically to avoid circular deps if any, or just use the imported one
          const { uploadOptimizedAdImages } = await import('@/services/imageService')
          const uploadedImages = await uploadOptimizedAdImages(id, imagesToUpload)

          // The result from uploadOptimizedAdImages maps to { thumbnail_url, medium_url, large_url ... }
          // We want the 'large_url' (or medium) to be the main 'image_url' in our list
          const newUrls = uploadedImages.map(img => img.large_url || img.medium_url)
          finalImages = [...finalImages, ...newUrls]
        }

        // 3. Delete removed images from storage (optional but good practice)
        if (removedExistingImageIds.length > 0) {
          await deleteSpecificAdImages(removedExistingImageIds)
        }

      } catch (error: any) {
        toast.removeToast(String(loadingToastId))
        toast.error('Erro no upload', 'Falha ao processar imagens. Tente novamente.')
        console.error(error)
        return
      }

      const updateData = {
        category_id: data.category_id,
        // Ensure type is sent in the format expected by backend (UPPERCASE)
        type: watch('categoryType')?.toUpperCase(),
        title: data.title,
        description: data.description,
        capacity: data.capacity, // Send capacity at root level so backend updates the column correctly
        price: parseCurrency(data.price),
        // Send separate fields for clarity, though price_type helps backend decide
        price_per_day: data.priceType === 'daily' ? parseCurrency(data.price) : undefined,
        price_per_weekend: data.priceType === 'weekend' ? parseCurrency(data.price) : undefined,
        price_type: data.priceType,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood || undefined,
        street: data.address, // mapping address form field to street
        number: data.number,
        complement: data.complement || undefined,
        postal_code: data.postal_code || undefined,
        // Enviar reference_point no specifications e também no address (se o backend suportar)
        // ou garantir que esteja no specifications pois é lá que o EditAd busca
        reference_point: data.reference_point || undefined,
        contact_phone: processPhone(data.contactPhone),
        contact_whatsapp: processPhone(data.contactWhatsapp),
        contact_whatsapp_alternative: processPhone(data.contactWhatsappAlternative),
        contact_email: data.contactEmail?.trim() || undefined,
        contact_instagram: data.contactInstagram || undefined,
        contact_facebook: data.contactFacebook || undefined,
        featured: data.featured || false,
        specifications: {
          ...(Object.keys(specifications).length > 0 ? specifications : {}),
          reference_point: data.reference_point || undefined // Force save here too
        },
        comfort: [
          ...selectedAmenities,
          ...selectedFeatures,
          ...selectedServices,
          ...customAmenities,
          ...customFeatures,
          ...customServices
        ],
        images: finalImages // Include the complete list of images
      }

      toast.updateToast(String(loadingToastId), { title: 'Salvando anúncio...', message: 'Finalizando atualizações' })

      const result = await updateAd(id, updateData)

      if (result.error) {
        toast.removeToast(String(loadingToastId))
        toast.error('Erro ao atualizar anúncio', result.error)
        setError(result.error)
        return
      }



      // Tracking de eventos agora é feito pelo backend para garantir consistência

      toast.removeToast(String(loadingToastId))
      toast.success('Anúncio atualizado com sucesso!', 'Suas alterações foram salvas e já estão disponíveis.')
      navigate('/dashboard/meus-anuncios?updated=true')
    } catch (error) {
      if (loadingToastId) toast.removeToast(String(loadingToastId))
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao atualizar anúncio'
      toast.error('Erro ao atualizar anúncio', errorMessage)
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informações do Espaço
              </h2>
              <p className="text-gray-600">
                Descreva seu espaço de forma atrativa
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo do Anúncio
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    if (watch('categoryType') !== 'space') {
                      setValue('categoryType', 'space')
                      setValue('category_id', undefined as unknown as number)
                      setSelectedAmenities([])
                      setSelectedFeatures([])
                      setSelectedServices([])
                      setCustomAmenities([])
                      setCustomFeatures([])
                      setCustomServices([])
                    }
                  }}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${watch('categoryType') === 'space'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <Building2 className={`w-8 h-8 mb-2 ${watch('categoryType') === 'space' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-bold">Espaço</span>
                  <span className="text-xs mt-1 text-center opacity-80">Salão, Sítio, Chácara</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (watch('categoryType') !== 'service') {
                      setValue('categoryType', 'service')
                      setValue('category_id', undefined as unknown as number)
                      setSelectedAmenities([])
                      setSelectedFeatures([])
                      setSelectedServices([])
                      setCustomAmenities([])
                      setCustomFeatures([])
                      setCustomServices([])
                    }
                  }}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${watch('categoryType') === 'service'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <Users className={`w-8 h-8 mb-2 ${watch('categoryType') === 'service' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-bold">Serviço</span>
                  <span className="text-xs mt-1 text-center opacity-80">Buffet, DJ, Fotografia</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (watch('categoryType') !== 'equipment') {
                      setValue('categoryType', 'equipment')
                      setValue('category_id', undefined as unknown as number)
                      setSelectedAmenities([])
                      setSelectedFeatures([])
                      setSelectedServices([])
                      setCustomAmenities([])
                      setCustomFeatures([])
                      setCustomServices([])
                    }
                  }}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${watch('categoryType') === 'equipment'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                >
                  <Speaker className={`w-8 h-8 mb-2 ${watch('categoryType') === 'equipment' ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="font-bold">Equipamento</span>
                  <span className="text-xs mt-1 text-center opacity-80">Som, Iluminação, Tendas</span>
                </button>
              </div>
            </div>

            <FormSelect
              label="Categoria"
              options={categories
                .filter(cat => cat.type === watch('categoryType'))
                .map(cat => ({
                  value: cat.id.toString(),
                  label: cat.name
                }))
              }
              error={errors.category_id}
              required
              placeholder="Selecione a categoria"
              defaultValue=""
              {...register('category_id', {
                setValueAs: (value) => value ? parseInt(value) : undefined
              })}
            />

            <FormField
              label="Título do anúncio"
              type="text"
              placeholder={PLACEHOLDERS[(watch('categoryType') || 'space') as keyof typeof PLACEHOLDERS]?.title || 'Título do anúncio'}
              error={errors.title}
              required
              hint={`${watch('title')?.length || 0}/100 caracteres`}
              {...register('title')}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição detalhada <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder={PLACEHOLDERS[(watch('categoryType') || 'space') as keyof typeof PLACEHOLDERS]?.description || 'Descreva seu anúncio...'}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {watch('description')?.length || 0}/1000 caracteres
              </p>
            </div>

            {watch('categoryType') === 'space' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Capacidade de pessoas"
                  type="number"
                  placeholder="Ex: 100"
                  error={errors.capacity}
                  required
                  hint="Número máximo de pessoas que o espaço comporta"
                  {...register('capacity', {
                    setValueAs: (v) => v === "" ? undefined : parseFloat(v)
                  })}
                />

                <FormField
                  label="Área (m²)"
                  type="number"
                  placeholder="Ex: 200"
                  error={errors.area_sqm}
                  hint="Área total do espaço em metros quadrados (opcional)"
                  {...register('area_sqm', {
                    setValueAs: (v) => v === "" ? undefined : parseFloat(v)
                  })}
                />
              </div>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Localização
              </h2>
              <p className="text-gray-600">
                Onde está localizado seu espaço?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Estado"
                options={brazilianStates.map(state => ({
                  value: state.code,
                  label: state.name
                }))}
                error={errors.state}
                required
                placeholder="Selecione o estado"
                {...register('state')}
              />

              <FormField
                label="Cidade"
                type="text"
                placeholder="Nome da cidade"
                error={errors.city}
                required
                {...register('city')}
              />
            </div>

            <FormField
              label="Bairro"
              type="text"
              placeholder="Bairro (opcional)"
              error={errors.neighborhood}
              {...register('neighborhood')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="CEP"
                type="text"
                placeholder="12345-678"
                error={errors.postal_code}
                hint="CEP para facilitar a localização"
                {...register('postal_code')}
              />

              <FormField
                label="Ponto de referência"
                type="text"
                placeholder="Ex: Próximo ao Shopping Center"
                error={errors.reference_point}
                hint="Ponto conhecido na região"
                {...register('reference_point')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  label="Endereço (Rua/Avenida)"
                  type="text"
                  placeholder="Ex: Rua das Flores"
                  error={errors.address}
                  required
                  {...register('address')}
                />
              </div>

              <FormField
                label="Número"
                type="text"
                placeholder="Ex: 123"
                error={errors.number}
                required
                {...register('number')}
              />
            </div>

            <FormField
              label="Complemento"
              type="text"
              placeholder="Ex: Apto 101, Bloco B"
              error={errors.complement}
              hint="Opcional"
              {...register('complement')}
            />
          </div>
        )

      case 3:
        const currentType = watch('categoryType') || 'space';
        const getStep3Title = () => {
          const type = currentType;
          if (type === 'service') return 'Diferenciais';
          if (type === 'equipment') return 'Detalhes e Especificações';
          return 'Comodidades e Recursos';
        }

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getStep3Title()}
              </h2>
              <p className="text-gray-600">
                {(() => {
                  const type = currentType;
                  if (type === 'service') return 'O que está incluso';
                  if (type === 'equipment') return 'Especificações';
                  return 'Selecione as comodidades e recursos disponíveis no seu espaço';
                })()}
              </p>
            </div>

            <AmenitiesSelector
              selectedAmenities={selectedAmenities}
              selectedFeatures={selectedFeatures}
              selectedServices={selectedServices}
              onAmenitiesChange={setSelectedAmenities}
              onFeaturesChange={setSelectedFeatures}
              onServicesChange={setSelectedServices}
              categoryType={currentType}
              customAmenities={customAmenities}
              customFeatures={customFeatures}
              customServices={customServices}
              onCustomAmenitiesChange={setCustomAmenities}
              onCustomFeaturesChange={setCustomFeatures}
              onCustomServicesChange={setCustomServices}
            />
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Preço e Condições
              </h2>
              <p className="text-gray-600">
                Defina o valor do seu espaço
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">R$</span>
                  </div>
                  <input
                    type="text"
                    disabled={watch('priceType') === 'orcamento' || watch('priceType') === 'budget'}
                    placeholder={watch('priceType') === 'orcamento' || watch('priceType') === 'budget' ? 'A Combinar' : '0,00'}
                    className={`w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${watch('priceType') === 'orcamento' || watch('priceType') === 'budget' ? 'bg-gray-100 text-gray-500' : ''
                      }`}
                    {...register('price')}
                    onChange={(e) => handleMaskedChange(e, utilMaskMoney, 'price', setValue)}
                  />
                </div>
                {watch('priceType') && (
                  <p className="mt-1 text-xs text-gray-500">
                    {pricingModels.find(m => m.key === watch('priceType'))?.description || 'Informe o valor'}
                  </p>
                )}
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.price.message || '')}</p>
                )}
              </div>

              <FormSelect
                label="Período"
                options={(() => {
                  // Try to find category in fetched categories first
                  const selectedCat = categories.find(c => c.id === Number(watch('category_id')))

                  let options = [];

                  if (selectedCat && selectedCat.allowed_pricing_models && selectedCat.allowed_pricing_models.length > 0) {
                    options = selectedCat.allowed_pricing_models.map((m: any) => ({
                      value: m.key,
                      label: m.label
                    }))
                    // If we found options and the current value is valid, or even if not, return these options.
                    // But if this list is empty, we fall through.
                    if (options.length > 0) return options;
                  }

                  // Fallback: use category type if available
                  const currentCategoryType = (watch('categoryType') || 'space') as string
                  const allowedTypes = CATEGORY_PRICING_CONFIG[currentCategoryType.toLowerCase()] || DEFAULT_PRICING_OPTIONS

                  options = pricingModels
                    .filter(m => allowedTypes.includes(m.key as PricingType))
                    .map(m => ({ value: m.key, label: m.label }))

                  // Final fallback: if everything fails, return all pricing models to avoid empty dropdown
                  if (options.length === 0) {
                    return pricingModels.map(m => ({ value: m.key, label: m.label }))
                  }

                  return options;
                })()}
                error={errors.priceType}
                required
                placeholder="Selecione o período"
                {...register('priceType')}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dicas de precificação</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Pesquise preços similares na região</li>
                <li>• Considere custos de limpeza e manutenção</li>
                <li>• Ofereça desconto para períodos festivos ou dias de semana</li>
                <li>• Preços competitivos geram mais contatos</li>
              </ul>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Imagens do Espaço
              </h2>
              <p className="text-gray-600">
                Adicione ou altere fotos para aumentar as chances de contato
              </p>
            </div>

            <ImageUpload
              key="image-upload"
              images={images}
              onImagesChange={setImages}
              maxImages={maxImages}
              disabled={isSubmitting}
              existingImages={currentAd.listing_images}
              onRemovedExistingImagesChange={setRemovedExistingImageIds}
            />
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informações de Contato
              </h2>
              <p className="text-gray-600">
                Como os interessados podem entrar em contato com você?
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Informações de Contato Público</p>
                  <p>
                    Estes são os dados que os interessados usarão para entrar em contato com você.
                    Eles serão exibidos publicamente no seu anúncio e <strong>não precisam ser iguais</strong> aos dados da sua conta pessoal.
                  </p>
                </div>
              </div>
            </div>

            <FormField
              label="Telefone com DDD"
              type="tel"
              placeholder="(00) 00000-0000"
              error={errors.contactPhone}
              required
              hint="Será usado para contato direto dos interessados"
              {...register('contactPhone')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactPhone', setValue)}
            />

            <FormField
              label="WhatsApp Principal"
              type="tel"
              placeholder="(11) 99999-9999 (opcional)"
              error={errors.contactWhatsapp}
              hint="Número principal para mensagens WhatsApp"
              {...register('contactWhatsapp')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactWhatsapp', setValue)}
            />

            <FormField
              label="WhatsApp Alternativo"
              type="tel"
              placeholder="(11) 99999-9999 (opcional)"
              error={errors.contactWhatsappAlternative}
              hint="Número secundário para WhatsApp"
              {...register('contactWhatsappAlternative')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactWhatsappAlternative', setValue)}
            />

            <FormField
              label="Email de contato"
              type="email"
              placeholder="seu@email.com (opcional)"
              error={errors.contactEmail}
              hint="Email alternativo para contato"
              {...register('contactEmail')}
            />
            <FormField
              label="Instagram"
              type="text"
              placeholder="@seuinstagram ou instagram.com/seuusuario (opcional)"
              error={errors.contactInstagram}
              hint="Seu perfil no Instagram para mais visibilidade"
              {...register('contactInstagram')}
            />
            <FormField
              label="Facebook"
              type="text"
              placeholder="facebook.com/seuperfil (opcional)"
              error={errors.contactFacebook}
              hint="Sua página no Facebook para mais informações"
              {...register('contactFacebook')}
            />

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">🔒 Contato 100% transparente</h4>
              <p className="text-sm text-green-700">
                No EventSpace, o contato é sempre direto entre você e o interessado.
                Não cobramos comissões e não intermediamos a negociação.
              </p>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            {/* Sumário de Erros para Debug (Opcional, mas útil se houver problema) */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4 text-red-800 font-bold">
                  <AlertCircle className="w-5 h-5" />
                  <h4>Existem erros no formulário:</h4>
                </div>
                <ul className="space-y-1 text-sm text-red-700 list-disc list-inside">
                  {Object.entries(errors).map(([key, error]: [string, any]) => (
                    <li key={key}>
                      <span className="font-semibold">{key}:</span> {String(error?.message || 'Erro de validação')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisão</h2>
              <p className="text-gray-600">Confirme as alterações antes de salvar</p>
            </div>

            {/* Imagens */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📸</span>
                <h3 className="text-lg font-semibold text-gray-900">
                  Imagens ({(currentAd?.listing_images || []).filter(img => !removedExistingImageIds.includes(img.id)).length + images.length})
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Show existing images */}
                {(currentAd?.listing_images || []).filter(img => !removedExistingImageIds.includes(img.id)).map((img, index) => (
                  <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-green-500">
                    <img src={img.image_url} alt="Existente" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded">Mantida</span>
                  </div>
                ))}
                {/* Show new images */}
                {images.map((img, index) => (
                  <div key={img.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-500">
                    <img src={img.preview} alt="Nova" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-[10px] px-1 rounded">Nova</span>
                  </div>
                ))}
              </div>
              {((currentAd?.listing_images || []).filter(img => !removedExistingImageIds.includes(img.id)).length + images.length) === 0 && (
                <p className="text-xs text-red-500 mt-2 font-medium">⚠️ Atenção: O anúncio ficará sem fotos.</p>
              )}
            </div>

            {/* Informações Básicas */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📋</span>
                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full min-w-0">
                    <h4 className="text-2xl font-bold text-gray-900 mb-1 break-words">{watch('title')}</h4>
                    <p className="text-sm text-gray-600">
                      {categories.find(c => String(c.id) === String(watch('category_id')))?.name || 'Categoria não detectada'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right w-full sm:w-auto">
                    <p className="text-3xl font-bold text-green-600">
                      {watch('priceType') === 'orcamento' || watch('priceType') === 'budget' ? 'Consultar' :
                        (typeof watch('price') === 'number'
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watch('price'))
                          : (watch('price') || 'R$ 0,00')
                        )
                      }
                    </p>
                    {watch('priceType') && pricingModels.find(m => m.key === watch('priceType'))?.unit && (
                      <p className="text-sm text-gray-500">
                        por {pricingModels.find(m => m.key === watch('priceType'))?.unit}
                      </p>
                    )}
                    {watch('priceType') && !pricingModels.find(m => m.key === watch('priceType'))?.unit && (
                      <p className="text-sm text-gray-500">
                        {pricingModels.find(m => m.key === watch('priceType'))?.label || ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Descrição:</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-all">
                    {watch('description')}
                  </p>
                </div>

                {watch('categoryType') === 'space' && (
                  <div className="border-t pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Capacidade</p>
                      <p className="text-sm text-gray-900">{watch('capacity') ?? '--'} pessoas</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Área</p>
                      <p className="text-sm text-gray-900">{watch('area_sqm') ?? '--'} m²</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Localização */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📍</span>
                <h3 className="text-lg font-semibold text-gray-900">Localização</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Endereço:</span> {watch('address')}, {watch('number')}
                  {watch('complement') && ` - ${watch('complement')}`}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Bairro:</span> {watch('neighborhood') || 'Não informado'}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Cidade/Estado:</span> {watch('city')}, {watch('state')}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">CEP:</span> {watch('postal_code') || 'Não informado'}
                </p>
              </div>
            </div>

            {/* Comodidades */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-semibold text-gray-900">Recursos e Comodidades</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...selectedAmenities, ...selectedFeatures, ...selectedServices].map((item) => (
                  <span key={item} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ✓ {translateItem(item)}
                  </span>
                ))}
                {[...selectedAmenities, ...selectedFeatures, ...selectedServices].length === 0 && (
                  <span className="text-sm text-gray-500 italic">Nenhum recurso selecionado</span>
                )}
              </div>
            </div>

            {/* Contato */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">�</span>
                <h3 className="text-lg font-semibold text-gray-900">Informações de Contato</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Telefone Principal</p>
                  <p className="text-sm text-gray-900">{watch('contactPhone')}</p>
                </div>
                {watch('contactWhatsapp') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">WhatsApp</p>
                    <p className="text-sm text-gray-900">{watch('contactWhatsapp')}</p>
                  </div>
                )}
                {watch('contactEmail') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">E-mail</p>
                    <p className="text-sm text-gray-900">{watch('contactEmail')}</p>
                  </div>
                )}
                {watch('contactInstagram') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Instagram</p>
                    <p className="text-sm text-gray-900">{watch('contactInstagram')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Banner Final */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-xl transform transition-all hover:scale-[1.01]">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-2">Tudo pronto!</h4>
                  <p className="text-green-50 text-lg leading-relaxed">
                    Suas alterações serão aplicadas instantaneamente e o anúncio continuará visível para todos os usuários.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando dados do anúncio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Tooltip content="Voltar para Meus Anúncios">
              <Link
                to="/dashboard/meus-anuncios"
                className="group p-2 hover:bg-primary-50 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
              </Link>
            </Tooltip>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Anúncio</h1>
              <p className="text-sm text-gray-600 mt-1">Atualize as informações do seu anúncio</p>
            </div>
          </div>
        </div>

        {/* Modern Stepper */}
        <div className="mb-10">
          {/* Desktop Stepper */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Progress Line Background */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full" style={{ marginLeft: '2rem', marginRight: '2rem' }}>
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {STEPS.map((step, index) => {
                  const isCompleted = currentStep > step.id
                  const isCurrent = currentStep === step.id
                  const isPending = currentStep < step.id

                  return (
                    <div
                      key={step.id}
                      className="flex flex-col items-center cursor-pointer group"
                      style={{ flex: 1 }}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      {/* Circle */}
                      <div className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                        transition-all duration-300 shadow-lg group-hover:scale-110
                        ${isCompleted
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white scale-100'
                          : isCurrent
                            ? 'bg-white border-4 border-primary-500 text-primary-600 scale-110 shadow-xl'
                            : 'bg-white border-2 border-gray-300 text-gray-400 scale-90 group-hover:border-primary-300'
                        }
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <span className="text-base font-bold">{step.id}</span>
                        )}
                      </div>

                      {/* Step Info */}
                      <div className="text-center mt-3 max-w-[120px]">
                        <p className={`
                          text-sm font-semibold mb-0.5 transition-colors
                          ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}
                        `}>
                          {step.title}
                        </p>
                        <p className={`
                          text-xs leading-tight transition-colors
                          ${isCurrent ? 'text-gray-700' : 'text-gray-500'}
                        `}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile Stepper */}
          <div className="md:hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-bold shadow-lg">
                    {currentStep}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary-600">Etapa {currentStep} de {STEPS.length}</p>
                    <p className="text-xs text-gray-600">{STEPS[currentStep - 1]?.title}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Progress Bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
                />
              </div>

              <p className="text-xs text-gray-500 mt-2 text-center">
                {STEPS[currentStep - 1]?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 md:p-10 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex flex-col-reverse md:flex-row justify-between items-stretch md:items-center gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center justify-center gap-2 px-6 py-4 md:py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
          >
            <ArrowLeft className="w-5 h-5" />
            Anterior
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center justify-center gap-2 px-8 py-4 md:py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform active:scale-95 md:hover:scale-105"
            >
              Próximo
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <FormButton
              type="button"
              onClick={handleSubmit(onSubmit, (errors) => console.error('VALIDATION ERRORS:', errors))}
              loading={isSubmitting}
              size="lg"
              className="px-10 py-4 md:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transform active:scale-95 md:hover:scale-105 transition-all w-full md:w-auto flex justify-center"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </FormButton>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao editar anúncio
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}