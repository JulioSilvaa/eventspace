import { useState, useEffect, useCallback } from 'react'
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { subscriptionService, type Subscription } from '@/services/subscriptionService'
import { useAuth } from '@/hooks/useAuth'

export default function SubscriptionCard() {
  const { profile } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (profile?.id) {
      loadSubscription()
    }
  }, [profile?.id, loadSubscription])

  const loadSubscription = useCallback(async () => {
    if (!profile?.id) return
    
    try {
      const activeSubscription = await subscriptionService.getUserActiveSubscription(profile.id)
      setSubscription(activeSubscription)
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id])

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Ela permanecerá ativa até o final do período atual.')) {
      return
    }

    setActionLoading(true)
    try {
      const success = await subscriptionService.cancelSubscription(subscription.id)
      if (success) {
        await loadSubscription() // Reload to get updated data
        alert('Assinatura cancelada com sucesso. Ela permanecerá ativa até o final do período.')
      } else {
        alert('Erro ao cancelar assinatura. Tente novamente.')
      }
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Erro ao cancelar assinatura. Tente novamente.')
    } finally {
      setActionLoading(false)
    }
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

  if (!subscription) {
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
          <p className="text-gray-600 mb-4">Assine um plano para desbloquear todos os recursos.</p>
          <a
            href="/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Crown className="w-4 h-4" />
            Ver Planos
          </a>
        </div>
      </div>
    )
  }

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
          statusBadge.color === 'red' ? 'bg-red-100 text-red-800' :
          statusBadge.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {statusBadge.color === 'green' && <CheckCircle className="w-3 h-3" />}
          {statusBadge.color === 'red' && <XCircle className="w-3 h-3" />}
          {statusBadge.color === 'yellow' && <AlertTriangle className="w-3 h-3" />}
          {statusBadge.text}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-bold text-gray-900 capitalize">
            EventSpace {subscription.plan_type}
          </h4>
          <p className="text-gray-600">
            {subscriptionService.formatPrice(subscription.amount)} /{subscription.billing_cycle === 'yearly' ? 'ano' : 'mês'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Renovação</p>
              <p className="font-medium">
                {subscriptionService.formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-gray-500">Ciclo</p>
              <p className="font-medium capitalize">
                {subscription.billing_cycle === 'yearly' ? 'Anual' : 'Mensal'}
              </p>
            </div>
          </div>
        </div>

        {isActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              {daysUntilRenewal === 0 
                ? 'Sua assinatura renova hoje!' 
                : `Sua assinatura renova em ${daysUntilRenewal} ${daysUntilRenewal === 1 ? 'dia' : 'dias'}.`
              }
            </p>
          </div>
        )}

        {subscription.cancel_at_period_end && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700 mb-2">
              ⚠️ Sua assinatura será cancelada em {subscriptionService.formatDate(subscription.current_period_end)}
            </p>
            <button
              onClick={handleReactivateSubscription}
              disabled={actionLoading}
              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {actionLoading ? 'Reativando...' : 'Reativar Assinatura'}
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isActive && !subscription.cancel_at_period_end && (
            <button
              onClick={handleCancelSubscription}
              disabled={actionLoading}
              className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {actionLoading ? 'Cancelando...' : 'Cancelar Assinatura'}
            </button>
          )}
          
          <a
            href="/pricing"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Alterar Plano
          </a>
        </div>
      </div>
    </div>
  )
}