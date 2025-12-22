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
      // Set token globally
      if (data.accessToken) {
        apiClient.setToken(data.accessToken)
      }

      // Store user ID for session persistence
      localStorage.setItem('userId', data.user.id)

      // Fetch full user profile
      const { data: profileResponse, error: profileError } = await apiClient.get<{ data: User }>(`/api/user/${data.user.id}`)

      if (profileError) {
        console.error('Erro ao buscar profile:', profileError.message)
        set({ isLoading: false })
        return { error: 'Erro ao carregar perfil do usuário' }
      }

      // Extract profile from nested data property
      const profileData = profileResponse?.data

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
      // Set token globally
      if (data.accessToken) {
        apiClient.setToken(data.accessToken)
      }

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
    apiClient.clearToken()
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
      const { data: profileResponse, error: profileError } = await apiClient.get<{ data: User }>(`/api/user/${storedUserId}`)

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

      // Extract profile from nested data property
      const profileData = profileResponse?.data

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

    // TODO: Re-enable plan restrictions when subscription system is implemented
    // For now, allow all authenticated users to create ads
    return true
  },

  getRemainingAds: () => {
    // TODO: Re-enable when subscription system is implemented
    // For now, return unlimited
    return 999
  },

  hasPaidPlan: () => {
    // TODO: Re-enable when subscription system is implemented
    // For now, treat all users as having paid plan
    return true
  },

  canAccessDashboard: () => {
    const { profile } = get()
    // Allow all authenticated users to access dashboard
    return !!profile
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data: profileResponse } = await apiClient.get<{ data: User }>(`/api/user/${user.id}`)

    // Extract profile from nested data property
    const profileData = profileResponse?.data

    if (profileData) {
      set({ profile: profileData })
    }
  },
}))