import { supabase } from '@/lib/supabase'
import { stripe, PLAN_PRICES, type PlanType, type BillingCycle } from '@/lib/stripe'
import { encryptUserData } from '@/lib/crypto'

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

class PaymentService {
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<string> {
    const { planType, billingCycle, userId, userEmail } = params
    
    try {
      // Get the price ID from our configuration
      const priceId = PLAN_PRICES[planType][billingCycle]
      
      // Create payment record in database
      const amount = this.getPlanAmount(planType, billingCycle)
      const expiresAt = this.calculateExpirationDate(billingCycle)
      
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          plan_type: planType,
          amount,
          currency: 'BRL',
          payment_status: 'pending',
          payment_method: 'credit_card',
          starts_at: new Date().toISOString(),
          expires_at: expiresAt
        })
        .select('id')
        .single()

      if (paymentError) {
        throw new Error(`Failed to create payment record: ${paymentError.message}`)
      }

      // Call Supabase Edge Function to create Stripe session
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdvsafxltfdzjspmsdla.supabase.co'
      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          priceId,
          userId,
          userEmail,
          paymentId: payment.id,
          planType,
          billingCycle
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const stripeInstance = await stripe
      if (!stripeInstance) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripeInstance.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }

      return sessionId
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  }


  async getPaymentStatus(paymentId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error) {
      console.error('Error fetching payment:', error)
      return null
    }

    return data
  }

  async updatePaymentStatus(paymentId: string, payment_status: PaymentRecord['payment_status'], stripePaymentIntentId?: string) {
    const updateData: { 
      payment_status: PaymentRecord['payment_status'],
      updated_at: string,
      stripe_payment_id?: string
    } = { 
      payment_status,
      updated_at: new Date().toISOString()
    }
    
    if (stripePaymentIntentId) {
      updateData.stripe_payment_id = stripePaymentIntentId
    }

    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)

    if (error) {
      console.error('Error updating payment status:', error)
      throw error
    }

    // If payment completed successfully, update user's plan_type
    if (payment_status === 'completed') {
      await this.updateUserPlanTypeFromPayment(paymentId)
    }
  }

  private async updateUserPlanTypeFromPayment(paymentId: string) {
    try {
      // Get payment details
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('user_id, plan_type, expires_at')
        .eq('id', paymentId)
        .single()

      if (paymentError || !payment) {
        console.error('Error fetching payment for plan update:', paymentError)
        return
      }

      // Activate account and update plan_type only after confirmed payment
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          plan_type: payment.plan_type,
          account_status: 'active', // Activate the account
          plan_expires_at: payment.expires_at, // Use the expiration from payment
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.user_id)

      if (profileError) {
        console.error('Error updating user plan type:', profileError)
      }
    } catch (error) {
      console.error('Error in updateUserPlanTypeFromPayment:', error)
    }
  }

  // Método para processar pagamentos pendentes que podem ter sido completados
  async processPendingPayments(userId: string): Promise<void> {
    try {
      const { data: pendingPayments, error } = await supabase
        .from('payments')
        .select('id, plan_type, expires_at')
        .eq('user_id', userId)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending payments:', error)
        return
      }

      // Se há pagamentos pendentes, marca o mais recente como completado
      // Isso simula o que um webhook faria
      if (pendingPayments && pendingPayments.length > 0) {
        const latestPayment = pendingPayments[0]
        await this.updatePaymentStatus(latestPayment.id, 'completed')
      }
    } catch (error) {
      console.error('Error processing pending payments:', error)
    }
  }

  async getUserActivePayment(userId: string): Promise<PaymentRecord | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching active payment:', error)
      return null
    }

    return data
  }

  private getPlanAmount(planType: PlanType, billingCycle: BillingCycle): number {
    const prices = {
      basic: {
        monthly: 49.90,
        yearly: 499.00
      },
      premium: {
        monthly: 79.90,
        yearly: 799.00
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

  // Novo método para checkout com dados de signup
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
      // Get the price ID from our configuration
      const priceId = PLAN_PRICES[planType][billingCycle]
      
      // Verificar se o Price ID está configurado
      if (!priceId) {
        const error = `Price ID not configured for ${planType}/${billingCycle}. Check your .env file.`
        console.error('❌ Price ID não configurado:', error)
        throw new Error(error)
      }
      
      // Criptografar todos os dados sensíveis do usuário
      const { encryptedData, hash } = encryptUserData({
        fullName: userData.fullName,
        email: userEmail,
        phone: userData.phone,
        state: userData.state,
        city: userData.city,
        password: userData.password
      })
      
      // Preparar metadata com dados criptografados
      const metadata = {
        planType,
        billingCycle,
        userEmail, // Email fica não criptografado para identificação
        encryptedUserData: encryptedData,
        dataHash: hash, // Hash para verificação de integridade
        signupFlow: 'true', // Flag para identificar como signup
        encryptionVersion: import.meta.env.VITE_ENCRYPTION_VERSION || '2.0' // Versão da criptografia
      }

      // Validar tamanho da metadata para Stripe (limite 500 chars por campo)
      const validateMetadataSize = (obj: Record<string, string>) => {
        for (const [key, value] of Object.entries(obj)) {
          if (value && value.length > 500) {
            throw new Error(`Metadata field '${key}' exceeds Stripe limit: ${value.length} chars (max 500)`)
          }
        }
      }

      validateMetadataSize(metadata)

      // Call Supabase Edge Function to create Stripe session with signup data
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdvsafxltfdzjspmsdla.supabase.co'
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/stripe-checkout`
      
      const requestBody = {
        priceId,
        userEmail,
        metadata,
        successUrl: `${window.location.origin}/signup-success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
        cancelUrl: `${window.location.origin}/cadastro?error=cancelled`
      }
      
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Edge function error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        })
        
        // Melhor tratamento de erros específicos
        if (response.status === 400) {
          if (errorText.includes('Metadata values can have up to 500 characters')) {
            throw new Error('Dados muito longos para processar. Tente com informações mais concisas.')
          }
          throw new Error(`Erro de validação: ${errorText}`)
        } else if (response.status === 401) {
          throw new Error('Erro de autenticação. Tente novamente.')
        } else if (response.status >= 500) {
          throw new Error('Erro temporário do servidor. Tente novamente em alguns segundos.')
        }
        
        throw new Error(`Erro ao criar sessão de pagamento: ${errorText}`)
      }

      const responseData = await response.json()
      const { sessionId } = responseData
      
      // Redirect to Stripe Checkout
      const stripeInstance = await stripe
      if (!stripeInstance) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripeInstance.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw new Error(error.message)
      }

      return sessionId
    } catch (error) {
      console.error('💥 Error creating signup checkout session:', error)
      throw error
    }
  }
}

export const paymentService = new PaymentService()