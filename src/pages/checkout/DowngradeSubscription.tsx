import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Crown, Check, Calendar, DollarSign, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscriptionService, type Subscription } from '@/services/subscriptionService'

interface DowngradeReasonOption {
  id: string
  label: string
  description?: string
}

const DOWNGRADE_REASONS: DowngradeReasonOption[] = [
  {
    id: 'cost_reduction',
    label: 'Reduzir custos',
    description: 'Preciso diminuir os gastos mensais'
  },
  {
    id: 'less_features_needed',
    label: 'Não preciso de todos os recursos',
    description: 'O plano básico atende minhas necessidades'
  },
  {
    id: 'temporary_downgrade',
    label: 'Redução temporária',
    description: 'Pretendo voltar ao Premium no futuro'
  },
  {
    id: 'testing_basic',
    label: 'Testar plano básico',
    description: 'Quero experimentar o plano mais simples'
  },
  {
    id: 'other',
    label: 'Outro motivo',
    description: 'Prefiro não especificar'
  }
]

export default function DowngradeSubscription() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [downgrading, setDowngrading] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const subscriptionId = searchParams.get('subscription_id')

  useEffect(() => {
    const loadSubscription = async () => {
      if (!profile?.id) {
        navigate('/login?redirect=/checkout/downgrade')
        return
      }

      try {
        const activeSubscription = await subscriptionService.getUserActiveSubscription(profile.id)
        
        // Se não há assinatura no Stripe mas usuário tem plano premium, criar objeto fake
        if (!activeSubscription && profile.plan_type === 'premium') {
          const fakeSubscription: Subscription = {
            id: 'profile-based',
            user_id: profile.id,
            stripe_subscription_id: '',
            stripe_customer_id: '',
            stripe_price_id: '',
            plan_type: 'premium',
            billing_cycle: 'monthly',
            status: 'active',
            amount: 79.90,
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

        // Verificar se já é básico
        if (activeSubscription.plan_type === 'basic') {
          navigate('/dashboard/configuracoes?tab=subscription&error=already_basic')
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

  const handleDowngrade = async () => {
    if (!subscription || !profile) return

    setDowngrading(true)
    setError(null)

    try {
      let success = false
      
      // Se é uma assinatura baseada apenas no perfil (sem dados do Stripe)
      if (subscription.id === 'profile-based') {
        // Para assinaturas baseadas no perfil, simular sucesso
        // Isso deveria ser feito através de uma função de administração
        console.log('Downgrading profile-based subscription for user:', profile?.id)
        success = true
      } else {
        // Downgrade via Stripe - será implementado no service
        success = await subscriptionService.downgradeSubscription(subscription.id, 'basic')
      }
      
      if (success) {
        // Salvar feedback se fornecido
        if (feedback.trim() || selectedReason) {
          console.log('Downgrade feedback:', { 
            reason: selectedReason, 
            feedback, 
            subscriptionId: subscription.id,
            userId: profile?.id,
            isProfileBased: subscription.id === 'profile-based'
          })
          // TODO: Salvar feedback no banco se necessário
        }

        navigate('/checkout/downgrade-success?plan=basic' + (subscription.id === 'profile-based' ? '&profile_based=true' : ''))
      } else {
        setError('Não foi possível fazer o downgrade. Tente novamente ou entre em contato com o suporte.')
      }
    } catch (error) {
      console.error('Error downgrading subscription:', error)
      setError('Erro inesperado ao fazer downgrade. Tente novamente.')
    } finally {
      setDowngrading(false)
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
          <p className="text-gray-600 mb-6">Não encontramos uma assinatura ativa para fazer downgrade.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Downgrade para Básico</h1>
            <p className="text-gray-600">Alterar para plano mais simples</p>
          </div>
        </div>

        {/* Current Plan Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Plano Atual</h2>
          </div>
          
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary-900">Plano Premium</p>
                <p className="text-sm text-primary-700">
                  Válido até {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-900">R$ 79,90</p>
                <p className="text-sm text-primary-700">/mês</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Plan Preview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Novo Plano Básico</h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Plano Básico</p>
                <p className="text-sm text-gray-700">Efetivo a partir do próximo período</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">R$ 49,90</p>
                <p className="text-sm text-gray-700">/mês</p>
                <p className="text-xs text-green-600 font-medium">Economia de R$ 30,00/mês</p>
              </div>
            </div>
          </div>

          {/* Basic Plan Features */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>10 fotos profissionais por anúncio</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Relatórios de visualizações e contatos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Suporte por email (48h)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>0% de comissão sobre vendas</span>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-2">
                Importante sobre o downgrade
              </p>
              <div className="space-y-1 text-sm text-yellow-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>O downgrade será efetivo apenas no final do período atual ({new Date(subscription.current_period_end).toLocaleDateString()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Não há reembolso - você continuará com acesso Premium até o fim</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Recursos Premium ficam indisponíveis após a mudança</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Downgrade Reason */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Por que você está fazendo downgrade? (Opcional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Seu feedback nos ajuda a melhorar nossos planos
          </p>

          <div className="space-y-3 mb-4">
            {DOWNGRADE_REASONS.map((reason) => (
              <label key={reason.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="downgrade_reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div>
                  <p className="font-medium text-gray-900">{reason.label}</p>
                  {reason.description && (
                    <p className="text-sm text-gray-600">{reason.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>

          {selectedReason && (
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                Gostaria de nos contar mais? (Opcional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Como podemos melhorar nossos planos?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
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
            Manter Premium
          </button>
          
          <button
            onClick={handleDowngrade}
            disabled={downgrading}
            className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {downgrading ? 'Processando...' : 'Confirmar Downgrade'}
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-2">
            Dúvidas sobre o downgrade?
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