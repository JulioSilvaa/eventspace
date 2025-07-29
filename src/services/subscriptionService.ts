import { supabase } from '@/lib/supabase'

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  stripe_price_id: string
  plan_type: 'basic' | 'premium'
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

class SubscriptionService {
  async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active subscription:', error)
      return null
    }

    return data
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return []
    }

    return data || []
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // Get subscription data
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('id', subscriptionId)
        .single()

      if (fetchError || !subscription) {
        throw new Error('Subscription not found')
      }

      // Call Stripe API to cancel subscription
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdvsafxltfdzjspmsdla.supabase.co'
      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          stripeSubscriptionId: subscription.stripe_subscription_id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      return true
    } catch (error) {
      console.error('Error canceling subscription:', error)
      return false
    }
  }

  async reactivateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      // Get subscription data
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('id', subscriptionId)
        .single()

      if (fetchError || !subscription) {
        throw new Error('Subscription not found')
      }

      // Call Stripe API to reactivate subscription
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdvsafxltfdzjspmsdla.supabase.co'
      const response = await fetch(`${supabaseUrl}/functions/v1/reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          stripeSubscriptionId: subscription.stripe_subscription_id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription')
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

  getStatusBadge(status: Subscription['status']): { text: string; color: string } {
    const statusMap = {
      active: { text: 'Ativo', color: 'green' },
      canceled: { text: 'Cancelado', color: 'red' },
      past_due: { text: 'Em Atraso', color: 'yellow' },
      unpaid: { text: 'Não Pago', color: 'red' },
      incomplete: { text: 'Incompleto', color: 'gray' },
    }

    return statusMap[status] || { text: 'Desconhecido', color: 'gray' }
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
}

export const subscriptionService = new SubscriptionService()
export default subscriptionService