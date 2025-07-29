import { useNavigate, useLocation } from 'react-router-dom'
import { AuthLayout, LoginForm } from '@/components/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get redirect path from URL params or default to dashboard
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const handleLoginSuccess = () => {
    navigate(from, { replace: true })
  }

  return (
    <AuthLayout
      title="Entre na sua conta"
      subtitle="Acesse sua conta para gerenciar seus anúncios"
    >
      <LoginForm onSuccess={handleLoginSuccess} />
    </AuthLayout>
  )
}