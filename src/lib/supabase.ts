import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zdvsafxltfdzjspmsdla.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkdnNhZnhsdGZkempzcG1zZGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNDAxOTcsImV4cCI6MjA2NzkxNjE5N30.eJU2HRrTKf-QWbmQeR7QDAyic8KSmkXnapuMJ5dmFg0'

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
  console.warn('⚠️ Supabase não configurado. Configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json'
    }
  }
})

// Database tables type definitions
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          plan_type: string
          plan_expires_at: string | null
          state: string
          city: string
          region: string | null
          account_status: string
          listings_count: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          plan_type?: string
          plan_expires_at?: string | null
          state: string
          city: string
          region?: string | null
          account_status?: string
          listings_count?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          plan_type?: string
          plan_expires_at?: string | null
          state?: string
          city?: string
          region?: string | null
          account_status?: string
          listings_count?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          type: 'equipment' | 'space'
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          type: 'equipment' | 'space'
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          type?: 'equipment' | 'space'
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          user_id: string
          category_id: number
          title: string
          description: string
          price: number
          price_type: string
          state: string
          city: string
          neighborhood: string | null
          postal_code: string | null
          rental_period: string | null
          specifications: Record<string, unknown> | null
          availability_notes: string | null
          delivery_available: boolean
          delivery_fee: number | null
          delivery_radius_km: number | null
          status: string
          featured: boolean
          views_count: number
          contact_whatsapp: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: number
          title: string
          description: string
          price: number
          price_type?: string
          state: string
          city: string
          neighborhood?: string | null
          postal_code?: string | null
          rental_period?: string | null
          specifications?: Record<string, unknown> | null
          availability_notes?: string | null
          delivery_available?: boolean
          delivery_fee?: number | null
          delivery_radius_km?: number | null
          status?: string
          featured?: boolean
          views_count?: number
          contact_whatsapp?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: number
          title?: string
          description?: string
          price?: number
          price_type?: string
          state?: string
          city?: string
          neighborhood?: string | null
          postal_code?: string | null
          rental_period?: string | null
          specifications?: Record<string, unknown> | null
          availability_notes?: string | null
          delivery_available?: boolean
          delivery_fee?: number | null
          delivery_radius_km?: number | null
          status?: string
          featured?: boolean
          views_count?: number
          contact_whatsapp?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}