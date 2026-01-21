import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  throw new Error('VITE_STRIPE_PUBLISHABLE_KEY is not defined')
}

export const stripe = loadStripe(stripePublishableKey)

export const PLAN_PRICES = {
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || '',
    yearly: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || '',
  },
  sponsor_bronze: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_SPONSOR_BRONZE || '',
    yearly: '',
  },
  sponsor_silver: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_SPONSOR_SILVER || '',
    yearly: '',
  },
  sponsor_gold: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_SPONSOR_GOLD || '',
    yearly: '',
  }
} as const

export type PlanType = keyof typeof PLAN_PRICES
export type BillingCycle = 'monthly' | 'yearly'