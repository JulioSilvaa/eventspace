import { create } from 'zustand'
import { User } from '@/types'
import { apiClient } from '@/lib/api-client'
import { LoginResponse, RegisterResponse } from '@/lib/auth'

interface AuthState {
  user: { id: string; email: string } | null
  profile: User | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean

  // Actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<{ error?: string }>
  changePassword: (newPassword: string) => Promise<{ error?: string }>
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

    console.log('🔐 Attempting login with email:', email)

    const { data, error } = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    })

    if (error) {
      console.error('❌ Login error:', error)
      set({ isLoading: false })
      return { error: error.message }
    }

    if (data?.user) {
      // Store user ID for session persistence
      localStorage.setItem('userId', data.user.id)

      // Fetch full user profile
      const { data: profileData, error: profileError } = await apiClient.get<User>(`/api/user/${data.user.id}`)

      if (profileError) {
        console.error('Erro ao buscar profile:', profileError.message)
        set({ isLoading: false })
        return { error: 'Erro ao carregar perfil do usuário' }
      }

      set({
        user: { id: data.user.id, email: data.user.email },
        profile: profileData || null,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      })
    }

    return {}
  },

  signUp: async (email: string, password: string, userData: Partial<User>) => {
    set({ isLoading: true })

    const { data, error } = await apiClient.post<RegisterResponse>('/auth/register', {
      email,
      password,
      name: userData.full_name || '',
      phone: userData.phone || '',
    })

    if (error) {
      set({ isLoading: false })

      // Improve common error messages
      let errorMessage = error.message
      if (error.message.includes('already') || error.message.includes('registered')) {
        errorMessage = 'Este email já está cadastrado. Tente fazer login ou use outro email.'
      } else if (error.message.includes('Password should be') || error.message.includes('senha')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'Email inválido. Verifique o formato do email.'
      }

      return { error: errorMessage }
    }

    if (data?.user) {
      // Store user ID for session persistence
      localStorage.setItem('userId', data.user.id)

      // Map API user to profile format
      const profile: User = {
        id: data.user.id,
        email: data.user.email,
        full_name: userData.full_name || data.user.name || '',
        phone: userData.phone,
        plan_type: 'free',
        account_status: 'inactive',
        state: userData.state || '',
        city: userData.city || '',
        region: userData.region,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      set({
        user: { id: data.user.id, email: data.user.email },
        profile,
        isAuthenticated: true,
        isLoading: false,
        initialized: true,
      })
    }

    return {}
  },

  signOut: async () => {
    await apiClient.post('/auth/logout')
    localStorage.removeItem('userId')
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

    const { error } = await apiClient.patch(`/api/user/${user.id}`, data)

    if (error) {
      return { error: error.message }
    }

    // Update local state
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...data } : null,
    }))

    return {}
  },

  changePassword: async (newPassword: string) => {
    try {
      const { error } = await apiClient.post('/auth/reset-password', {
        newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'Erro inesperado ao alterar senha' }
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })

    try {
      // Check if we have a stored user ID
      const storedUserId = localStorage.getItem('userId')

      if (!storedUserId) {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
        })
        return
      }

      // Try to fetch user profile (cookies will be sent automatically)
      const { data: profileData, error: profileError } = await apiClient.get<User>(`/api/user/${storedUserId}`)

      if (profileError) {
        console.error('Erro ao verificar profile:', profileError.message)
        localStorage.removeItem('userId')
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          initialized: true,
        })
        return
      }

      if (profileData) {
        set({
          user: { id: profileData.id, email: profileData.email },
          profile: profileData,
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
        })
        return
      }

      // No profile data, clear auth
      localStorage.removeItem('userId')
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        initialized: true,
      })
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

    const { data: profileData } = await apiClient.get<User>(`/api/user/${user.id}`)

    if (profileData) {
      set({ profile: profileData })
    }
  },
}))