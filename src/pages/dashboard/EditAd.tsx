import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useAdsStore } from '@/stores/adsStore'
import { useEventTracking } from '@/hooks/useRealTimeMetrics'
import { uploadAdImages, saveImageRecords, deleteSpecificAdImages } from '@/services/imageService'
import { useToast } from '@/contexts/ToastContext'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Building2,
  Wrench,
  DollarSign,
  Star,
  Loader2
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
  address: z.string().optional(),
  postal_code: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 12345-678)')
    .optional(),
  reference_point: z.string().optional(),

  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),

  price: z.number()
    .min(1, 'Preço deve ser maior que zero')
    .max(100000, 'Preço deve ser menor que R$ 100.000'),
  priceType: z.enum(['daily', 'hourly', 'event'], {
    required_error: 'Selecione o tipo de preço'
  }),

  contactPhone: z.string()
    .min(1, 'Telefone é obrigatório')
    .max(25, 'Telefone muito longo')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  contactWhatsapp: z.string()
    .max(25, 'WhatsApp muito longo')
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

const EQUIPMENT_CATEGORIES = [
  { name: 'Som e Áudio', id: 1 },
  { name: 'Iluminação', id: 2 },
  { name: 'Decoração', id: 3 },
  { name: 'Mesa e Cadeira', id: 4 },
  { name: 'Buffet e Catering', id: 5 },
  { name: 'Fotografia e Filmagem', id: 6 },
  { name: 'Entretenimento', id: 7 },
  { name: 'Tendas e Coberturas', id: 8 },
  { name: 'Limpeza', id: 9 },
  { name: 'Segurança', id: 10 }
]

const SPACE_CATEGORIES = [
  { name: 'Salão de Festas', id: 11 },
  { name: 'Espaço ao Ar Livre', id: 12 },
  { name: 'Casa de Eventos', id: 13 },
  { name: 'Chácara', id: 14 },
  { name: 'Clube', id: 15 },
  { name: 'Hotel e Pousada', id: 16 },
  { name: 'Restaurante', id: 17 },
  { name: 'Praia', id: 18 },
  { name: 'Fazenda', id: 19 },
  { name: 'Coworking', id: 20 }
]

export default function EditAd() {
  const { id } = useParams<{ id: string }>()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { user, profile } = useAuth()
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
  const maxImages = 15

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

  const watchedCategoryType = watch('categoryType')
  const allValues = watch()

  useEffect(() => {
    getBrazilianStates().then(setBrazilianStates)
  }, [])

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
        address: (currentAd.specifications?.address as string) || '',
        postal_code: currentAd.postal_code || '',
        reference_point: (currentAd.specifications?.reference_point as string) || '',
        price: currentAd.price,
        priceType: currentAd.price_type,
        contactPhone: currentAd.contact_phone || '',
        contactWhatsapp: currentAd.contact_whatsapp || '',
        contactEmail: currentAd.contact_email || '',
        contactInstagram: currentAd.contact_instagram || '',
        contactFacebook: currentAd.contact_facebook || '',
        featured: currentAd.featured
      })

      // Como as comodidades agora são salvas todas juntas no array 'amenities',
      // precisamos separar as padrões das customizadas na hora de carregar
      if (currentAd.specifications?.amenities && Array.isArray(currentAd.specifications.amenities)) {
        const standardAmenities = ['wifi', 'parking', 'kitchen', 'bathrooms', 'air_conditioning', 'ventilation', 'tv', 'furniture', 'coffee_area', 'microwave', 'refrigerator', 'washing_machine', 'sound_basic', 'phone', 'location_access']
        const selected = (currentAd.specifications.amenities as string[]).filter(item => standardAmenities.includes(item))
        const custom = (currentAd.specifications.amenities as string[]).filter(item => !standardAmenities.includes(item))
        setSelectedAmenities(selected)
        setCustomAmenities(custom)
      }
      if (currentAd.specifications?.features && Array.isArray(currentAd.specifications.features)) {
        const standardFeatures = ['pool', 'bbq', 'garden', 'soccer_field', 'game_room', 'gym', 'sound_system', 'lighting', 'decoration', 'professional_sound', 'lighting_system', 'decoration_items', 'recording_equipment']
        const selected = (currentAd.specifications.features as string[]).filter(item => standardFeatures.includes(item))
        const custom = (currentAd.specifications.features as string[]).filter(item => !standardFeatures.includes(item))
        setSelectedFeatures(selected)
        setCustomFeatures(custom)
      }
      if (currentAd.specifications?.services && Array.isArray(currentAd.specifications.services)) {
        const standardServices = ['cleaning', 'security', 'waitstaff', 'catering', 'setup']
        const selected = (currentAd.specifications.services as string[]).filter(item => standardServices.includes(item))
        const custom = (currentAd.specifications.services as string[]).filter(item => !standardServices.includes(item))
        setSelectedServices(selected)
        setCustomServices(custom)
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    const limitedNumbers = numbers.slice(0, 11)

    if (limitedNumbers.length <= 10) {
      return limitedNumbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else {
      return limitedNumbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof EditAdData)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['title', 'description', 'category_id', 'capacity']
        break
      case 2:
        fieldsToValidate = ['state', 'city']
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
    if (isStepValid && currentStep < 7) {
      setCurrentStep(currentStep + 1)
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
        ...(data.capacity && { capacity: data.capacity }),
        ...(data.area_sqm && { area_sqm: data.area_sqm }),
        ...(data.address?.trim() && { address: data.address.trim() }),
        ...(data.reference_point?.trim() && { reference_point: data.reference_point.trim() }),
        ...(allAmenities.length > 0 && { amenities: allAmenities }),
        ...(allFeatures.length > 0 && { features: allFeatures }),
        ...(allServices.length > 0 && { services: allServices })
      }

      const updateData = {
        category_id: data.category_id,
        title: data.title,
        description: data.description,
        price: data.price,
        price_type: data.priceType,
        state: data.state,
        city: data.city,
        neighborhood: data.neighborhood || undefined,
        postal_code: data.postal_code || undefined,
        contact_phone: data.contactPhone,
        contact_whatsapp: data.contactWhatsapp || undefined,
        contact_email: data.contactEmail?.trim() || undefined,
        contact_instagram: data.contactInstagram || undefined,
        contact_facebook: data.contactFacebook || undefined,
        featured: data.featured || false,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined
      }

      loadingToastId = toast.loading('Atualizando anúncio...', 'Salvando suas alterações')

      const result = await updateAd(id, updateData)

      if (result.error) {
        toast.removeToast(String(loadingToastId))
        toast.error('Erro ao atualizar anúncio', result.error)
        setError(result.error)
        return
      }

      // Handle image changes
      try {
        // Delete removed existing images
        if (removedExistingImageIds.length > 0) {
          toast.updateToast(String(loadingToastId), { title: 'Atualizando imagens...', message: 'Processando alterações de imagens' })
          await deleteSpecificAdImages(removedExistingImageIds)
        }

        // Upload new images if any
        if (images.length > 0) {
          toast.updateToast(String(loadingToastId), { title: 'Enviando novas imagens...', message: `Carregando ${images.length} nova${images.length > 1 ? 's' : ''} imagem${images.length > 1 ? 's' : ''}` })
          const uploadedImages = await uploadAdImages(id, images)
          await saveImageRecords(id, uploadedImages)
        }
      } catch {
        toast.removeToast(String(loadingToastId))
        toast.warning('Anúncio atualizado com limitações', 'Anúncio atualizado com sucesso, mas houve erro no processamento das imagens.')
        setError('Anúncio atualizado com sucesso, mas houve erro no processamento das imagens.')
        setTimeout(() => navigate('/dashboard/meus-anuncios'), 3000)
        return
      }

      // Rastrear eventos de atualização
      try {
        const changedFields: string[] = []

        // Detectar mudanças nos campos principais
        if (currentAd?.title !== data.title) changedFields.push('título')
        if (currentAd?.description !== data.description) {
          changedFields.push('descrição')
          await trackDescriptionUpdated()
        }
        if (currentAd?.price !== data.price) {
          changedFields.push('preço')
          await trackPriceUpdated(Number(currentAd?.price || 0), Number(data.price))
        }

        // Detectar mudanças nos contatos
        const contactChanged = (
          currentAd?.contact_whatsapp !== data.contactWhatsapp ||
          currentAd?.contact_phone !== data.contactPhone ||
          currentAd?.contact_email !== data.contactEmail ||
          currentAd?.contact_instagram !== data.contactInstagram ||
          currentAd?.contact_facebook !== data.contactFacebook
        )

        if (contactChanged) {
          changedFields.push('contatos')
          const updatedContactFields = []
          if (currentAd?.contact_whatsapp !== data.contactWhatsapp) updatedContactFields.push('WhatsApp')
          if (currentAd?.contact_phone !== data.contactPhone) updatedContactFields.push('Telefone')
          if (currentAd?.contact_email !== data.contactEmail) updatedContactFields.push('E-mail')
          if (currentAd?.contact_instagram !== data.contactInstagram) updatedContactFields.push('Instagram')
          if (currentAd?.contact_facebook !== data.contactFacebook) updatedContactFields.push('Facebook')
          await trackContactUpdated(updatedContactFields)
        }

        // Detectar mudanças nas imagens
        const imagesChanged = images.length > 0 || removedExistingImageIds.length > 0
        if (imagesChanged) {
          changedFields.push('fotos')
          let photoAction: 'added' | 'removed' | 'updated' = 'updated'
          if (images.length > 0 && removedExistingImageIds.length === 0) photoAction = 'added'
          else if (images.length === 0 && removedExistingImageIds.length > 0) photoAction = 'removed'

          await trackPhotosUpdated(photoAction, images.length)
        }

        // Rastrear atualização geral
        if (changedFields.length > 0) {
          await trackListingUpdated(changedFields, {
            totalChanges: changedFields.length,
            timestamp: new Date().toISOString()
          })
        }
      } catch (trackingError) {
        console.error('Erro ao rastrear eventos de atualização:', trackingError)
      }

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
                placeholder="Descreva a capacidade, infraestrutura, comodidades disponíveis..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                {...register('capacity', { valueAsNumber: true })}
              />

              <FormField
                label="Área (m²)"
                type="number"
                placeholder="Ex: 200"
                error={errors.area_sqm}
                hint="Área total do espaço em metros quadrados (opcional)"
                {...register('area_sqm', { valueAsNumber: true })}
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

            <FormField
              label="Endereço completo"
              type="text"
              placeholder="Rua, número, complemento (opcional)"
              error={errors.address}
              hint="Será exibido apenas após o interessado entrar em contato"
              {...register('address')}
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
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0,00"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register('price', { valueAsNumber: true })}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              <FormSelect
                label="Período"
                options={[
                  { value: 'daily', label: 'Por dia' },
                  { value: 'hourly', label: 'Por hora' },
                  { value: 'event', label: 'Por evento' }
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

            <FormField
              label="Telefone/WhatsApp"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.contactPhone}
              required
              hint="Será usado para contato direto dos interessados"
              {...register('contactPhone', {
                onChange: (e) => {
                  e.target.value = formatPhone(e.target.value)
                }
              })}
            />

            <FormField
              label="WhatsApp alternativo"
              type="tel"
              placeholder="(11) 99999-9999 (opcional)"
              error={errors.contactWhatsapp}
              hint="Caso tenha um número diferente para WhatsApp"
              {...register('contactWhatsapp', {
                onChange: (e) => {
                  e.target.value = formatPhone(e.target.value)
                }
              })}
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
                        <p className="text-sm text-gray-900 font-medium">{watch('capacity') || '--'} pessoas</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Área</p>
                        <p className="text-sm text-gray-900 font-medium">{watch('area_sqm') || '--'} m²</p>
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
                  <p className="text-sm text-gray-700">
                    {images.length > 0
                      ? `Você adicionou ${images.length} novas fotos.`
                      : 'Nenhuma foto nova adicionada.'
                    }
                  </p>
                  {(currentAd?.listing_images?.length || 0) > 0 && (
                    <p className="text-xs text-gray-500 mt-2 italic">
                      As imagens existentes serão mantidas (exceto as removidas).
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
                    <div key={step.id} className="flex flex-col items-center" style={{ flex: 1 }}>
                      {/* Circle */}
                      <div className={`
                        relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm
                        transition-all duration-300 shadow-lg
                        ${isCompleted
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white scale-100'
                          : isCurrent
                            ? 'bg-white border-4 border-primary-500 text-primary-600 scale-110 shadow-xl'
                            : 'bg-white border-2 border-gray-300 text-gray-400 scale-90'
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
        <div className="flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
          >
            <ArrowLeft className="w-5 h-5" />
            Anterior
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Próximo
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <FormButton
              type="button"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
              className="px-10 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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