import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useUpgradeModal } from '@/hooks/useUpgradeModal'
import UpgradeModal from '@/components/modals/UpgradeModal'
import { useAdsStore } from '@/stores/adsStore'
import { uploadAdImages, saveImageRecords } from '@/services/imageService'
import { useToast } from '@/contexts/ToastContext'
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  Users,
  DollarSign,
  Star,
  Crown
} from 'lucide-react'
import { FormField, FormButton, FormSelect } from '@/components/forms'
import ImageUpload from '@/components/forms/ImageUpload'
import AmenitiesSelector from '@/components/forms/AmenitiesSelector'
import { getBrazilianStates } from '@/lib/api/search'
import { getMaxImagesForPlan } from '@/lib/planLimits'
import Tooltip from '@/components/ui/Tooltip'

// Import supabase for fetching categories
import { supabase } from '@/lib/supabase'

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

// Schema de validação
const createListingSchema = z.object({
  // Step 1: Tipo
  categoryType: z.enum(['space', 'advertiser'], {
    required_error: 'Selecione o tipo de anúncio'
  }),
  
  // Step 2: Informações básicas
  title: z.string()
    .min(1, 'Título é obrigatório')
    .min(10, 'Título deve ter pelo menos 10 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .min(50, 'Descrição deve ter pelo menos 50 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  category_id: z.number().min(1, 'Categoria é obrigatória'),
  
  // Campos específicos para espaços
  capacity: z.number()
    .min(1, 'Capacidade deve ser maior que zero')
    .max(10000, 'Capacidade muito alta')
    .optional(),
  area_sqm: z.number()
    .min(1, 'Área deve ser maior que zero')
    .max(100000, 'Área muito grande')
    .optional(),
  
  // Step 3: Localização
  state: z.string().min(1, 'Estado é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  neighborhood: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 12345-678)')
    .optional(),
  reference_point: z.string().optional(),
  
  // Step 4: Comodidades e Recursos
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),
  
  // Step 5: Preço
  price: z.number()
    .min(1, 'Preço deve ser maior que zero')
    .max(100000, 'Preço deve ser menor que R$ 100.000'),
  priceType: z.enum(['daily', 'hourly', 'event'], {
    required_error: 'Selecione o tipo de preço'
  }),
  
  // Step 6: Contato
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
  
  // Featured (apenas para planos premium/pro)
  featured: z.boolean().optional(),
  
  // Images (será tratado separadamente no estado)
  images: z.array(z.any()).optional()
})

type CreateListingData = z.infer<typeof createListingSchema>

const STEPS = [
  { id: 1, title: 'Tipo', description: 'Escolha o tipo de anúncio' },
  { id: 2, title: 'Informações', description: 'Dados principais' },
  { id: 3, title: 'Localização', description: 'Onde está localizado' },
  { id: 4, title: 'Comodidades', description: 'Recursos disponíveis' },
  { id: 5, title: 'Preço', description: 'Valor e condições' },
  { id: 6, title: 'Imagens', description: 'Fotos do seu anúncio' },
  { id: 7, title: 'Contato', description: 'Como te encontrar' },
  { id: 8, title: 'Revisão', description: 'Confirmar dados' }
]

// Categories will be loaded dynamically from database

export default function CreateListing() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, profile, canCreateAd } = useAuth()
  const { isOpen, context, openModal, closeModal } = useUpgradeModal()
  const { createAd } = useAdsStore()
  const toast = useToast()
  const [brazilianStates, setBrazilianStates] = useState<Array<{code: string, name: string, region: string}>>([])
  const [categories, setCategories] = useState<Array<{id: number, name: string, type: 'space' | 'advertiser', parent_id?: number}>>([])
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<Array<{id: string, file: File, preview: string}>>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customAmenities, setCustomAmenities] = useState<string[]>([])
  const [customFeatures, setCustomFeatures] = useState<string[]>([])
  const [customServices, setCustomServices] = useState<string[]>([])
  const maxImages = getMaxImagesForPlan(profile?.plan_type || 'free')
  const modalShownRef = useRef(false)
  
  useEffect(() => {
    getBrazilianStates().then(setBrazilianStates)
    
    // Fetch categories from database
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, type, parent_id')
        .eq('is_active', true)
        .order('name')
      
      if (error) {
        toast.error('Erro ao carregar categorias', 'Não foi possível carregar as categorias. Tente recarregar a página.')
      } else {
        const allCategories = data || []
        setCategories(allCategories)
        // Categories are already set above
      }
    }
    
    fetchCategories()
  }, [])

  // Check if user can create ads on component mount - only run once when component mounts
  useEffect(() => {
    if (profile && !canCreateAd() && !modalShownRef.current) {
      modalShownRef.current = true // Mark that we've shown the modal
      // If user has free plan, show no_plan modal
      if (profile.plan_type === 'free') {
        openModal('no_plan')
      } else {
        // If user has paid plan but reached limit, show create_listing modal
        openModal('create_listing')
      }
    }
  }, [profile?.plan_type, canCreateAd, openModal, profile]) // Include all dependencies

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger
  } = useForm<CreateListingData>({
    resolver: zodResolver(createListingSchema),
    mode: 'onChange',
    defaultValues: {
      state: 'SP' // São Paulo como padrão
    }
  })

  const watchedCategoryType = watch('categoryType')
  const allValues = watch()
  
  // Reset category when changing type
  useEffect(() => {
    if (watchedCategoryType) {
      setValue('category_id', undefined)
    }
  }, [watchedCategoryType, setValue])
  
  // Definir featured como true automaticamente para usuários premium
  useEffect(() => {
    if (profile?.plan_type === 'premium') {
      setValue('featured', true)
    }
  }, [profile?.plan_type, setValue])

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(image => {
        URL.revokeObjectURL(image.preview)
      })
    }
  }, [images])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    // Limitar a 11 dígitos (2 DDD + 9 número)
    const limitedNumbers = numbers.slice(0, 11)
    
    if (limitedNumbers.length <= 10) {
      return limitedNumbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else {
      return limitedNumbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateListingData)[] = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['categoryType']
        break
      case 2:
        fieldsToValidate = ['title', 'description', 'category_id']
        // Validar capacidade para espaços
        if (watchedCategoryType === 'space') {
          fieldsToValidate.push('capacity')
        }
        break
      case 3:
        fieldsToValidate = ['state', 'city']
        break
      case 4:
        // Step de comodidades - sem validação obrigatória
        break
      case 5:
        fieldsToValidate = ['price', 'priceType']
        break
      case 6:
        // Step de imagens - validação customizada
        break
      case 7:
        fieldsToValidate = ['contactPhone']
        break
    }
    
    const isStepValid = await trigger(fieldsToValidate)
    if (isStepValid && currentStep < 8) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: CreateListingData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      // Mapear dados do formulário para o formato do banco
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

      const listingData = {
        user_id: user.id,
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
        delivery_available: false,
        featured: data.featured || false,
        status: 'active' as const,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined
      }

      const loadingToastId = toast.loading('Criando anúncio...', 'Aguarde enquanto processamos seus dados')
      
      const result = await createAd(listingData)
      
      if (result.error) {
        toast.removeToast(loadingToastId)
        toast.error('Erro ao criar anúncio', result.error)
        setError(result.error)
        return
      }

      // Upload de imagens se houver
      if (images.length > 0 && result.data?.id) {
        try {
          toast.updateToast(loadingToastId, { title: 'Enviando imagens...', message: `Carregando ${images.length} imagem${images.length > 1 ? 's' : ''}` })
          const uploadedImages = await uploadAdImages(result.data.id, images)
          await saveImageRecords(result.data.id, uploadedImages)
        } catch {
          toast.removeToast(loadingToastId)
          toast.warning('Anúncio criado com limitações', 'Anúncio criado com sucesso, mas houve erro no upload das imagens. Você pode editá-las depois.')
          setError('Anúncio criado com sucesso, mas houve erro no upload das imagens. Você pode editá-las depois.')
          setTimeout(() => navigate('/dashboard?newListing=true'), 3000)
          return
        }
      }
      
      // Redirecionar para dashboard com mensagem de sucesso
      toast.removeToast(loadingToastId)
      toast.success('Anúncio criado com sucesso!', 'Seu anúncio foi publicado e já está disponível para visualização.')
      navigate('/dashboard?newListing=true')
    } catch (error) {
      toast.removeToast(loadingToastId)
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar anúncio'
      toast.error('Erro ao criar anúncio', errorMessage)
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
                Que tipo de anúncio você quer criar?
              </h2>
              <p className="text-gray-600">
                Escolha entre espaços para eventos ou anunciar como prestador de serviços
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <label 
                className={`
                  cursor-pointer border-2 rounded-lg p-6 transition-all hover:shadow-md
                  ${watchedCategoryType === 'space' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  value="space"
                  {...register('categoryType')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Espaços</h3>
                  <p className="text-sm text-gray-600">
                    Área de lazer, chácaras e salões para eventos
                  </p>
                </div>
              </label>
              
              <label 
                className={`
                  cursor-pointer border-2 rounded-lg p-6 transition-all hover:shadow-md
                  ${watchedCategoryType === 'advertiser' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  value="advertiser"
                  {...register('categoryType')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Anunciantes</h3>
                  <p className="text-sm text-gray-600">
                    Prestadores de serviços, equipamentos e fornecedores para eventos
                  </p>
                </div>
              </label>
            </div>
            
            {errors.categoryType && (
              <p className="text-red-600 text-sm text-center">{errors.categoryType.message}</p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Informações do {
                  watchedCategoryType === 'space' ? 'Espaço' : 'Anúncio'
                }
              </h2>
              <p className="text-gray-600">
                Descreva seu {
                  watchedCategoryType === 'space' ? 'espaço' : 'serviço ou produto'
                } de forma atrativa
              </p>
            </div>

            {watchedCategoryType === 'advertiser' ? (
              <FormSelect
                label="Categoria do Anúncio"
                options={categories
                  .filter(cat => cat.type === 'advertiser' && cat.parent_id)
                  .map(cat => ({
                    value: cat.id.toString(),
                    label: cat.name
                  }))
                }
                error={errors.category_id}
                required
                placeholder="Selecione o tipo de serviço"
                defaultValue=""
                {...register('category_id', { 
                  setValueAs: (value) => value ? parseInt(value) : undefined
                })}
              />
            ) : (
              <FormSelect
                label="Categoria"
                options={categories
                  .filter(cat => cat.type === watchedCategoryType)
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
            )}

            <FormField
              label="Título do anúncio"
              type="text"
              placeholder={
                watchedCategoryType === 'advertiser' 
                  ? "Ex: Buffet Completo para Festas" 
                  : watchedCategoryType === 'space'
                    ? "Ex: Salão de Festas para 200 pessoas"
                    : "Ex: Área de Lazer com Piscina"
              }
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
                placeholder={
                  watchedCategoryType === 'advertiser'
                    ? "Descreva seus serviços, experiência, equipamentos inclusos, área de atuação..."
                    : watchedCategoryType === 'space'
                      ? "Descreva a capacidade, infraestrutura, comodidades disponíveis..."
                      : "Descreva o local, recursos e características especiais..."
                }
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

            {/* Campos específicos para espaços */}
            {watchedCategoryType === 'space' && (
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
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Localização
              </h2>
              <p className="text-gray-600">
                Onde está localizado seu {watchedCategoryType === 'advertiser' ? 'negócio' : 'espaço'}?
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

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Comodidades e Recursos
              </h2>
              <p className="text-gray-600">
                Selecione as comodidades e recursos disponíveis no seu {watchedCategoryType === 'advertiser' ? 'serviço' : 'espaço'}
              </p>
            </div>

            <AmenitiesSelector
              selectedAmenities={selectedAmenities}
              selectedFeatures={selectedFeatures}
              selectedServices={selectedServices}
              onAmenitiesChange={setSelectedAmenities}
              onFeaturesChange={setSelectedFeatures}
              onServicesChange={setSelectedServices}
              categoryType={watchedCategoryType || 'space'}
              customAmenities={customAmenities}
              customFeatures={customFeatures}
              customServices={customServices}
              onCustomAmenitiesChange={(amenities) => {
                setCustomAmenities(amenities)
              }}
              onCustomFeaturesChange={(features) => {
                setCustomFeatures(features)
              }}
              onCustomServicesChange={(services) => {
                setCustomServices(services)
              }}
            />
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Preço e Condições
              </h2>
              <p className="text-gray-600">
                Defina o valor do seu {watchedCategoryType === 'advertiser' ? 'serviço' : 'espaço'}
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
                <li>• Considere custos de transporte e montagem</li>
                <li>• Ofereça desconto para períodos longos</li>
                <li>• Preços competitivos geram mais contatos</li>
              </ul>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Imagens do {watchedCategoryType === 'advertiser' ? 'Serviço' : 'Espaço'}
              </h2>
              <p className="text-gray-600">
                Adicione fotos para aumentar as chances de contato
              </p>
            </div>

            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={maxImages}
              planType={profile?.plan_type || 'free'}
              disabled={isSubmitting}
            />
          </div>
        )

      case 7:
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

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Revisar Informações
              </h2>
              <p className="text-gray-600">
                Confira todos os dados antes de publicar seu anúncio
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{allValues.title}</h3>
                  <p className="text-sm text-gray-600">{
                    categories.find(cat => cat.id === allValues.category_id)?.name
                  }</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    R$ {allValues.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-500">
                    por {allValues.priceType === 'daily' ? 'dia' : allValues.priceType === 'hourly' ? 'hora' : 'evento'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Localização:</strong> {allValues.city}, {allValues.state}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Contato:</strong> {allValues.contactPhone}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Descrição:</strong> {allValues.description?.substring(0, 100)}...
                </p>
                {watchedCategoryType === 'space' && allValues.capacity && (
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Capacidade:</strong> {allValues.capacity} pessoas
                  </p>
                )}
                {(selectedAmenities.length > 0 || selectedFeatures.length > 0 || selectedServices.length > 0 || customAmenities.length > 0 || customFeatures.length > 0 || customServices.length > 0) && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Comodidades:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {/* Predefined amenities */}
                      {[...selectedAmenities, ...selectedFeatures, ...selectedServices].slice(0, 4).map((item, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {translateItem(item)}
                        </span>
                      ))}
                      {/* Custom amenities with different styling */}
                      {[...customAmenities, ...customFeatures, ...customServices].slice(0, 2).map((item, index) => (
                        <span key={`custom-${index}`} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs border border-primary-200">
                          {item}
                        </span>
                      ))}
                      {/* Show more indicator */}
                      {(selectedAmenities.length + selectedFeatures.length + selectedServices.length + customAmenities.length + customFeatures.length + customServices.length) > 6 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          +{(selectedAmenities.length + selectedFeatures.length + selectedServices.length + customAmenities.length + customFeatures.length + customServices.length) - 6} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {images.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <strong>Imagens:</strong> {images.length} {images.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}
                  </p>
                )}
              </div>
              
              {/* Image Preview */}
              {images.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Imagens do anúncio:</h4>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {images.slice(0, 8).map((image, index) => (
                      <div key={image.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-1 py-0.5 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                    {images.length > 8 && (
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">+{images.length - 8}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Anúncio destacado (automático para plano premium) */}
            {profile?.plan_type === 'premium' && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white fill-current" />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span>Seu anúncio será destacado automaticamente</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700 mb-2">
                    Anúncios destacados aparecem no topo das buscas e no slider da página inicial, 
                    recebendo até 5x mais visualizações!
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      Prioridade nas buscas
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      Destaque na página inicial
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      Badge especial
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensagem para usuários básicos sobre upgrade */}
            {profile?.plan_type === 'basic' && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Crown className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Quer destacar seus anúncios?
                    </h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Anúncios destacados recebem até 5x mais visualizações e aparecem 
                      no topo das buscas e na página inicial.
                    </p>
                    <button
                      onClick={() => openModal('feature_ad')}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Crown className="w-4 h-4" />
                      Fazer Upgrade
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">⚠️ Antes de publicar</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Verifique se todas as informações estão corretas</li>
                <li>• Seu anúncio será analisado em até 24 horas</li>
                <li>• Você receberá um email quando for aprovado</li>
                <li>• Pode editar o anúncio a qualquer momento</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Tooltip content="Voltar ao dashboard">
              <Link
                to="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
            </Tooltip>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Criar Anúncio</h1>
              <p className="text-gray-600">Etapa {currentStep} de {STEPS.length}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                
                {/* Step Info */}
                <div className="text-center mt-2">
                  <p className="text-xs font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress Line */}
          <div className="relative -mt-20 mb-16">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200">
              <div 
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <FormButton
              type="button"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
              className="px-8"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Anúncio'}
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
                  Erro ao criar anúncio
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isOpen}
        onClose={() => {
          modalShownRef.current = false // Reset the flag when modal is closed
          closeModal()
        }}
        context={context}
      />
    </div>
  )
}