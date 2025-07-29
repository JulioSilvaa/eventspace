import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Tipos do banco de dados
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          created_at?: string
          updated_at?: string
        }
      }
      ads: {
        Row: {
          id: string
          user_id: string | null
          category_id: number | null
          title: string
          description: string
          price: number
          price_type: string
          state: string
          city: string
          neighborhood: string | null
          postal_code: string | null
          rental_period: string | null
          specifications: Json | null
          availability_notes: string | null
          delivery_available: boolean
          delivery_fee: number | null
          delivery_radius_km: number
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
          user_id?: string | null
          category_id?: number | null
          title: string
          description: string
          price: number
          price_type?: string
          state: string
          city: string
          neighborhood?: string | null
          postal_code?: string | null
          rental_period?: string | null
          specifications?: Json | null
          availability_notes?: string | null
          delivery_available?: boolean
          delivery_fee?: number | null
          delivery_radius_km?: number
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
          user_id?: string | null
          category_id?: number | null
          title?: string
          description?: string
          price?: number
          price_type?: string
          state?: string
          city?: string
          neighborhood?: string | null
          postal_code?: string | null
          rental_period?: string | null
          specifications?: Json | null
          availability_notes?: string | null
          delivery_available?: boolean
          delivery_fee?: number | null
          delivery_radius_km?: number
          status?: string
          featured?: boolean
          views_count?: number
          contact_whatsapp?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          type: string
          slug: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          type: string
          slug: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          type?: string
          slug?: string
          active?: boolean
          created_at?: string
        }
      }
      brazilian_states: {
        Row: {
          code: string
          name: string
          region: string
        }
        Insert: {
          code: string
          name: string
          region: string
        }
        Update: {
          code?: string
          name?: string
          region?: string
        }
      }
    }
  }
}

// Cliente para componentes do lado do cliente
export const createClientSupabase = () => 
  createClientComponentClient<Database>()

// Cliente para componentes do lado do servidor
export const createServerSupabase = () => 
  createServerComponentClient<Database>({ cookies })

// Cliente direto (para casos especiais)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)