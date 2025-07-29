import { useNavigate } from 'react-router-dom'
import { AuthLayout, RegisterForm } from '@/components/auth'

export default function Register() {
  const navigate = useNavigate()

  const handleRegisterSuccess = () => {
    navigate('/checkout?signup=true', { replace: true })
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Complete seu cadastro para começar"
      wide={true}
    >
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </AuthLayout>
  )
}