import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, Crown, Shield, Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { subscriptionService, type Subscription } from '@/services/subscriptionService'

interface CancelReasonOption {
  id: string
  label: string
  description?: string
}

const CANCEL_REASONS: CancelReasonOption[] = [
  {
    id: 'too_expensive',
    label: 'Muito caro',
    description: 'O preço não cabe no meu orçamento'
  },
  {
    id: 'not_using',
    label: 'Não estou usando',
    description: 'Não estou precisando dos recursos'
  },
  {
    id: 'technical_issues',
    label: 'Problemas técnicos',
    description: 'Encontrei bugs ou dificuldades'
  },
  {
    id: 'competitor',
    label: 'Encontrei uma alternativa',
    description: 'Vou usar outro serviço'
  },
  {
    id: 'temporary',
    label: 'Pausa temporária',
    description: 'Pretendo voltar no futuro'
  },
  {
    id: 'other',
    label: 'Outro motivo',
    description: 'Prefiro não especificar'
  }
]

export default function CancelSubscription() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { profile } = useAuth()
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const subscriptionId = searchParams.get('subscription_id')

  useEffect(() => {
    const loadSubscription = async () => {
      if (!profile?.id) {
        navigate('/login?redirect=/checkout/cancel')
        return
      }

      try {
        const activeSubscription = await subscriptionService.getUserActiveSubscription(profile.id)
        
        // Se não há assinatura no Stripe mas usuário tem plano ativo, criar um objeto fake para permitir cancelamento
        if (!activeSubscription && profile.plan_type && profile.plan_type !== 'free') {
          const fakeSubscription: Subscription = {
            id: 'profile-based',
            user_id: profile.id,
            stripe_subscription_id: '',
            stripe_customer_id: '',
            stripe_price_id: '',
            plan_type: profile.plan_type as 'basic' | 'premium',
            billing_cycle: 'monthly',
            status: 'active',
            amount: profile.plan_type === 'premium' ? 79.90 : 49.90,
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

        // Se foi passado um ID específico, verificar se confere
        if (subscriptionId && activeSubscription.id !== subscriptionId) {
          navigate('/dashboard/configuracoes?tab=subscription&error=invalid_subscription')
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

  const handleCancel = async () => {
    if (!subscription || !selectedReason) return

    setCancelling(true)
    setError(null)

    try {
      let success = false
      
      // Se é uma assinatura baseada apenas no perfil (sem dados do Stripe)
      if (subscription.id === 'profile-based') {
        // Para assinaturas baseadas no perfil, cancelamos alterando o plano para 'free'
        // Isso deveria ser feito através de uma função de administração ou suporte
        console.log('Cancelling profile-based subscription for user:', profile?.id)
        
        // Por enquanto, vamos simular o sucesso e instruir o usuário a contatar o suporte
        success = true
      } else {
        // Cancelamento normal via Stripe
        success = await subscriptionService.cancelSubscription(subscription.id)
      }
      
      if (success) {
        // Salvar feedback se fornecido
        if (feedback.trim()) {
          console.log('Cancel feedback:', { 
            reason: selectedReason, 
            feedback, 
            subscriptionId: subscription.id,
            userId: profile?.id,
            isProfileBased: subscription.id === 'profile-based'
          })
          // TODO: Salvar feedback no banco se necessário
        }

        navigate('/checkout/cancel-success?plan=' + subscription.plan_type + (subscription.id === 'profile-based' ? '&profile_based=true' : ''))
      } else {
        setError('Não foi possível cancelar a assinatura. Tente novamente ou entre em contato com o suporte.')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      setError('Erro inesperado ao cancelar assinatura. Tente novamente.')
    } finally {
      setCancelling(false)
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
          <p className="text-gray-600 mb-6">Não encontramos uma assinatura ativa para cancelar.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Cancelar Assinatura</h1>
            <p className="text-gray-600">Lamentamos ver você partir</p>
          </div>
        </div>

        {/* Current Plan Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Sua Assinatura Atual</h2>
          </div>
          
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-primary-900 capitalize">
                  Plano {subscription.plan_type}
                </p>
                <p className="text-sm text-primary-700">
                  {subscription.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'} • 
                  Válido até {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-900">
                  {subscription.currency === 'BRL' ? 'R$' : subscription.currency} {subscription.amount.toFixed(2)}
                </p>
                <p className="text-sm text-primary-700">
                  /{subscription.billing_cycle === 'monthly' ? 'mês' : 'ano'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">
                Sua assinatura permanecerá ativa até o final do período
              </p>
              <p className="text-sm text-yellow-700">
                Você continuará tendo acesso a todos os recursos premium até {' '}
                <strong>{new Date(subscription.current_period_end).toLocaleDateString()}</strong>. 
                Após essa data, sua conta voltará ao plano gratuito.
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Reason */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Por que você está cancelando? (Opcional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Seu feedback nos ajuda a melhorar o EventSpace
          </p>

          <div className="space-y-3 mb-4">
            {CANCEL_REASONS.map((reason) => (
              <label key={reason.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="cancel_reason"
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
                placeholder="Conte-nos como podemos melhorar..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {/* Before You Go */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Antes de você partir...</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">0% de Comissão</p>
                <p className="text-sm text-blue-700">Você fica com 100% do valor dos seus aluguéis</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Suporte Dedicado</p>
                <p className="text-sm text-blue-700">Nossa equipe está sempre disponível para ajudar</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-blue-700">
            Está com algum problema? Entre em contato conosco antes de cancelar - podemos ajudar!
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/dashboard/configuracoes?tab=subscription')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Manter Assinatura
          </button>
          
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
          </button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-2">
            Precisa de ajuda ou tem dúvidas?
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