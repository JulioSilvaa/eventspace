import { AuthLayout, RegisterForm } from '@/components/auth'

export default function Register() {


  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Complete seu cadastro para começar"
      wide={true}
    >
      <RegisterForm />
    </AuthLayout>
  )
}