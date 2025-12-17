import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

/**
 * Custom hook to handle authentication state
 * Initializes auth on mount and provides auth utilities
 */
export function useAuth() {
  const store = useAuthStore()
  const { initialized, checkAuth } = store

  useEffect(() => {
    // Check authentication status on mount
    if (!initialized) {
      checkAuth()
    }
  }, [initialized, checkAuth])


  return {
    ...store,
    checkAuth
  }
}