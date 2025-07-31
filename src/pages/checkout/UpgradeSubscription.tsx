import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Crown, Check, Calculator, Zap, Star, Shield, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscriptionService, type Subscription } from '@/services/subscriptionService'
import { paymentService } from '@/services/paymentService'

export default function UpgradeSubscription() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subscriptionId = searchParams.get('subscription_id')

  useEffect(() => {
    const loadSubscription = async () => {
      if (!profile?.id) {
        navigate('/login?redirect=/checkout/upgrade')
        return
      }

      try {
        const activeSubscription = await subscriptionService.getUserActiveSubscription(profile.id)
        
        // Se não há assinatura no Stripe mas usuário tem plano básico, criar objeto fake
        if (!activeSubscription && profile.plan_type === 'basic') {
          const fakeSubscription: Subscription = {
            id: 'profile-based',
            user_id: profile.id,
            stripe_subscription_id: '',
            stripe_customer_id: '',
            stripe_price_id: '',
            plan_type: 'basic',
            billing_cycle: 'monthly',
            status: 'active',
            amount: 49.90,
            currency: 'BRL',
            current_period_start: new Date().toISOString(),
            current_period_end: profile.plan_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
          setSubscription(fakeSubscription)
          return
        }
        
        if (!activeSubscription) {
          navigate('/dashboard/configuracoes?tab=subscription&error=no_subscription')
          return
        }

        // Verificar se já é premium
        if (activeSubscription.plan_type === 'premium') {
          navigate('/dashboard/configuracoes?tab=subscription&error=already_premium')
          return
        }

        setSubscription(activeSubscription)
      } catch (error) {
        console.error('Error loading subscription:', error)
        setError('Erro ao carregar dados da assinatura')
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [profile?.id, subscriptionId, navigate])

  const calculateProRating = () => {
    if (!subscription) return { proRatedAmount: 0, daysRemaining: 0 }
    
    const now = new Date()
    const periodEnd = new Date(subscription.current_period_end)
    const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    
    // Diferença de preço: R$ 79,90 - R$ 49,90 = R$ 30,00
    const priceDifference = 79.90 - 49.90
    
    // Cálculo proporcional baseado nos dias restantes
    const totalDaysInMonth = 30
    const proRatedAmount = (priceDifference * daysRemaining) / totalDaysInMonth
    
    return { proRatedAmount, daysRemaining }
  }

  const handleUpgrade = async () => {
    if (!subscription || !profile) return

    setUpgrading(true)
    setError(null)

    try {
      let success = false
      
      // Se é uma assinatura baseada apenas no perfil (sem dados do Stripe)
      if (subscription.id === 'profile-based') {
        // Redirecionar para checkout normal
        navigate('/checkout?plan=premium&billing=monthly&upgrade=true')
        return
      } else {
        // Upgrade via Stripe - implementar quando tiver a função no service
        success = await subscriptionService.upgradeSubscription(subscription.id, 'premium')
      }
      
      if (success) {
        navigate('/checkout/upgrade-success?plan=premium')
      } else {
        setError('Não foi possível fazer o upgrade. Tente novamente ou entre em contato com o suporte.')
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      setError('Erro inesperado ao fazer upgrade. Tente novamente.')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados da assinatura...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma assinatura ativa</h1>
          <p className="text-gray-600 mb-6">Não encontramos uma assinatura ativa para fazer upgrade.</p>
          <button
            onClick={() => navigate('/dashboard/configuracoes?tab=subscription')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Voltar às Configurações
          </button>
        </div>
      </div>
    )
  }

  const { proRatedAmount, daysRemaining } = calculateProRating()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/configuracoes?tab=subscription')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upgrade para Premium</h1>
            <p className="text-gray-600">Desbloqueie todos os recursos avançados</p>
          </div>
        </div>

        {/* Current Plan Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Plano Atual</h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Plano Básico</p>
                <p className="text-sm text-gray-700">
                  Válido até {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">R$ 49,90</p>
                <p className="text-sm text-gray-700">/mês</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Plan Preview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Novo Plano Premium</h2>
          </div>
          
          <div className="bg-primary-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary-900">Plano Premium</p>
                <p className="text-sm text-primary-700">Upgrade imediato com acesso total</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-900">R$ 79,90</p>
                <p className="text-sm text-primary-700">/mês</p>
              </div>
            </div>
          </div>

          {/* Premium Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Destaque ilimitado</p>
                <p className="text-sm text-gray-600">4x mais visitas nos seus anúncios</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">20 fotos por anúncio</p>
                <p className="text-sm text-gray-600">Mostre todos os detalhes dos seus espaços</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Analytics detalhados</p>
                <p className="text-sm text-gray-600">Relatórios completos e insights de mercado</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Dashboard personalizado</p>
                <p className="text-sm text-gray-600">Interface otimizada para seu negócio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Calculation */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cálculo do Upgrade</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Diferença mensal (R$ 79,90 - R$ 49,90)</span>
              <span className="font-medium">R$ 30,00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dias restantes no período atual</span>
              <span className="font-medium">{daysRemaining} dias</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-medium text-gray-900">Valor proporcional a pagar hoje</span>
              <span className="font-bold text-primary-600">R$ {proRatedAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Check className="w-4 h-4 inline mr-1" />
              O upgrade será aplicado imediatamente e você pagará apenas pelo tempo restante no período atual.
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard/configuracoes?tab=subscription')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleUpgrade}
            disabled={upgrading}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {upgrading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Crown className="w-4 h-4" />
            )}
            {upgrading ? 'Processando...' : `Fazer Upgrade - R$ ${proRatedAmount.toFixed(2)}`}
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-2">
            Dúvidas sobre o upgrade?
          </p>
          <button
            onClick={() => window.open('mailto:suporte@eventspace.com.br', '_blank')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Falar com o Suporte
          </button>
        </div>
      </div>
    </div>
  )
}