import { stripe, PLAN_PRICES, type PlanType, type BillingCycle } from '@/lib/stripe'
import { encryptUserData } from '@/lib/crypto'
import { apiClient } from '@/lib/api-client'

export interface CreateCheckoutSessionParams {
  planType: PlanType
  billingCycle: BillingCycle
  userId: string
  userEmail: string
}

export interface PaymentRecord {
  id: string
  user_id: string
  plan_type: string
  amount: number
  currency: string
  payment_status: 'pending' | 'completed' | 'failed' | 'cancelled'
  stripe_payment_id?: string
  payment_method?: 'credit_card'
  starts_at: string
  expires_at?: string
  created_at: string
  updated_at: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class PaymentService {
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
    const { planType, billingCycle, userId, userEmail } = params

    try {
      // Get the price ID from our configuration
      const priceId = PLAN_PRICES[planType][billingCycle]

      // Create payment through API
      const { data, error } = await apiClient.post<{ sessionId: string; url?: string }>('/api/subscription/checkout', {
        priceId,
        planType,
        billingCycle,
        userId,
        userEmail,
      })

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session')
      }

      if (data?.url) {
        // If API returns a URL directly, redirect
        window.location.href = data.url
        return data.sessionId || ''
      }

      if (!data?.sessionId) {
        throw new Error('No session ID returned')
      }

      // Redirect to Stripe Checkout
      const stripeInstance = await stripe
      if (!stripeInstance) {
        throw new Error('Stripe not loaded')
      }

      const { error: stripeError } = await stripeInstance.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      return data.sessionId
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }


  async getPaymentStatus(paymentId: string): Promise<PaymentRecord | null> {
    const { data, error } = await apiClient.get<PaymentRecord>(`/api/payments/${paymentId}`)

    if (error) {
      console.error('Error fetching payment:', error)
      return null
    }

    return data || null
  }

  async updatePaymentStatus(paymentId: string, payment_status: PaymentRecord['payment_status'], stripePaymentIntentId?: string) {
    const updateData: {
      payment_status: PaymentRecord['payment_status'],
      stripe_payment_id?: string
    } = {
      payment_status
    }

    if (stripePaymentIntentId) {
      updateData.stripe_payment_id = stripePaymentIntentId
    }

    const { error } = await apiClient.patch(`/api/payments/${paymentId}`, updateData)

    if (error) {
      console.error('Error updating payment status:', error)
      throw new Error(error.message)
    }
  }

  async processPendingPayments(_userId: string): Promise<void> {
    // This is typically handled by webhooks on the backend
    console.log('Pending payments are processed by backend webhooks')
  }

  async getUserActivePayment(userId: string): Promise<PaymentRecord | null> {
    const { data, error } = await apiClient.get<{ payment: PaymentRecord }>(
      `/api/payments/user/${userId}/active`
    )

    if (error) {
      if (error.status === 404) return null
      console.error('Error fetching active payment:', error)
      return null
    }

    return data?.payment || null
  }

  private getPlanAmount(planType: PlanType, billingCycle: BillingCycle): number {
    const prices = {
      pro: {
        monthly: 49.90,
        yearly: 499.00
      }
    }

    return prices[planType][billingCycle]
  }

  private calculateExpirationDate(billingCycle: BillingCycle): string {
    const now = new Date()
    const expirationDate = new Date(now)

    if (billingCycle === 'monthly') {
      expirationDate.setMonth(now.getMonth() + 1)
    } else {
      expirationDate.setFullYear(now.getFullYear() + 1)
    }

    return expirationDate.toISOString()
  }

  async createUpgradeCheckoutSession(params: {
    currentSubscriptionId: string
    newPlanType: PlanType
    billingCycle: BillingCycle
    userId: string
    userEmail: string
    proRatedAmount: number
  }): Promise<string> {
    const { newPlanType, billingCycle, userId, userEmail, proRatedAmount, currentSubscriptionId } = params

    try {
      const priceId = PLAN_PRICES[newPlanType][billingCycle]

      if (!priceId) {
        throw new Error(`Price ID not configured for ${newPlanType}/${billingCycle}`)
      }

      const { data, error } = await apiClient.post<{ url: string }>('/api/subscription/upgrade-checkout', {
        priceId,
        planType: newPlanType,
        billingCycle,
        userId,
        userEmail,
        proRatedAmount,
        currentSubscriptionId,
      })

      if (error) {
        throw new Error(error.message || 'Failed to create upgrade checkout')
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned')
      }

      return data.url
    } catch (error) {
      console.error('Error creating upgrade checkout session:', error)
      throw error
    }
  }

  async scheduleDowngrade(params: {
    subscriptionId: string
    newPlanType: PlanType
    userId: string
    effectiveDate: string
  }): Promise<boolean> {
    const { subscriptionId, newPlanType, effectiveDate } = params

    try {
      const { error } = await apiClient.patch(`/api/subscription/${subscriptionId}/schedule-downgrade`, {
        new_plan_type: newPlanType,
        effective_date: effectiveDate,
      })

      if (error) {
        console.error('Failed to schedule downgrade:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error scheduling downgrade:', error)
      return false
    }
  }

  getPlanPricing(planType: PlanType, billingCycle: BillingCycle): {
    amount: number
    currency: string
    priceId: string
  } {
    return {
      amount: this.getPlanAmount(planType, billingCycle),
      currency: 'BRL',
      priceId: PLAN_PRICES[planType][billingCycle]
    }
  }

  async createCheckoutSessionWithSignup(params: CreateCheckoutSessionParams & {
    userData: {
      full_name: string
      phone?: string
      state: string
      city: string
      region?: string
    }
  }): Promise<string> {
    const { planType, billingCycle, userEmail, userData } = params

    try {
      const priceId = PLAN_PRICES[planType][billingCycle]

      if (!priceId) {
        const error = `Price ID not configured for ${planType}/${billingCycle}. Check your .env file.`
        console.error('❌ Price ID não configurado:', error)
        throw new Error(error)
      }

      // Encrypt user data
      const { encryptedData, hash } = encryptUserData({
        fullName: userData.full_name,
        email: userEmail,
        phone: userData.phone || '',
        state: userData.state,
        city: userData.city,
        password: ''
      })

      // Create checkout session through API
      const { data, error } = await apiClient.post<{ sessionId: string; url?: string }>('/api/subscription/signup-checkout', {
        priceId,
        planType,
        billingCycle,
        userEmail,
        encryptedUserData: encryptedData,
        dataHash: hash,
        successUrl: `${window.location.origin}/signup-success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
        cancelUrl: `${window.location.origin}/cadastro?error=cancelled`
      })

      if (error) {
        if (error.message.includes('Metadata values can have up to 500 characters')) {
          throw new Error('Dados muito longos para processar. Tente com informações mais concisas.')
        }
        throw new Error(error.message || 'Erro ao criar sessão de pagamento')
      }

      // If API returns a URL directly, use it
      if (data?.url) {
        // Fallback: Try to use Edge Function if API doesn't support this
        window.location.href = data.url
        return data.sessionId || ''
      }

      if (!data?.sessionId) {
        throw new Error('No session ID returned')
      }

      // Redirect to Stripe Checkout
      const stripeInstance = await stripe
      if (!stripeInstance) {
        throw new Error('Stripe not loaded')
      }

      const { error: stripeError } = await stripeInstance.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      return data.sessionId
    } catch (error) {
      console.error('💥 Error creating signup checkout session:', error)
      throw error
    }
  }
}

export const paymentService = new PaymentService()