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
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: string }>
  checkAuth: () => Promise<void>
  setLoading: (loading: boolean) => void

  // Plan functions
  canCreateAd: () => boolean
  getRemainingAds: () => number
  hasPaidPlan: () => boolean
  canAccessDashboard: () => boolean
  refreshProfile: () => Promise<void>
}

const mapApiUserToUser = (apiUser: any): User => {
  return {
    id: apiUser.id,
    email: apiUser.email,
    full_name: apiUser.name || apiUser.full_name || '',
    phone: apiUser.phone,
    plan_type: apiUser.plan_type || 'free',
    plan_expires_at: apiUser.plan_expires_at,
    account_status: apiUser.status || apiUser.account_status || 'active',
    state: apiUser.state || '',
    city: apiUser.city || '',
    region: apiUser.region,
    listings_count: apiUser.listings_count,
    created_at: apiUser.created_at,
    updated_at: apiUser.updated_at,
    terms_accepted_at: apiUser.terms_accepted_at,
    privacy_accepted_at: apiUser.privacy_accepted_at,
    terms_version: apiUser.terms_version,
    privacy_version: apiUser.privacy_version,
    marketing_consent: apiUser.marketing_consent,
    marketing_consent_at: apiUser.marketing_consent_at,
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true })


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
        profile: profileData ? mapApiUserToUser(profileData) : null,
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



      set({
        user: { id: data.user.id, email: data.user.email },
        profile: mapApiUserToUser({
          ...data.user,
          ...userData,
          status: data.user.status || 'active'
        }),
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

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await apiClient.post('/auth/change-password', {
        currentPassword,
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
      // Try to fetch current user (cookies will be sent automatically)
      const { data: profileData, error: profileError } = await apiClient.get<User>('/auth/me')

      if (profileError) {
        // Silent error if 401 (not authenticated), otherwise log
        if (profileError.status !== 401) {
          console.warn('Erro ao verificar autenticação:', profileError.message)
        }

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
          profile: mapApiUserToUser(profileData),
          isAuthenticated: true,
          isLoading: false,
          initialized: true,
        })
        return
      }

      // No profile data, clear auth
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
      set({ profile: mapApiUserToUser(profileData) })
    }
  },
}))