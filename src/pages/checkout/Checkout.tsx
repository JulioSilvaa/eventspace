import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CreditCard, Shield, Check, Crown, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { paymentService, type CreateCheckoutSessionParams } from '@/services/paymentService'
import { type PlanType, type BillingCycle } from '@/lib/stripe'

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { profile, user, isLoading: authLoading, isAuthenticated } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Get params from URL
  const plan = (searchParams.get('plan') || 'basic') as PlanType
  const billingCycle = (searchParams.get('billing') || 'monthly') as BillingCycle
  const isFromSignup = searchParams.get('signup') === 'true'
  const isRequired = searchParams.get('required') === 'true'

  const planDetails = {
    basic: {
      name: 'Básico',
      description: 'Ideal para proprietários que querem testar a plataforma',
      monthlyPrice: 49.90,
      yearlyPrice: 499.00,
      features: [
        '10 fotos profissionais por anúncio',
        'Relatórios de visualizações e contatos', 
        'Suporte por email (48h)',
        '✅ 0% de comissão sobre vendas'
      ]
    },
    premium: {
      name: 'Premium',
      description: 'Para negócios sérios que querem maximizar resultados',
      monthlyPrice: 79.90,
      yearlyPrice: 799.00,
      features: [
        'Destaque ilimitado (4x mais visitas)',
        '20 fotos profissionais por anúncio',
        'Relatórios detalhados e analytics',
        'Dashboard personalizado + insights',
        '✅ 0% de comissão sobre vendas'
      ]
    }
  }

  const selectedPlan = planDetails[plan as keyof typeof planDetails] || planDetails.basic
  const price = billingCycle === 'yearly' ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice
  const originalYearlyPrice = selectedPlan.monthlyPrice * 12
  const yearlyDiscount = originalYearlyPrice - selectedPlan.yearlyPrice

  // Handle authentication and profile loading
  useEffect(() => {
    // Wait for auth to initialize
    if (authLoading) return
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout')
      return
    }
    
    // If authenticated but no profile, this might be a newly registered user
    // Try to use user data from auth as fallback
    if (!profile && user) {
      console.warn('Profile not loaded, but user exists. This may be a newly registered user.')
      // We'll handle this in the payment function
    }
  }, [authLoading, isAuthenticated, profile, user, navigate])

  const handlePayment = async () => {
    // Debug logging
    console.log('Checkout Debug:', {
      authLoading,
      isAuthenticated,
      hasUser: !!user,
      hasProfile: !!profile,
      userId: user?.id,
      userEmail: user?.email,
      profileId: profile?.id,
      profileEmail: profile?.email
    })
    
    // We need both user (for email) and profile (for id) data
    if (!user?.id || !user?.email || !profile?.id) {
      console.error('No user data available:', { user, profile })
      setError('Usuário não encontrado. Tente atualizar a página ou fazer login novamente.')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const params: CreateCheckoutSessionParams = {
        planType: plan,
        billingCycle,
        userId: user.id,
        userEmail: user.email
      }

      // Redirect to Stripe Checkout for credit card payments
      await paymentService.createCheckoutSession(params)
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      // Provide more user-friendly error messages
      let userMessage = 'Erro ao processar pagamento. Tente novamente.'
      
      if (errorMessage.includes('fetch')) {
        userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else if (errorMessage.includes('session') || errorMessage.includes('Stripe')) {
        userMessage = 'Erro no sistema de pagamento. Tente novamente em alguns minutos.'
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
        userMessage = 'Sessão expirada. Faça login novamente.'
        setTimeout(() => navigate('/login?redirect=/checkout'), 2000)
      }
      
      setError(userMessage)
      
      // Navigate to error page for critical errors after a delay
      setTimeout(() => {
        if (errorMessage.includes('Stripe') || errorMessage.includes('session')) {
          navigate(`/checkout/error?error=payment_failed&plan=${plan}&message=${encodeURIComponent(errorMessage)}`)
        }
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do usuário...</p>
        </div>
      </div>
    )
  }
  
  // Show a warning if user exists but profile is missing
  if (isAuthenticated && user && !profile) {
    console.warn('User authenticated but profile not loaded. Proceeding with user data.')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finalizar Pagamento</h1>
            <p className="text-gray-600">Complete seu upgrade para o EventSpace {selectedPlan.name}</p>
          </div>
        </div>

        {/* Welcome message for new signups */}
        {isFromSignup && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-green-900">🎉 Conta criada com sucesso!</h3>
                <p className="text-green-700 text-sm">
                  Agora escolha um plano para ativar sua conta e começar a anunciar no EventSpace.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Required activation message */}
        {isRequired && !isFromSignup && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-orange-900">🔒 Ativação necessária</h3>
                <p className="text-orange-700 text-sm">
                  Para acessar o dashboard e criar anúncios, você precisa ativar sua conta com um plano pago.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
              
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg mb-4">
                <Crown className="w-6 h-6 text-blue-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Plano {selectedPlan.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{selectedPlan.description}</p>
                  <p className="text-xs text-gray-500">
                    {billingCycle === 'yearly' ? 'Cobrança anual' : 'Cobrança mensal'}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    R$ {price.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-gray-500">
                    /{billingCycle === 'yearly' ? 'ano' : 'mês'}
                  </p>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-green-600">
                      Economize R$ {yearlyDiscount.toFixed(2).replace('.', ',')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Finalizar Pagamento</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <p className="font-medium text-blue-900">Pagamento Seguro via Stripe</p>
                </div>
                <p className="text-sm text-blue-700">
                  Você será redirecionado para o checkout seguro do Stripe onde poderá pagar com cartão de crédito (Visa, Mastercard, Elo).
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-red-500 mt-0.5">
                    ⚠️
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">Ops! Algo deu errado</p>
                    <p className="text-sm text-red-700">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Redirecionando para o Stripe...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Pagar R$ {price.toFixed(2).replace('.', ',')} com Segurança
                </div>
              )}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Por que EventSpace?</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">0% Comissão</p>
                    <p className="text-sm text-gray-600">Você fica com 100% do valor dos aluguéis</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Contato Direto</p>
                    <p className="text-sm text-gray-600">Clientes entram em contato diretamente com você</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Sem Fidelidade</p>
                    <p className="text-sm text-gray-600">Cancele quando quiser, sem multa</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Suporte Dedicado</p>
                    <p className="text-sm text-gray-600">Nossa equipe está sempre disponível</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Impostos:</span>
                  <span className="font-medium">Inclusos</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-xl text-gray-900">
                    R$ {price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}