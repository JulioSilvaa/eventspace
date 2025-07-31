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
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('current_period_end', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error fetching active subscription:', error)
        return null
      }

      // Return first item or null if no results
      return data && data.length > 0 ? data[0] : null
    } catch (error) {
      console.error('Exception in getUserActiveSubscription:', error)
      return null
    }
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

  getStatusBadge(status: Subscription['status']): { text: string; color: string; icon: React.ReactNode } {
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

  // Upgrade subscription to a higher plan
  async upgradeSubscription(subscriptionId: string, newPlanType: 'basic' | 'premium'): Promise<boolean> {
    try {
      // Get subscription data
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single()

      if (fetchError || !subscription) {
        throw new Error('Subscription not found')
      }

      // Validate upgrade (can only upgrade to higher tier)
      if (subscription.plan_type === 'premium') {
        throw new Error('Already on highest plan')
      }

      if (newPlanType !== 'premium') {
        throw new Error('Invalid upgrade target')
      }

      // Call Stripe API to upgrade subscription with proration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdvsafxltfdzjspmsdla.supabase.co'
      const response = await fetch(`${supabaseUrl}/functions/v1/upgrade-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          stripeSubscriptionId: subscription.stripe_subscription_id,
          newPlanType,
          prorate: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to upgrade subscription')
      }

      return true
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      return false
    }
  }

  // Downgrade subscription to a lower plan
  async downgradeSubscription(subscriptionId: string, newPlanType: 'basic' | 'premium'): Promise<boolean> {
    try {
      // Get subscription data
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single()

      if (fetchError || !subscription) {
        throw new Error('Subscription not found')
      }

      // Validate downgrade (can only downgrade to lower tier)
      if (subscription.plan_type === 'basic') {
        throw new Error('Already on lowest plan')
      }

      if (newPlanType !== 'basic') {
        throw new Error('Invalid downgrade target')
      }

      // Call Stripe API to schedule downgrade at period end (no proration/refund)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdvsafxltfdzjspmsdla.supabase.co'
      const response = await fetch(`${supabaseUrl}/functions/v1/downgrade-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          stripeSubscriptionId: subscription.stripe_subscription_id,
          newPlanType,
          atPeriodEnd: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to downgrade subscription')
      }

      return true
    } catch (error) {
      console.error('Error downgrading subscription:', error)
      return false
    }
  }

  // Calculate pro-rated amount for upgrade
  calculateProRating(
    currentPlan: 'basic' | 'premium',
    newPlan: 'basic' | 'premium',
    daysRemaining: number,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ): number {
    const planPrices = {
      basic: { monthly: 49.90, yearly: 499.00 },
      premium: { monthly: 79.90, yearly: 799.00 }
    }

    const currentPrice = planPrices[currentPlan][billingCycle]
    const newPrice = planPrices[newPlan][billingCycle]
    const priceDifference = newPrice - currentPrice

    if (priceDifference <= 0) return 0

    // Calculate pro-rated amount based on remaining days
    const totalDaysInPeriod = billingCycle === 'monthly' ? 30 : 365
    return (priceDifference * daysRemaining) / totalDaysInPeriod
  }

  // Get subscription change history
  async getSubscriptionChanges(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_changes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching subscription changes:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Exception in getSubscriptionChanges:', error)
      return []
    }
  }
}

export const subscriptionService = new SubscriptionService()
export default subscriptionService