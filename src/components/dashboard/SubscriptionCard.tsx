import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { subscriptionService, type Subscription } from '@/services/subscriptionService'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface Payment {
  id: string
  plan_type: string
  amount: number
  currency: string
  payment_status: string
  created_at: string
  expires_at: string
}

export default function SubscriptionCard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const loadSubscription = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      
      // Try to load subscription data
      const activeSubscription = await subscriptionService.getUserActiveSubscription(profile.id)
      setSubscription(activeSubscription)

      // Also load payment history
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (paymentError) {
        console.warn('Error loading payment history:', paymentError)
        // Continue sem histórico de pagamentos se houver erro
      } else if (paymentData) {
        setPayments(paymentData)
      }
    } catch (error) {
      console.error('Error loading subscription data:', error)
      // Não impedir a renderização por causa de erros de dados
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  useEffect(() => {
    if (profile?.id) {
      loadSubscription()
    }
  }, [profile?.id, loadSubscription])

  const handleCancelSubscription = () => {
    if (!subscription) return
    
    // Redirecionar para a página de cancelamento
    navigate(`/checkout/cancel?subscription_id=${subscription.id}`)
  }

  const handleReactivateSubscription = async () => {
    if (!subscription) return
    
    setActionLoading(true)
    try {
      const success = await subscriptionService.reactivateSubscription(subscription.id)
      if (success) {
        await loadSubscription() // Reload to get updated data
        alert('Assinatura reativada com sucesso!')
      } else {
        alert('Erro ao reativar assinatura. Tente novamente.')
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      alert('Erro ao reativar assinatura. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  // No subscription found - show plan info from profile if available
  if (!subscription) {
    // Show plan info from profile if available
    if (profile?.plan_type && profile.plan_type !== 'free') {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Plano Atual</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary-600" />
                  <span className="font-semibold text-primary-900 capitalize">
                    Plano {profile.plan_type}
                  </span>
                </div>
                <p className="text-sm text-primary-700 mt-1">
                  Status: {profile.account_status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
                {profile.plan_expires_at && (
                  <p className="text-sm text-primary-700">
                    Expira em: {new Date(profile.plan_expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Detalhes da assinatura não disponíveis
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Os dados da sua assinatura do Stripe não estão sincronizados. Entre em contato com o suporte se precisar gerenciar sua assinatura.
                  </p>
                </div>
              </div>
            </div>

            {/* Plan Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                {profile.plan_type === 'basic' ? (
                  <button
                    onClick={() => navigate('/checkout/upgrade')}
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Fazer Upgrade para Premium
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/checkout/downgrade')}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Downgrade para Básico
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/planos')}
                  className="flex-1 border border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                >
                  Comparar Planos
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.open('/contato', '_blank')}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Contatar Suporte
                </button>
              </div>

              {/* Cancel button for users with active plan but no Stripe subscription data */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Gerenciar assinatura:</span>
                  <button
                    onClick={() => navigate('/checkout/cancel')}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancelar Assinatura
                  </button>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Histórico de Pagamentos</h4>
                <div className="space-y-2">
                  {payments.slice(0, 3).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            Plano {payment.plan_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.currency === 'BRL' ? 'R$' : payment.currency} {payment.amount.toFixed(2)}
                        </p>
                        <p className={`text-xs ${
                          payment.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {payment.payment_status === 'completed' ? 'Pago' : payment.payment_status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    // No subscription and no paid plan
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Plano Atual</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma Assinatura Ativa</h4>
          <p className="text-gray-600 mb-4">
            {profile?.plan_type === 'free' || !profile?.plan_type 
              ? 'Assine um plano para desbloquear todos os recursos.'
              : 'Não foi possível carregar os dados da sua assinatura.'}
          </p>
          
          {payments.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Últimos pagamentos:</p>
              <div className="space-y-1">
                {payments.slice(0, 2).map((payment) => (
                  <div key={payment.id} className="text-xs text-gray-500 flex justify-between">
                    <span>Plano {payment.plan_type}</span>
                    <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <a
              href="/planos"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              <Crown className="w-4 h-4" />
              Ver Planos
            </a>
            {payments.length > 0 && (
              <>
                <button
                  onClick={() => window.open('/contato', '_blank')}
                  className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Contatar Suporte
                </button>
                <button
                  onClick={() => navigate('/checkout/cancel')}
                  className="inline-flex items-center gap-2 border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Cancelar Assinatura
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If we have subscription data, show full subscription details
  const statusBadge = subscriptionService.getStatusBadge(subscription.status)
  const isActive = subscriptionService.isSubscriptionActive(subscription)
  const daysUntilRenewal = subscriptionService.daysUntilRenewal(subscription)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Plano Atual</h3>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          statusBadge.color === 'green' ? 'bg-green-100 text-green-800' :
          statusBadge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {statusBadge.icon}
          {statusBadge.text}
        </span>
      </div>

      <div className="space-y-6">
        {/* Plan Details */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900 capitalize">
                Plano {subscription.plan_type}
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {subscription.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-900">
              {subscription.currency === 'BRL' ? 'R$' : subscription.currency} {subscription.amount.toFixed(2)}
            </p>
            <p className="text-sm text-blue-700">
              /{subscription.billing_cycle === 'monthly' ? 'mês' : 'ano'}
            </p>
          </div>
        </div>

        {/* Billing Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Próxima cobrança</p>
            <p className="font-medium text-gray-900">
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Dias restantes</p>
            <p className="font-medium text-gray-900">{daysUntilRenewal} dias</p>
          </div>
        </div>

        {/* Status Messages */}
        {subscription.cancel_at_period_end && (
          <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Assinatura será cancelada
              </p>
              <p className="text-sm text-yellow-700">
                Sua assinatura permanecerá ativa até {new Date(subscription.current_period_end).toLocaleDateString()}.
              </p>
            </div>
          </div>
        )}

        {!isActive && subscription.status === 'past_due' && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Pagamento em atraso
              </p>
              <p className="text-sm text-red-700">
                Atualize seu método de pagamento para evitar a interrupção do serviço.
              </p>
            </div>
          </div>
        )}

        {/* Plan Actions */}
        <div className="space-y-4 pt-4 border-t">
          {/* Plan Change Options */}
          <div className="flex flex-col sm:flex-row gap-3">
            {subscription.plan_type === 'basic' ? (
              <button
                onClick={() => navigate('/checkout/upgrade')}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Fazer Upgrade para Premium
              </button>
            ) : (
              <button
                onClick={() => navigate('/checkout/downgrade')}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Downgrade para Básico
              </button>
            )}
            
            <button
              onClick={() => navigate('/planos')}
              className="flex-1 border border-primary-600 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
            >
              Comparar Planos
            </button>
          </div>

          {/* Subscription Management */}
          <div className="flex items-center justify-between text-sm">
            {subscription.cancel_at_period_end ? (
              <button
                onClick={handleReactivateSubscription}
                disabled={actionLoading}
                className="text-green-600 hover:text-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Reativando...' : 'Reativar Assinatura'}
              </button>
            ) : (
              <button
                onClick={handleCancelSubscription}
                className="text-red-600 hover:text-red-700"
              >
                Cancelar Assinatura
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}