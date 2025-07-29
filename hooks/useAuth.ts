'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { createClientSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export interface Profile {
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

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientSupabase()
  const router = useRouter()

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar sessão')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile, supabase.auth])

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      setProfile(data)
    } catch (err) {
      console.error('Erro ao buscar perfil:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil')
    }
  }, [supabase])

  const signUp = async (email: string, password: string, userData: {
    full_name: string
    phone?: string
    state: string
    city: string
    region?: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      // Criar perfil se o usuário foi criado
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: userData.full_name,
            phone: userData.phone || null,
            state: userData.state,
            city: userData.city,
            region: userData.region || null,
            plan_type: 'trial'
          })

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError)
        }
      }

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 'Erro ao criar conta'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 'Erro ao fazer login'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao sair')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/recuperar-senha/callback`
      })

      if (error) throw error

      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof AuthError ? err.message : 'Erro ao enviar email'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado')

      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    isPremium: profile?.plan_type === 'premium' || profile?.plan_type === 'pro',
    isPro: profile?.plan_type === 'pro'
  }
}