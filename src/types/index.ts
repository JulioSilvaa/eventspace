export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  plan_type: 'free' | 'basic' | 'premium' // free by default, upgraded only after payment
  plan_expires_at?: string
  account_status: 'inactive' | 'active' // inactive until first payment, then active
  state: string
  city: string
  region?: string
  listings_count?: number

  // Consent tracking fields
  terms_accepted_at?: string
  privacy_accepted_at?: string
  terms_version?: string
  privacy_version?: string
  marketing_consent?: boolean
  marketing_consent_at?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  type: 'space' | 'service' | 'equipment' | 'advertiser'
  slug: string
  description?: string
  parent_id?: number
  is_active?: boolean
}

export interface Ad {
  id: string
  user_id: string
  category_id: number
  title: string
  description: string
  price: number
  price_per_day?: number
  price_per_weekend?: number
  price_type: string
  capacity?: number
  state: string
  city: string
  neighborhood?: string
  postal_code?: string
  street?: string
  number?: string
  complement?: string
  reference_point?: string
  rental_period?: string
  specifications?: Record<string, unknown>
  availability_notes?: string
  delivery_available: boolean
  delivery_fee?: number
  delivery_radius_km?: number
  comfort?: string[]
  status: 'active' | 'inactive' | 'pending' | 'rejected' | 'suspended'
  featured: boolean
  views_count: number
  contacts_count: number
  rating?: number
  reviews_count?: number
  contact_whatsapp?: string
  contact_whatsapp_alternative?: string
  contact_phone?: string
  contact_email?: string
  contact_instagram?: string
  contact_facebook?: string

  created_at: string
  updated_at: string
  listing_images?: ListingImage[]
  categories?: Category
  user?: User
  owner?: {
    name: string
    phone?: string

  }
  subscription?: {
    plan: string
    status: string
    price?: number
  }
}

export interface ListingImage {
  id: string
  listing_id: string
  image_url: string
  display_order: number
  created_at: string
}

// Keep AdImage as alias for backward compatibility
export type AdImage = ListingImage

export interface Payment {
  id: string
  user_id: string
  plan_type: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  stripe_payment_id?: string
  created_at: string
  updated_at: string
}

export interface BrazilianState {
  code: string
  name: string
  region: string
}

export interface SearchFilters {
  query?: string
  category_id?: number
  state?: string
  city?: string
  price_min?: number
  price_max?: number
  delivery_available?: boolean
  type?: 'space' | 'service' | 'equipment' | 'advertiser'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Consent and LGPD related types
export type ConsentType = 'terms_of_service' | 'privacy_policy' | 'marketing'

export interface ConsentRecord {
  id: string
  user_id: string
  consent_type: ConsentType
  consent_given: boolean
  consent_timestamp: string
  document_version: string
  ip_address?: string
  user_agent?: string
  withdrawal_timestamp?: string
  withdrawal_reason?: string
  created_at: string
  updated_at: string
}

export interface ConsentStatus {
  user_id: string
  terms_accepted_at?: string
  privacy_accepted_at?: string
  terms_version?: string
  privacy_version?: string
  marketing_consent?: boolean
  marketing_consent_at?: string
  has_required_consents: boolean
  has_current_consent_versions: boolean
}

export interface ConsentRequest {
  consent_type: ConsentType
  consent_given: boolean
  document_version: string
  ip_address?: string
  user_agent?: string
}

// Document versions - update these when legal documents change
export const DOCUMENT_VERSIONS = {
  terms_of_service: '1.0',
  privacy_policy: '1.0'
} as const

export type DocumentVersion = typeof DOCUMENT_VERSIONS[keyof typeof DOCUMENT_VERSIONS]