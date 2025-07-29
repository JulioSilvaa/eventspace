import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined')
}

export const stripe = loadStripe(stripePublishableKey)

export const PLAN_PRICES = {
  basic: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_BASIC_MONTHLY || '',
  },
  premium: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY || '',
  }
} as const

export type PlanType = keyof typeof PLAN_PRICES
export type BillingCycle = 'monthly'