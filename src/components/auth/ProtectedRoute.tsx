import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiresPaidPlan?: boolean
}

export default function ProtectedRoute({ children, requiresPaidPlan = false }: ProtectedRouteProps) {
  const { isAuthenticated, profile, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login')
        return
      }

      if (requiresPaidPlan && profile && profile.account_status !== 'active') {
        navigate('/checkout?required=true')
        return
      }
    }
  }, [isAuthenticated, profile, isLoading, navigate, requiresPaidPlan])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiresPaidPlan && profile && profile.account_status !== 'active') {
    return null
  }

  return <>{children}</>
}