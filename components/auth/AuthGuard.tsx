'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      const isAuthRequiredAndMissing = requireAuth && !user
      const isAccountInactive = requireAuth && user && profile?.account_status !== 'active'
      const isGuestAccessingAuthArea = !requireAuth && user && profile?.account_status === 'active'

      if (isAuthRequiredAndMissing) {
        router.push(redirectTo)
        return
      }

      if (isAccountInactive) {
        // Redireciona para a página de checkout se a conta não estiver ativa
        router.push('/checkout?required=true')
        return
      }

      if (isGuestAccessingAuthArea) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, profile, isLoading, requireAuth, redirectTo, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Não renderizar o conteúdo se o redirecionamento estiver pendente
  if ((requireAuth && !user) || (requireAuth && user && profile?.account_status !== 'active')) {
    return null
  }
  if (!requireAuth && user && profile?.account_status === 'active') {
    return null
  }

  return <>{children}</>
}
