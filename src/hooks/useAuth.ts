import { useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const store = useAuthStore()
  
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    checkAuth,
    canCreateAd,
    getRemainingAds,
    refreshProfile,
  } = store

  useEffect(() => {
    // Only check auth if we haven't initialized yet
    if (!store.initialized) {
      checkAuth()
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        checkAuth()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkAuth, store.initialized])

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    user,
    profile,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    canCreateAd,
    getRemainingAds,
    refreshProfile,
  }), [
    user, 
    profile, 
    isLoading, 
    isAuthenticated, 
    signIn, 
    signUp, 
    signOut, 
    updateProfile,
    canCreateAd,
    getRemainingAds,
    refreshProfile,
  ])
}