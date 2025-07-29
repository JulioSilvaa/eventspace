import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { FormField, FormButton, FormSelect } from '@/components/forms'
import { getBrazilianStates, getRegionFromState } from '@/lib/brazilian-regions'
import { paymentService, type CreateCheckoutSessionParams } from '@/services/paymentService'
import { Crown, Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { DOCUMENT_VERSIONS } from '@/types'

// Schema para Step 1 - Dados Pessoais
const personalDataSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  state: z
    .string()
    .min(1, 'Estado é obrigatório'),
  city: z
    .string()
    .min(1, 'Cidade é obrigatória'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Você deve aceitar os termos de uso')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

// Schema para Step 2 - Seleção de Plano
const planSelectionSchema = z.object({
  planType: z.enum(['basic', 'premium'], {
    required_error: 'Selecione um plano'
  })
})

type PersonalDataForm = z.infer<typeof personalDataSchema>
type PlanSelectionForm = z.infer<typeof planSelectionSchema>

type RegisterStep = 1 | 2 | 3

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState<RegisterStep>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [brazilianStates, setBrazilianStates] = useState<Array<{code: string, name: string, region: string}>>([])

  // Dados salvos entre steps
  const [personalData, setPersonalData] = useState<PersonalDataForm | null>(null)
  const [planData, setPlanData] = useState<PlanSelectionForm | null>(null)

  // Form for Step 1 - Personal Data
  const personalForm = useForm<PersonalDataForm>({
    resolver: zodResolver(personalDataSchema),
    mode: 'onChange'
  })

  // Form for Step 2 - Plan Selection
  const planForm = useForm<PlanSelectionForm>({
    resolver: zodResolver(planSelectionSchema),
    mode: 'onChange',
    defaultValues: {
      planType: 'basic'
    }
  })

  useEffect(() => {
    getBrazilianStates().then(setBrazilianStates)
  }, [])

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    }
  }

  const handleStep1Submit = (data: PersonalDataForm) => {
    setPersonalData(data)
    setCurrentStep(2)
  }

  const handleStep2Submit = (data: PlanSelectionForm) => {
    setPlanData(data)
    setCurrentStep(3)
  }

  const handleFinalSubmit = async () => {
    console.log('🚀 handleFinalSubmit iniciado')
    
    if (!personalData || !planData) {
      console.error('❌ Dados incompletos:', { personalData: !!personalData, planData: !!planData })
      setError('Dados incompletos. Tente novamente.')
      return
    }

    // Previne duplo clique
    if (isLoading) {
      console.log('⚠️ Já está carregando, ignorando duplo clique')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('📋 Preparando dados para checkout...')
      
      // Capturar informações para consentimento LGPD
      const userAgent = navigator.userAgent
      const timestamp = new Date().toISOString()
      
      // Preparar dados para o checkout com metadata completa
      const checkoutParams: CreateCheckoutSessionParams & { 
        userData: PersonalDataForm & PlanSelectionForm & {
          // Informações de consentimento LGPD
          consentTimestamp: string
          consentUserAgent: string
          termsVersion: string
          privacyVersion: string
        }
      } = {
        planType: planData.planType,
        billingCycle: 'monthly', // Sempre mensal
        userId: 'temp-' + Date.now(), // ID temporário
        userEmail: personalData.email,
        userData: { 
          ...personalData, 
          ...planData, 
          billingCycle: 'monthly',
          // Adicionar região baseada no estado
          region: getRegionFromState(personalData.state),
          // Adicionar dados de consentimento
          consentTimestamp: timestamp,
          consentUserAgent: userAgent,
          termsVersion: DOCUMENT_VERSIONS.terms_of_service,
          privacyVersion: DOCUMENT_VERSIONS.privacy_policy
        }
      }

      console.log('💾 Salvando dados no localStorage...')
      // Salvar dados temporariamente para recuperação
      localStorage.setItem('pending-signup', JSON.stringify(checkoutParams))

      console.log('🔄 Chamando paymentService.createCheckoutSessionWithSignup...')
      // Redirecionar para Stripe Checkout
      await paymentService.createCheckoutSessionWithSignup(checkoutParams)
      
      console.log('✅ Checkout iniciado com sucesso!')
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('💥 Erro no checkout:', err)
      console.error('📋 Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        personalData: !!personalData,
        planData: !!planData
      })
      setError(errorMessage || 'Erro ao processar. Tente novamente.')
    } finally {
      setIsLoading(false)
      console.log('🏁 handleFinalSubmit finalizado')
    }
  }

  const planDetails = {
    basic: {
      name: 'Básico',
      price: 49.90,
      originalPrice: 59.90,
      features: [
        'Até 3 anúncios ativos',
        'Relatórios básicos',
        'Suporte por email',
        'Remove marca d\'água'
      ],
      badge: 'Mais Popular'
    },
    premium: {
      name: 'Premium',
      price: 79.90,
      originalPrice: 99.90,
      features: [
        'Até 5 anúncios ativos',
        'Anúncios destacados ilimitados',
        'Até 10 fotos por anúncio',
        'Relatórios avançados',
        'Dashboard personalizado'
      ],
      badge: 'Profissional'
    }
  }

  const goBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as RegisterStep)
    }
  }

  // Step 1 - Dados Pessoais
  if (currentStep === 1) {
    return (
      <div className="space-y-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div className="ml-2 text-sm font-medium text-blue-600 hidden sm:block">Dados Pessoais</div>
            </div>
            
            {/* Connector */}
            <div className="w-8 sm:w-12 h-1 bg-gray-200 rounded mx-2 sm:mx-4"></div>
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</div>
              <div className="ml-2 text-sm text-gray-500 hidden sm:block">Plano</div>
            </div>
            
            {/* Connector */}
            <div className="w-8 sm:w-12 h-1 bg-gray-200 rounded mx-2 sm:mx-4"></div>
            
            {/* Step 3 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</div>
              <div className="ml-2 text-sm text-gray-500 hidden sm:block">Confirmação</div>
            </div>
          </div>
          
          {/* Mobile labels */}
          <div className="flex justify-center mt-3 sm:hidden">
            <div className="text-xs text-blue-600 font-medium">Etapa 1 de 3: Dados Pessoais</div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Crie sua Conta</h2>
          <p className="text-lg text-gray-600">Preencha suas informações para começar</p>
          <p className="text-sm text-gray-500 mt-2">Já terá acesso a milhares de organizadores de eventos</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={personalForm.handleSubmit(handleStep1Submit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormField
              label="Nome completo"
              type="text"
              placeholder="Digite seu nome completo"
              error={personalForm.formState.errors.fullName}
              required
              {...personalForm.register('fullName')}
            />

            <FormField
              label="Email"
              type="email"
              placeholder="seu@email.com"
              error={personalForm.formState.errors.email}
              required
              {...personalForm.register('email')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Senha"
              type="password"
              placeholder="••••••••"
              error={personalForm.formState.errors.password}
              required
              showPasswordToggle
              {...personalForm.register('password')}
            />

            <FormField
              label="Confirmar senha"
              type="password"
              placeholder="••••••••"
              error={personalForm.formState.errors.confirmPassword}
              required
              showPasswordToggle
              {...personalForm.register('confirmPassword')}
            />
          </div>

          <FormField
            label="Telefone/WhatsApp"
            type="tel"
            placeholder="(11) 99999-9999"
            error={personalForm.formState.errors.phone}
            required
            {...personalForm.register('phone', {
              onChange: (e) => {
                e.target.value = formatPhone(e.target.value)
              }
            })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Estado"
              options={brazilianStates.map(state => ({
                value: state.code,
                label: state.name
              }))}
              error={personalForm.formState.errors.state}
              required
              placeholder="Selecione o estado"
              {...personalForm.register('state')}
            />

            <FormField
              label="Cidade"
              type="text"
              placeholder="Nome da cidade"
              error={personalForm.formState.errors.city}
              required
              {...personalForm.register('city')}
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                {...personalForm.register('acceptTerms')}
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="text-gray-600">
                Aceito os{' '}
                <Link
                  to="/termos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-500 font-medium underline"
                >
                  termos de uso (v{DOCUMENT_VERSIONS.terms_of_service})
                </Link>{' '}
                e{' '}
                <Link
                  to="/privacidade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-500 font-medium underline"
                >
                  política de privacidade (v{DOCUMENT_VERSIONS.privacy_policy})
                </Link>
              </label>
              {personalForm.formState.errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{personalForm.formState.errors.acceptTerms.message}</p>
              )}
            </div>
          </div>

          <FormButton
            type="submit"
            disabled={!personalForm.formState.isValid}
            fullWidth
            size="lg"
            className="py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <div className="flex items-center justify-center gap-2">
              Continuar
              <ArrowRight className="w-5 h-5" />
            </div>
          </FormButton>
        </form>

        <div className="text-center pt-4">
          <span className="text-sm text-gray-500">Já tem uma conta? </span>
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
          >
            Fazer login
          </Link>
        </div>
        
        {/* Trust indicators */}
        <div className="bg-gray-50 rounded-xl p-6 mt-6">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">🔒 Por que escolher o EventSpace?</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl">💰</div>
              <div className="text-sm font-medium text-gray-900">0% Comissão</div>
              <div className="text-xs text-gray-600">Você fica com 100%</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl">👥</div>
              <div className="text-sm font-medium text-gray-900">Contato Direto</div>
              <div className="text-xs text-gray-600">Sem intermediários</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl">🚀</div>
              <div className="text-sm font-medium text-gray-900">Sem Fidelidade</div>
              <div className="text-xs text-gray-600">Cancele quando quiser</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2 - Seleção de Plano
  if (currentStep === 2) {
    const selectedPlan = planForm.watch('planType')

    return (
      <div className="space-y-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
              <div className="ml-2 text-sm font-medium text-green-600 hidden sm:block">Dados Pessoais</div>
            </div>
            
            {/* Connector */}
            <div className="w-8 sm:w-12 h-1 bg-green-600 rounded mx-2 sm:mx-4"></div>
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div className="ml-2 text-sm font-medium text-blue-600 hidden sm:block">Plano</div>
            </div>
            
            {/* Connector */}
            <div className="w-8 sm:w-12 h-1 bg-gray-200 rounded mx-2 sm:mx-4"></div>
            
            {/* Step 3 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</div>
              <div className="ml-2 text-sm text-gray-500 hidden sm:block">Confirmação</div>
            </div>
          </div>
          
          {/* Mobile labels */}
          <div className="flex justify-center mt-3 sm:hidden">
            <div className="text-xs text-blue-600 font-medium">Etapa 2 de 3: Escolha seu Plano</div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Escolha seu Plano</h2>
          <p className="text-lg text-gray-600">Selecione o plano que melhor atende suas necessidades</p>
          <p className="text-sm text-gray-500 mt-2">Cobrança mensal • Cancele quando quiser</p>
        </div>

        <form onSubmit={planForm.handleSubmit(handleStep2Submit)} className="space-y-8">
          {/* Seleção de Planos */}
          <div className="space-y-6">
            {Object.entries(planDetails).map(([key, plan]) => (
              <label key={key} className="cursor-pointer block">
                <input
                  type="radio"
                  value={key}
                  className="sr-only"
                  {...planForm.register('planType')}
                />
                <div className={`relative border-2 rounded-xl p-6 transition-all duration-200 ${
                  selectedPlan === key 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}>
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        key === 'basic' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    {/* Ícone */}
                    <div className={`w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center ${
                      selectedPlan === key ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Crown className={`w-7 h-7 ${
                        selectedPlan === key ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    {/* Conteúdo principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-bold text-gray-900">
                              R$ {plan.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-gray-600 text-sm">/mês</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs line-through text-gray-400">
                              R$ {plan.originalPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-green-600 text-xs font-medium">
                              -R$ {(plan.originalPrice - plan.price).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                        
                        {/* Indicador de seleção */}
                        <div className="flex-shrink-0">
                          {selectedPlan === key ? (
                            <div className="inline-flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              <Check className="w-3 h-3" />
                              Selecionado
                            </div>
                          ) : (
                            <div className="inline-flex items-center justify-center w-6 h-6 border-2 border-gray-300 rounded-full">
                              <div className="w-2 h-2 border border-gray-400 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Features em grid compacto */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-1">
                            <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-xs leading-tight">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <FormButton
              type="button"
              onClick={goBackStep}
              variant="outline"
              className="flex-1 py-4"
              size="lg"
            >
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </div>
            </FormButton>
            <FormButton
              type="submit"
              disabled={!planForm.formState.isValid}
              className="flex-1 py-4"
              size="lg"
            >
              <div className="flex items-center justify-center gap-2">
                Continuar
                <ArrowRight className="w-5 h-5" />
              </div>
            </FormButton>
          </div>
        </form>
        
        {/* Trust indicators */}
        <div className="bg-gray-50 rounded-xl p-6 mt-8">
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">🔒 Seus dados estão seguros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Pagamento seguro via Stripe</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Cancele quando quiser</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 3 - Resumo e Confirmação
  if (currentStep === 3 && personalData && planData) {
    const selectedPlanDetails = planDetails[planData.planType]
    const price = selectedPlanDetails.price

    return (
      <div className="space-y-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
              <div className="ml-2 text-sm font-medium text-green-600 hidden sm:block">Dados Pessoais</div>
            </div>
            
            {/* Connector */}
            <div className="w-8 sm:w-12 h-1 bg-green-600 rounded mx-2 sm:mx-4"></div>
            
            {/* Step 2 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">✓</div>
              <div className="ml-2 text-sm font-medium text-green-600 hidden sm:block">Plano</div>
            </div>
            
            {/* Connector */}
            <div className="w-8 sm:w-12 h-1 bg-blue-600 rounded mx-2 sm:mx-4"></div>
            
            {/* Step 3 */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div className="ml-2 text-sm font-medium text-blue-600 hidden sm:block">Confirmação</div>
            </div>
          </div>
          
          {/* Mobile labels */}
          <div className="flex justify-center mt-3 sm:hidden">
            <div className="text-xs text-blue-600 font-medium">Etapa 3 de 3: Confirmação</div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Quase Lá! 🎉</h2>
          <p className="text-lg text-gray-600">Revise suas informações antes de finalizar</p>
        </div>

        {/* Resumo dos dados */}
        <div className="space-y-6">
          {/* Dados Pessoais */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                👤
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Seus Dados</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="border-b border-gray-100 pb-3">
                <div className="text-sm text-gray-600 mb-1">Nome completo</div>
                <div className="font-medium text-gray-900">{personalData.fullName}</div>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <div className="font-medium text-gray-900 break-all">{personalData.email}</div>
              </div>
              <div className="border-b border-gray-100 pb-3">
                <div className="text-sm text-gray-600 mb-1">Telefone</div>
                <div className="font-medium text-gray-900">{personalData.phone}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Localização</div>
                <div className="font-medium text-gray-900">{personalData.city}, {personalData.state}</div>
              </div>
            </div>
          </div>

          {/* Plano Selecionado */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Plano Escolhido</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-gray-900">{selectedPlanDetails.name}</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {selectedPlanDetails.badge}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Preço */}
            <div className="bg-white/60 rounded-lg p-4 mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-gray-600">/mês</span>
                <span className="text-sm line-through text-gray-400 ml-2">
                  R$ {selectedPlanDetails.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="text-green-600 text-sm font-medium">
                💰 Economize R$ {(selectedPlanDetails.originalPrice - price).toFixed(2).replace('.', ',')} por mês
              </div>
            </div>
            
            {/* Features resumidas */}
            <div className="bg-white/60 rounded-lg p-4">
              <div className="text-sm text-gray-700 font-medium mb-3">✨ Principais recursos inclusos:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedPlanDetails.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
              {selectedPlanDetails.features.length > 4 && (
                <div className="text-blue-600 text-sm mt-2 font-medium">
                  + {selectedPlanDetails.features.length - 4} recursos adicionais
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações de pagamento */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💳</div>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Próximo Passo: Pagamento</h3>
              <p className="text-yellow-800 text-sm mb-3">
                Você será redirecionado para o checkout seguro do Stripe para finalizar o pagamento.
                Sua conta será criada automaticamente após a confirmação do pagamento.
              </p>
              <div className="flex items-center gap-4 text-xs text-yellow-700">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>SSL Seguro</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Dados Criptografados</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cancele Quando Quiser</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-red-500">⚠️</div>
              <div>
                <p className="font-medium text-red-800 mb-1">Erro ao processar</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <FormButton
            type="button"
            onClick={goBackStep}
            variant="outline"
            className="flex-1 py-4"
            size="lg"
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </div>
          </FormButton>
          <FormButton
            type="button"
            onClick={handleFinalSubmit}
            disabled={isLoading}
            className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Redirecionando para pagamento...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🚀 Finalizar e Pagar</span>
              </div>
            )}
          </FormButton>
        </div>
      </div>
    )
  }

  return null
}