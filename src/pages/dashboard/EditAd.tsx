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
  categoryType: z.enum(['equipment', 'space'], {
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
  category_id: z.number().min(1, 'Categoria é obrigatória'),

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

  price: z.any()
    .refine((val) => {
      if (typeof val === 'number') return val > 0
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.'))
        return num > 0
      }
      return false
    }, 'Preço deve ser maior que zero'),
  price_per_weekend: z.any().optional(),
  priceType: z.enum(['daily', 'hourly', 'event', 'weekend'], {
    required_error: 'Selecione o tipo de preço'
  }),

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
  const maxImages = 10

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
  }, [])

  // Generic handler to apply masks and preserve cursor
  const handleMaskedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    maskFn: (val: string) => string,
    fieldName: keyof EditAdData
  ) => {
    const input = e.target
    const start = input.selectionStart || 0
    const value = input.value

    const masked = maskFn(value)

    // Explicitly update DOM value since we're overriding onChange in an uncontrolled-like setup
    input.value = masked

    setValue(fieldName, masked, { shouldValidate: true })

    // Find new cursor position
    const unmaskedLengthBefore = value.slice(0, start).replace(/\D/g, '').length

    setTimeout(() => {
      let newPos = 0
      let tempDigits = 0
      for (let i = 0; i < masked.length; i++) {
        if (/\d/.test(masked[i])) {
          tempDigits++
        }
        if (tempDigits === unmaskedLengthBefore) {
          newPos = i + 1
          break
        }
      }
      if (unmaskedLengthBefore === 0) newPos = 0;
      input.setSelectionRange(newPos, newPos)
    }, 0)
  }


  useEffect(() => {
    if (id) {
      fetchAdById(id).then(() => {
        setIsLoading(false)
      })
    }
  }, [id, fetchAdById])

  useEffect(() => {
    if (currentAd && !isLoading) {
      reset({
        categoryType: 'space',
        title: currentAd.title,
        description: currentAd.description,
        category_id: currentAd.category_id,
        capacity: (currentAd.specifications?.capacity as number) || undefined,
        area_sqm: (currentAd.specifications?.area_sqm as number) || undefined,
        state: currentAd.state,
        city: currentAd.city,
        neighborhood: currentAd.neighborhood || '',
        address: currentAd.street || '',
        number: currentAd.number || '',
        complement: currentAd.complement || '',
        postal_code: currentAd.postal_code || '',
        reference_point: (currentAd.specifications?.reference_point as string) || '',
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
  }, [currentAd, isLoading, reset])



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
        contact_phone: processPhone(data.contactPhone),
        contact_whatsapp: processPhone(data.contactWhatsapp),
        contact_whatsapp_alternative: processPhone(data.contactWhatsappAlternative),
        contact_email: data.contactEmail?.trim() || undefined,
        contact_instagram: data.contactInstagram || undefined,
        contact_facebook: data.contactFacebook || undefined,
        featured: data.featured || false,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
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

            <FormSelect
              label="Categoria"
              options={SPACE_CATEGORIES.map(cat => ({
                value: cat.id.toString(),
                label: cat.name
              }))}
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
              placeholder="Ex: Salão de Festas para 200 pessoas"
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
                placeholder="Exemplo: Chácara Recanto das Flores: Espaço ideal para casamentos e aniversários com 500m². Possuímos piscina aquecida, área de churrasqueira completa, salão de festas coberto para 200 pessoas e estacionamento para 50 carros. Ambiente familiar e aconchegante, perfeito para celebrar momentos especiais..."
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
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Comodidades e Recursos
              </h2>
              <p className="text-gray-600">
                Selecione as comodidades e recursos disponíveis no seu espaço
              </p>
            </div>

            <AmenitiesSelector
              selectedAmenities={selectedAmenities}
              selectedFeatures={selectedFeatures}
              selectedServices={selectedServices}
              onAmenitiesChange={setSelectedAmenities}
              onFeaturesChange={setSelectedFeatures}
              onServicesChange={setSelectedServices}
              categoryType="space"
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
                    placeholder="0,00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register('price')}
                    onChange={(e) => handleMaskedChange(e, utilMaskMoney, 'price')}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Informe o valor (Ex: 600 ou 600,00)</p>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.price.message || '')}</p>
                )}
              </div>

              <FormSelect
                label="Período"
                options={[
                  { value: 'daily', label: 'Por dia' },
                  { value: 'weekend', label: 'Por final de semana' }
                ]}
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
              label="Telefone para Ligações"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.contactPhone}
              required
              hint="Será usado para contato direto dos interessados"
              {...register('contactPhone')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactPhone')}
            />

            <FormField
              label="WhatsApp Principal"
              type="tel"
              placeholder="(11) 99999-9999 (opcional)"
              error={errors.contactWhatsapp}
              hint="Número principal para mensagens WhatsApp"
              {...register('contactWhatsapp')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactWhatsapp')}
            />

            <FormField
              label="WhatsApp Alternativo"
              type="tel"
              placeholder="(11) 99999-9999 (opcional)"
              error={errors.contactWhatsappAlternative}
              hint="Número secundário para WhatsApp"
              {...register('contactWhatsappAlternative')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactWhatsappAlternative')}
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
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Revisão</h2>
              <p className="text-gray-600">Confirme as alterações antes de salvar</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Informações Básicas */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Informações do Anúncio</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Título</p>
                      <p className="text-lg text-gray-900 font-medium">{watch('title')}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Preço</p>
                      <p className="text-lg font-bold text-primary-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watch('price') || 0)}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          /{watch('priceType') === 'daily' ? 'dia' : 'final de semana'}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Capacidade</p>
                        <p className="text-sm text-gray-900 font-medium">{watch('capacity') ?? '--'} pessoas</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Área</p>
                        <p className="text-sm text-gray-900 font-medium">{watch('area_sqm') ?? '--'} m²</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Descrição</p>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {watch('description')}
                  </p>
                </div>
              </div>

              {/* Localização */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <span className="text-xl">📍</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Localização</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <p className="text-gray-700"><span className="font-bold">Endereço:</span> {watch('address')}</p>
                  <p className="text-gray-700"><span className="font-bold">Bairro:</span> {watch('neighborhood')}</p>
                  <p className="text-gray-700"><span className="font-bold">Cidade/Estado:</span> {watch('city')} / {watch('state')}</p>
                  <p className="text-gray-700"><span className="font-bold">CEP:</span> {watch('postal_code')}</p>
                </div>
              </div>

              {/* Comodidades e Imagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-6 h-6 text-yellow-500 fill-current" />
                    <h3 className="text-lg font-bold text-gray-900">Recursos</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[...selectedAmenities, ...selectedFeatures, ...selectedServices].slice(0, 10).map((item) => (
                      <span key={item} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        ✓ {translateItem(item)}
                      </span>
                    ))}
                    {[...selectedAmenities, ...selectedFeatures, ...selectedServices].length > 10 && (
                      <span className="text-xs text-gray-500 font-medium">
                        +{[...selectedAmenities, ...selectedFeatures, ...selectedServices].length - 10} mais
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl">📸</span>
                    <h3 className="text-lg font-bold text-gray-900">Fotos</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-bold">{(currentAd?.listing_images || []).filter(img => !removedExistingImageIds.includes(img.id)).length}</span> foto(s) já existente(s) mantida(s).
                    </p>
                    {images.length > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        + <span className="font-bold">{images.length}</span> nova(s) foto(s) adicionada(s).
                      </p>
                    )}
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900">Total no anúncio:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {((currentAd?.listing_images || []).filter(img => !removedExistingImageIds.includes(img.id)).length + images.length)} fotos
                      </span>
                    </div>
                  </div>
                  {((currentAd?.listing_images || []).filter(img => !removedExistingImageIds.includes(img.id)).length + images.length) === 0 && (
                    <p className="text-xs text-red-500 mt-2 font-medium">
                      ⚠️ Atenção: Seu anúncio ficará sem fotos.
                    </p>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">
                    📞
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Contato</h3>
                </div>
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Telefone</p>
                    <p className="text-sm text-gray-900">{watch('contactPhone')}</p>
                  </div>
                  {watch('contactEmail') && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">E-mail</p>
                      <p className="text-sm text-gray-900">{watch('contactEmail')}</p>
                    </div>
                  )}
                </div>
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