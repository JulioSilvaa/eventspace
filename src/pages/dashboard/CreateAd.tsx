import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
// import { useUpgradeModal } from '@/hooks/useUpgradeModal'
// import UpgradeModal from '@/components/modals/UpgradeModal'
import { useAdsStore } from '@/stores/adsStore'
import { useToast } from '@/contexts/ToastContext'
import { paymentService } from '@/services/paymentService'

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Building2,
  Users,
  DollarSign,
  Star,
  AlertCircle
} from 'lucide-react'
import { FormField, FormButton, FormSelect } from '@/components/forms'
import ImageUpload from '@/components/forms/ImageUpload'
import AmenitiesSelector from '@/components/forms/AmenitiesSelector'
import { AMENITY_LABELS } from '@/constants/amenities'
import { getBrazilianStates } from '@/lib/api/search'
import Tooltip from '@/components/ui/Tooltip'
import { maskPhone as utilMaskPhone, maskCEP as utilMaskCEP, unmask } from '@/utils/masks'

// Import apiClient for fetching categories
import { apiClient } from '@/lib/api-client'

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
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  postal_code: z.string()
    .min(1, 'CEP é obrigatório')
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 12345-678)'),
  reference_point: z.string().optional(),

  // Step 4: Comodidades e Recursos
  amenities: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  services: z.array(z.string()).optional(),

  // Step 5: Preço
  price: z.any()
    .refine((val) => {
      if (typeof val === 'number') return val > 0
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/[^\d,]/g, '').replace(',', '.'))
        return num > 0
      }
      return false
    }, 'Preço deve ser maior que zero'),
  priceType: z.enum(['daily', 'weekend'], {
    required_error: 'Selecione o tipo de preço'
  }),

  // Step 6: Contato
  contactPhone: z.string()
    .min(1, 'Telefone é obrigatório')
    .max(25, 'Telefone muito longo'),
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

  // Featured (Ativo para todos os usuários)
  featured: z.boolean().optional(),

  // Images (será tratado separadamente no estado)
  images: z.array(z.any()).optional()
})

type CreateListingData = z.infer<typeof createListingSchema>

const STEPS = [
  { id: 1, title: 'Informações', description: 'Dados principais' },
  { id: 2, title: 'Localização', description: 'Onde está localizado' },
  { id: 3, title: 'Comodidades', description: 'Recursos disponíveis' },
  { id: 4, title: 'Preço', description: 'Valor e condições' },
  { id: 5, title: 'Imagens', description: 'Fotos do seu anúncio' },
  { id: 6, title: 'Contato', description: 'Como te encontrar' },
  { id: 7, title: 'Revisão', description: 'Confirmar dados' }
]



export default function CreateAd() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, profile, canCreateAd } = useAuth()
  // const { isOpen, context, openModal, closeModal } = useUpgradeModal()
  const { createAd } = useAdsStore()
  const toast = useToast()
  const [brazilianStates, setBrazilianStates] = useState<Array<{ code: string, name: string, region: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: number, name: string, type: 'space' | 'advertiser', parent_id?: number }>>([])
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<Array<{ id: string, file: File, preview: string }>>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [customAmenities, setCustomAmenities] = useState<string[]>([])
  const [customFeatures, setCustomFeatures] = useState<string[]>([])
  const [customServices, setCustomServices] = useState<string[]>([])
  const maxImages = 10
  const modalShownRef = useRef(false)

  useEffect(() => {
    getBrazilianStates().then(setBrazilianStates)

    // TODO: Fetch categories from API when backend endpoint is ready
    // For now, using hardcoded categories
    const staticCategories = [
      { id: 1, name: 'Salão de Festas', type: 'space' as const, parent_id: undefined },
      { id: 2, name: 'Chácara', type: 'space' as const, parent_id: undefined },
      { id: 3, name: 'Área de Lazer', type: 'space' as const, parent_id: undefined },
      { id: 4, name: 'Buffet', type: 'advertiser' as const, parent_id: undefined },
      { id: 5, name: 'Decoração', type: 'advertiser' as const, parent_id: undefined },
      { id: 6, name: 'Fotografia', type: 'advertiser' as const, parent_id: undefined },
      { id: 7, name: 'Som e Iluminação', type: 'advertiser' as const, parent_id: undefined },
    ]
    setCategories(staticCategories)
  }, [])


  // TODO: Re-enable when subscription system is implemented
  // Check if user can create ads on component mount - only run once when component mounts
  // useEffect(() => {
  //   if (profile && !canCreateAd() && !modalShownRef.current) {
  //     modalShownRef.current = true // Mark that we've shown the modal
  //     // If user has free plan, show no_plan modal
  //     if (profile.plan_type === 'free') {
  //       openModal('generic') // Changed from no_plan to generic as per type definition
  //     } else {
  //       // If user has paid plan but reached limit, show create_listing modal
  //       openModal('create_ad') // Changed from create_listing to create_ad
  //     }
  //   }
  // }, [profile?.plan_type, canCreateAd, openModal, profile]) // Include all dependencies

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger
  } = useForm<CreateListingData>({
    resolver: zodResolver(createListingSchema),
    mode: 'onChange',
    defaultValues: {
      categoryType: 'space',
      category_id: undefined,
      title: '',
      description: '',
      capacity: undefined,
      area_sqm: undefined,
      state: 'SP',
      city: '',
      neighborhood: '',
      address: '',
      number: '',
      complement: '',
      postal_code: '',
      reference_point: '',
      amenities: [],
      features: [],
      services: [],
      price: undefined,
      priceType: undefined,
      contactPhone: '',
      contactWhatsapp: '',
      contactWhatsappAlternative: '',
      contactEmail: '',
      contactInstagram: '',
      contactFacebook: '',
      featured: false,
      images: []
    }
  })



  // Log validation errors for debugging
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // console.log('📝 FORM VALIDATION ERRORS:', errors)
    }
  }, [errors])

  // console.log('🔄 CreateAd Render - isValid:', isValid, 'errors count:', Object.keys(errors).length)

  const watchedCategoryType = watch('categoryType')
  const allValues = watch()

  // Reset category when changing type
  useEffect(() => {
    if (watchedCategoryType) {
      setValue('category_id', undefined as unknown as number)
    }
  }, [watchedCategoryType, setValue])


  // Cleanup image URLs ONLY on unmount to avoid ERR_FILE_NOT_FOUND during transitions
  useEffect(() => {
    const currentImages = images
    return () => {
      currentImages.forEach(image => {
        URL.revokeObjectURL(image.preview)
      })
    }
  }, []) // Empty dependency array means this runs once on mount and cleanup runs only on unmount


  // Refined currency mask for better typing experience
  const maskCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    if (!cleanValue) return ''
    const numberValue = parseInt(cleanValue)
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(numberValue / 100)
  }

  // Generic handler to apply masks and preserve cursor
  const handleMaskedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    maskFn: (val: string) => string,
    fieldName: keyof CreateListingData
  ) => {
    const input = e.target
    const start = input.selectionStart || 0
    const value = input.value
    const previousValue = input.defaultValue || '' // Note: defaultValue might not always track previous state perfectly in controlled inputs without ref, using value diff approach

    // Calculate how many non-digit characters are before the cursor
    const digitPattern = /\d/
    let digitsBeforeCursor = 0
    for (let i = 0; i < start; i++) {
      if (digitPattern.test(value[i])) {
        digitsBeforeCursor++
      }
    }

    const masked = maskFn(value)

    // Explicitly update DOM value since we're overriding onChange in an uncontrolled-like setup
    input.value = masked

    setValue(fieldName, masked, { shouldValidate: true })

    // Find new cursor position
    let newCursorPos = 0
    let digitsSeen = 0
    for (let i = 0; i < masked.length; i++) {
      if (digitPattern.test(masked[i])) {
        digitsSeen++
      }
      if (digitsSeen >= digitsBeforeCursor) {
        // If we found all our digits, looking for the next slot. 
        // If the very next char is not a digit (separator), skip it?
        // Simple heuristic: set cursor after the current digit position + potential separators
        // But we need to handle "just deleted a digit".

        // Let's rely on standard re-positioning:
        newCursorPos = i + 1
        break
      }
    }

    // Correction for exact match boundaries (e.g. if mask added chars) is tough.
    // Let's stick to the relative diff method but improved:

    // Actually, the best user experience for phone masks is often just setting it to end if simplified, 
    // but users hate that.
    // Let's use the React scheduling trick but with better calculation.

    const unmaskedLengthBefore = value.slice(0, start).replace(/\D/g, '').length

    setTimeout(() => {
      let newPos = 0
      let tempDigits = 0
      // Walk through masked string until we see the same number of digits
      for (let i = 0; i < masked.length; i++) {
        if (/\d/.test(masked[i])) {
          tempDigits++
        }
        if (tempDigits === unmaskedLengthBefore) {
          newPos = i + 1
          break
        }
      }
      // Improve edge case where cursor was before a separator which got removed?
      // If we deleted a char, we might want to be at i not i+1?
      // Let's stick to "cursor after the Nth digit" rule.

      // Edge case: if we have 0 digits (deleted everything)
      if (unmaskedLengthBefore === 0) newPos = 0;

      input.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof CreateListingData)[] = []

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['title', 'description', 'category_id', 'categoryType']
        // Validar capacidade para espaços
        if (watchedCategoryType === 'space') {
          fieldsToValidate.push('capacity')
        }
        break
      case 2:
        fieldsToValidate = ['state', 'city', 'neighborhood', 'address', 'number', 'postal_code']
        break
      case 3:
        // Step de comodidades - sem validação obrigatória
        break
      case 4:
        fieldsToValidate = ['price', 'priceType']
        break
      case 5:
        // Validate images manually since it's not a simple field
        if (images.length === 0) {
          toast.error('Imagens obrigatórias', 'Adicione pelo menos uma foto do seu espaço.')
          return
        }
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
      // Show generic error if standard validation fails
      const errorsList = Object.keys(errors)
      if (errorsList.length > 0) {
        toast.error('Verifique os campos', 'Preencha todos os campos obrigatórios corretamente.')
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: CreateListingData) => {
    // console.log('🚀 SUBMITTING FORM START', data)
    setIsSubmitting(true)
    setError(null)

    let loadingToastId: string | number | undefined

    try {
      if (!user) {
        throw new Error('Usuário não encontrado')
      }

      loadingToastId = toast.loading('Criando anúncio...', 'Aguarde enquanto processamos seus dados')

      // Combinar todas as comodidades em um único array
      const allComfort = [
        ...selectedAmenities,
        ...selectedFeatures,
        ...selectedServices,
        ...customAmenities,
        ...customFeatures,
        ...customServices
      ]

      // Formatar telefones (prefixar +55 se necessário, mas manter formatação)
      const processPhone = (phone: string | undefined) => {
        if (!phone) return undefined
        const digits = phone.replace(/\D/g, '')
        if (!digits) return phone
        // Se já começa com 55, apenas garantir que tem o + opcionalmente ou disparar como está
        // Ajustando para o que o usuário quer: manter a máscara mas garantir prefixo se possível
        return phone.startsWith('+55') || digits.startsWith('55') ? phone : `+55 ${phone}`
      }

      // Preço: converter de string formatada (R$ 1.234,56) para número (1234.56)
      const parseCurrency = (value: any) => {
        if (typeof value === 'number') return value
        if (typeof value !== 'string') return 0
        const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.')
        return parseFloat(cleanValue) || 0
      }

      const finalPrice = parseCurrency(data.price)

      let price_per_day: number | undefined
      let price_per_weekend: number | undefined

      if (data.priceType === 'daily') {
        price_per_day = finalPrice
      } else if (data.priceType === 'weekend') {
        price_per_weekend = finalPrice
      }

      const formattedPhone = processPhone(data.contactPhone)
      const formattedWhatsapp = processPhone(data.contactWhatsapp)
      const formattedWhatsappAlternative = processPhone(data.contactWhatsappAlternative)

      // Extrair arquivos de imagem
      const imageFiles = images.map(img => img.file)

      if (imageFiles.length === 0) {
        toast.error('Erro de validação', 'É necessário fornecer pelo menos uma imagem.')
        setIsSubmitting(false)
        return
      }

      // Criar objeto no formato esperado pelo backend (SpaceEntity)
      const listingData: any = {
        user_id: user.id,
        title: data.title,
        description: data.description,

        // Address object (formato esperado pelo backend)
        address: {
          street: data.address || '',
          number: data.number || '',
          complement: data.complement || '',
          neighborhood: data.neighborhood || '',
          city: data.city,
          state: data.state,
          zipcode: data.postal_code || '',
          country: 'Brasil',
        },

        capacity: data.capacity,
        price_per_day,
        price_per_weekend,
        comfort: allComfort,
        contact_phone: formattedPhone,
        contact_whatsapp: formattedWhatsapp,
        contact_whatsapp_alternative: formattedWhatsappAlternative,
        contact_email: data.contactEmail,
        contact_instagram: data.contactInstagram,
        contact_facebook: data.contactFacebook,
        status: 'inactive' as const,
      }

      // Chamada unificada enviando dados e arquivos
      const result = await createAd(listingData, imageFiles);

      if (result.error) {
        if (loadingToastId) toast.removeToast(String(loadingToastId));
        toast.error('Erro ao Criar Anúncio', result.error);
        return;
      }

      if (loadingToastId) toast.removeToast(String(loadingToastId));

      toast.success('Anúncio criado!', 'Redirecionando para ativação do plano...');

      if (result.data?.id) {
        await paymentService.createSubscriptionCheckout(result.data.id);
      } else {
        navigate('/dashboard?newListing=true');
      }
    } catch (error) {
      if (loadingToastId) toast.removeToast(String(loadingToastId))
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
                Informações do Espaço
              </h2>
              <p className="text-gray-600">
                Descreva seu espaço de forma atrativa
              </p>
            </div>

            <FormSelect
              key="category_id"
              label="Categoria"
              options={categories
                .filter(cat => cat.type === 'space')
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
              key="title"
              label="Título do Anúncio"
              type="text"
              placeholder="Ex: Chácara Recanto Feliz - Piscina e Churrasqueira"
              error={errors.title}
              required
              {...register('title')}
            />

            <div key="description-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição detalhada <span className="text-red-500">*</span>
              </label>
              <textarea
                key="description"
                rows={6}
                placeholder="Exemplo: Chácara Recanto das Flores: Espaço ideal para casamentos e aniversários com 500m². Possuímos piscina aquecida, área de churrasqueira completa, salão de festas coberto para 200 pessoas e estacionamento para 50 carros. Ambiente familiar e aconchegante, perfeito para celebrar momentos especiais..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                key="capacity"
                label="Capacidade (pessoas)"
                type="number"
                placeholder="Ex: 100"
                error={errors.capacity}
                required
                {...register('capacity', {
                  setValueAs: (v) => v === "" ? undefined : parseFloat(v)
                })}
              />

              <FormField
                key="area_sqm"
                label="Área total (m²)"
                type="number"
                placeholder="Ex: 500"
                error={errors.area_sqm}
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
                key="state"
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
                key="city"
                label="Cidade"
                type="text"
                placeholder="Nome da cidade"
                error={errors.city}
                required
                {...register('city')}
              />
            </div>

            <FormField
              key="neighborhood"
              label="Bairro"
              type="text"
              placeholder="Nome do bairro"
              error={errors.neighborhood}
              required
              {...register('neighborhood')}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  key="address-field"
                  label="Endereço (Rua/Avenida)"
                  type="text"
                  placeholder="Ex: Rua das Flores"
                  error={errors.address}
                  required
                  {...register('address')}
                />
              </div>

              <FormField
                key="number"
                label="Número"
                type="text"
                placeholder="Ex: 123"
                error={errors.number}
                required
                {...register('number')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                key="postal_code"
                label="CEP"
                type="text"
                placeholder="12345-678"
                error={errors.postal_code}
                required
                hint="CEP para facilitar a localização"
                {...register('postal_code')}
                onChange={(e) => handleMaskedChange(e, utilMaskCEP, 'postal_code')}
              />

              <FormField
                key="complement"
                label="Complemento"
                type="text"
                placeholder="Ex: Apto 101, Bloco B"
                error={errors.complement}
                hint="Opcional"
                {...register('complement')}
              />
            </div>

            <FormField
              label="Ponto de referência"
              type="text"
              placeholder="Ex: Próximo ao Shopping Center"
              error={errors.reference_point}
              hint="Ponto conhecido na região (opcional)"
              {...register('reference_point')}
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
              <div key="price-field-container">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    key="price-input"
                    type="text"
                    placeholder="R$ 0,00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                    {...register('price')}
                    onChange={(e) => handleMaskedChange(e, maskCurrency, 'price')}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.price.message || '')}</p>
                )}
              </div>

              <FormSelect
                key="priceType"
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
                Adicione fotos para aumentar as chances de contato
              </p>
            </div>

            <ImageUpload
              key="image-upload"
              images={images}
              onImagesChange={setImages}
              maxImages={maxImages}
              disabled={isSubmitting}
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
              key="contactPhone"
              label="Telefone para Ligações"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.contactPhone}
              required
              {...register('contactPhone')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactPhone')}
            />

            <FormField
              key="contactWhatsapp"
              label="WhatsApp Principal"
              type="tel"
              placeholder="(11) 99999-9999 (opcional)"
              error={errors.contactWhatsapp}
              {...register('contactWhatsapp')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactWhatsapp')}
            />

            <FormField
              key="contactWhatsappAlternative"
              label="WhatsApp Alternativo"
              type="tel"
              placeholder="(11) 99999-9999 (opcional)"
              error={errors.contactWhatsappAlternative}
              {...register('contactWhatsappAlternative')}
              onChange={(e) => handleMaskedChange(e, utilMaskPhone, 'contactWhatsappAlternative')}
            />

            <FormField
              key="contactEmail"
              label="Email de contato"
              type="email"
              placeholder="seu@email.com (opcional)"
              error={errors.contactEmail}
              {...register('contactEmail')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                key="contactInstagram"
                label="Instagram"
                type="text"
                placeholder="@seu.espaco (opcional)"
                error={errors.contactInstagram}
                {...register('contactInstagram')}
              />

              <FormField
                key="contactFacebook"
                label="Facebook"
                type="text"
                placeholder="fb.com/seu.espaco (opcional)"
                error={errors.contactFacebook}
                {...register('contactFacebook')}
              />
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            {/* Sumário de Erros para Debug */}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Revisar Informações
              </h2>
              <p className="text-gray-600">
                Confira todos os dados antes de publicar seu anúncio
              </p>
            </div>

            {/* Imagens */}
            {images.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📸</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Imagens ({images.length} {images.length === 1 ? 'foto' : 'fotos'})
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {images.slice(0, 8).map((image, index) => (
                    <div key={image.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                  {images.length > 8 && (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <span className="text-sm text-gray-500 font-medium">+{images.length - 8} fotos</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informações Básicas */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📋</span>
                <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">{watch('title') || 'Título não informado'}</h4>
                    <p className="text-sm text-gray-600">
                      {categories.find(cat => cat.id === watch('category_id'))?.name || 'Categoria não selecionada'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      {watch('price') || 'R$ 0,00'}
                    </p>
                    <p className="text-sm text-gray-500">
                      por {watch('priceType') === 'daily' ? 'dia' : watch('priceType') === 'weekend' ? 'final de semana' : 'período'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Descrição:</p>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {watch('description') || 'Nenhuma descrição informada.'}
                  </p>
                </div>

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
            {(selectedAmenities.length > 0 || selectedFeatures.length > 0 || selectedServices.length > 0) && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✨</span>
                  <h3 className="text-lg font-semibold text-gray-900">Comodidades e Recursos</h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[...selectedAmenities, ...selectedFeatures, ...selectedServices].map((item, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      ✓ {AMENITY_LABELS[item] || item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contato */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📞</span>
                <h3 className="text-lg font-semibold text-gray-900">Suas Informações de Contato</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Telefone Principal</p>
                  <p className="text-sm text-gray-900">{watch('contactPhone')}</p>
                </div>
                {watch('contactWhatsapp') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">WhatsApp</p>
                    <p className="text-sm text-gray-900">{watch('contactWhatsapp')}</p>
                  </div>
                )}
                {watch('contactEmail') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">E-mail</p>
                    <p className="text-sm text-gray-900">{watch('contactEmail')}</p>
                  </div>
                )}
                {watch('contactWhatsappAlternative') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">WhatsApp Alternativo</p>
                    <p className="text-sm text-gray-900">{watch('contactWhatsappAlternative')}</p>
                  </div>
                )}
                {watch('contactInstagram') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Instagram</p>
                    <p className="text-sm text-gray-900">{watch('contactInstagram')}</p>
                  </div>
                )}
                {watch('contactFacebook') && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Facebook</p>
                    <p className="text-sm text-gray-900">{watch('contactFacebook')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-green-600 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-green-900 mb-1">Tudo pronto para publicar!</h4>
                  <p className="text-sm text-green-700 leading-relaxed">
                    Seu anúncio será publicado instantaneamente e ficará visível para milhares de usuários interessados. Você pode editá-lo a qualquer momento pelo seu painel.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Tooltip content="Voltar ao dashboard">
              <Link
                to="/dashboard"
                className="group p-2 hover:bg-primary-50 rounded-lg transition-all"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" />
              </Link>
            </Tooltip>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Criar Anúncio</h1>
              <p className="text-sm text-gray-600 mt-1">Preencha as informações para publicar seu anúncio</p>
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
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              size="lg"
              className="px-10 py-4 md:py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-semibold shadow-lg hover:shadow-xl transform active:scale-95 md:hover:scale-105 transition-all w-full md:w-auto flex justify-center"
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

      {/* Upgrade Modal - Temporarily disabled */}
      {/* <UpgradeModal
        isOpen={isOpen}
        onClose={() => {
          closeModal()
          // Se o usuário fechar o modal sem fazer upgrade, redirecionar para dashboard
          navigate('/dashboard')
        }}
        context={context}
      /> */}
    </div>
  )
}
