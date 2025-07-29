import { create } from 'zustand'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: SupabaseUser | null
  profile: User | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ error?: string }>
  checkAuth: () => Promise<void>
  setLoading: (loading: boolean) => void
  
  // Plan functions
  canCreateAd: () => boolean
  getRemainingAds: () => number
  hasPaidPlan: () => boolean
  canAccessDashboard: () => boolean
  refreshProfile: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      initialized: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          set({ isLoading: false })
          return { error: error.message }
        }

        if (data.user) {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            console.error('Erro ao buscar profile:', profileError.message)
            // If profile doesn't exist, user account is inconsistent
            if (profileError.code === 'PGRST116') {
              set({ isLoading: false })
              return { error: 'Conta não encontrada. Entre em contato com o suporte.' }
            }
          }

          // User is authenticated if they have valid login and profile
          // Account status controls dashboard access, not authentication
          set({
            user: data.user,
            profile: profileData,
            isAuthenticated: true,
            isLoading: false,
            initialized: true,
          })
        }

        return {}
      },

      signUp: async (email: string, password: string, userData: Partial<User>) => {
        set({ isLoading: true })
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          set({ isLoading: false })
          
          // Melhorar mensagens de erro comuns
          let errorMessage = error.message
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.'
          } else if (error.message.includes('Password should be')) {
            errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
          } else if (error.message.includes('Invalid email')) {
            errorMessage = 'Email inválido. Verifique o formato do email.'
          }
          
          return { error: errorMessage }
        }

        if (data.user) {
          // The profile is automatically created by the database trigger
          // We just need to update it with the user's signup data
          const { error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (fetchError) {
            set({ isLoading: false })
            return { error: 'Erro ao verificar perfil do usuário' }
          }

          // Update the profile with the signup data
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              full_name: userData.full_name || '',
              phone: userData.phone || null,
              state: userData.state || '',
              city: userData.city || '',
            })
            .eq('id', data.user.id)
            .select()
            .single()

          if (updateError) {
            set({ isLoading: false })
            return { error: updateError.message }
          }

          // User is authenticated but account is inactive (needs payment to access dashboard)
          set({
            user: data.user,
            profile: updatedProfile as User,
            isAuthenticated: true, // User is authenticated, but account is inactive
            isLoading: false,
            initialized: true,
          })
        }

        return {}
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
        })
      },

      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) return { error: 'Usuário não autenticado' }

        const { error } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', user.id)

        if (error) {
          return { error: error.message }
        }

        // Update local state
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...data } : null,
        }))

        return {}
      },

      checkAuth: async () => {
        set({ isLoading: true })
        
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Fetch user profile
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('Erro ao verificar profile:', profileError.message)
              // If profile doesn't exist, sign out the user
              if (profileError.code === 'PGRST116') {
                console.log('Profile não existe, fazendo logout...')
                await supabase.auth.signOut()
                set({
                  user: null,
                  profile: null,
                  isAuthenticated: false,
                  isLoading: false,
                  initialized: true,
                })
                return
              }
            }

            // User is authenticated if they have a valid session and profile
            // Account status controls dashboard access, not authentication
            set({
              user: session.user,
              profile: profileData,
              isAuthenticated: true, // Always true if user has valid session and profile
              isLoading: false,
              initialized: true,
            })
          } else {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
              initialized: true,
            })
          }
        } catch (error) {
          console.warn('Erro ao verificar autenticação:', error)
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            initialized: true,
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      // Plan functions
      canCreateAd: () => {
        const { profile } = get()
        if (!profile) return false
        
        // Users must have active account and paid plan to create ads
        if (profile.account_status !== 'active' || profile.plan_type === 'free') {
          return false
        }
        
        const adsCount = profile.listings_count || 0
        let adsLimit = 0
        
        switch (profile.plan_type) {
          case 'basic':
            adsLimit = 3
            break
          case 'premium':
            adsLimit = 5
            break
          default:
            adsLimit = 0
        }
        
        return adsCount < adsLimit
      },

      getRemainingAds: () => {
        const { profile } = get()
        if (!profile) return 0
        
        // Users must have active account and paid plan for ads allowance
        if (profile.account_status !== 'active' || profile.plan_type === 'free') {
          return 0
        }
        
        const adsCount = profile.listings_count || 0
        let adsLimit = 0
        
        switch (profile.plan_type) {
          case 'basic':
            adsLimit = 3
            break
          case 'premium':
            adsLimit = 5
            break
          default:
            adsLimit = 0
        }
        
        return Math.max(0, adsLimit - adsCount)
      },

      hasPaidPlan: () => {
        const { profile } = get()
        return profile?.account_status === 'active' && (profile?.plan_type === 'basic' || profile?.plan_type === 'premium')
      },

      canAccessDashboard: () => {
        const { profile } = get()
        return profile?.account_status === 'active'
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          set({ profile: profileData })
        }
      },
    }))

// Auth state listener will be set up in the useAuth hook