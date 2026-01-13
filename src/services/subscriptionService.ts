import { apiClient } from '@/lib/api-client'

export interface Subscription {
  id: string
  user_id: string
  space_id?: string
  stripe_subscription_id: string
  stripe_customer_id: string
  stripe_price_id: string
  plan_type: string
  billing_cycle: 'monthly' | 'yearly'
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete'
  amount: number
  currency: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  created_at: string
  updated_at: string
}

interface SubscriptionResponse {
  subscription: Subscription
}

interface SubscriptionsListResponse {
  subscriptions: Subscription[]
}

class SubscriptionService {
  async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await apiClient.get<SubscriptionResponse>(
        `/api/subscription/user/${userId}`
      )

      if (error) {
        if (error.status === 404) {
          return null
        }
        console.error('Error fetching active subscription:', error)
        return null
      }

      return data?.subscription || null
    } catch (error) {
      console.error('Exception in getUserActiveSubscription:', error)
      return null
    }
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await apiClient.get<SubscriptionsListResponse>(
      `/api/subscription/user/${userId}/all`
    )

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return []
    }

    return data?.subscriptions || []
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await apiClient.patch(`/api/subscription/${subscriptionId}`, {
        cancel_at_period_end: true
      })

      if (error) {
        console.error('Failed to cancel subscription:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return false
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const { error } = await apiClient.patch(`/api/subscription/${subscriptionId}`, {
        cancel_at_period_end: false
      })

      if (error) {
        console.error('Failed to reactivate subscription:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      return false
    }
  }

  formatPrice(amount: number, currency: string = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  getStatusBadge(status: Subscription['status']): { text: string; color: string; icon: string } {
    const statusMap = {
      active: { text: 'Ativo', color: 'green', icon: '✓' },
      canceled: { text: 'Cancelado', color: 'red', icon: '✕' },
      past_due: { text: 'Em Atraso', color: 'yellow', icon: '⚠' },
      unpaid: { text: 'Não Pago', color: 'red', icon: '✕' },
      incomplete: { text: 'Incompleto', color: 'gray', icon: '○' },
    }

    return statusMap[status] || { text: 'Desconhecido', color: 'gray', icon: '?' }
  }

  isSubscriptionActive(subscription: Subscription): boolean {
    return (
      subscription.status === 'active' &&
      new Date(subscription.current_period_end) > new Date()
    )
  }

  daysUntilRenewal(subscription: Subscription): number {
    const now = new Date()
    const endDate = new Date(subscription.current_period_end)
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  async upgradeSubscription(subscriptionId: string, newPlanType: string): Promise<boolean> {
    try {
      const { error } = await apiClient.patch(`/api/subscription/${subscriptionId}/upgrade`, {
        plan_type: newPlanType,
        prorate: true
      })

      if (error) {
        console.error('Failed to upgrade subscription:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      return false
    }
  }

  async downgradeSubscription(subscriptionId: string, newPlanType: string): Promise<boolean> {
    try {
      const { error } = await apiClient.patch(`/api/subscription/${subscriptionId}/downgrade`, {
        plan_type: newPlanType,
        at_period_end: true
      })

      if (error) {
        console.error('Failed to downgrade subscription:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error downgrading subscription:', error)
      return false
    }
  }

  calculateProRating(
    currentPlan: string,
    newPlan: string,
    daysRemaining: number,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): number {
    const planPrices: Record<string, { monthly: number, yearly: number }> = {
      basic: { monthly: 49.90, yearly: 499.00 },
      premium: { monthly: 79.90, yearly: 799.00 },
      pro: { monthly: 49.90, yearly: 499.00 }
    }

    const currentPrice = planPrices[currentPlan]?.[billingCycle] || 0
    const newPrice = planPrices[newPlan]?.[billingCycle] || 0
    const priceDifference = newPrice - currentPrice

    if (priceDifference <= 0) return 0

    const totalDaysInPeriod = billingCycle === 'monthly' ? 30 : 365
    return (priceDifference * daysRemaining) / totalDaysInPeriod
  }

  async getSubscriptionChanges(userId: string): Promise<unknown[]> {
    try {
      const { data, error } = await apiClient.get<{ changes: unknown[] }>(
        `/api/subscription/user/${userId}/changes`
      )

      if (error) {
        console.error('Error fetching subscription changes:', error)
        return []
      }

      return data?.changes || []
    } catch (error) {
      console.error('Exception in getSubscriptionChanges:', error)
      return []
    }
  }
  async createCheckoutSession(spaceId: string, interval?: 'month' | 'year' | 'activation'): Promise<string | null> {
    try {
      console.log(`📡 [SubscriptionService] Creating checkout session for space: ${spaceId}, interval: ${interval}`);
      const { data, error } = await apiClient.post<{ url: string }>(
        '/api/subscription/checkout', { spaceId, interval }
      );
      if (error) {
        console.error('❌ [SubscriptionService] Error creating checkout session:', error);
        return null;
      }
      console.log('✅ [SubscriptionService] Checkout session created successfully:', data?.url ? 'URL present' : 'No URL');
      return data?.url || null;
    } catch (error) {
      console.error('❌ [SubscriptionService] Exception in createCheckoutSession:', error);
      return null;
    }
  }

  async getCurrentPricing(): Promise<{ plan_type: string; price: number; spots_remaining: number; message: string } | null> {
    try {
      const { data, error } = await apiClient.get<{ plan_type: string; price: number; spots_remaining: number; message: string }>(
        '/api/subscription/current-pricing'
      )

      if (error) {
        console.error('Failed to get current pricing:', error)
        return null
      }

      return data || null
    } catch (error) {
      console.error('Error fetching pricing:', error)
      return null
    }
  }
}


export const subscriptionService = new SubscriptionService()
export default subscriptionService