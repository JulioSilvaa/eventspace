import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FormField, FormButton } from '@/components/forms'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn(data.email, data.password)
      
      if (result.error) {
        setError(result.error)
        return
      }
      
      onSuccess?.()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro no login:', err)
      setError(errorMessage || 'Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao fazer login
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Email"
          type="email"
          placeholder="seu@email.com"
          error={errors.email}
          required
          {...register('email')}
        />

        <FormField
          label="Senha"
          type="password"
          placeholder="••••••••"
          error={errors.password}
          required
          showPasswordToggle
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              to="/recuperar-senha"
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </div>

        <FormButton
          type="submit"
          loading={isLoading}
          disabled={!isValid}
          fullWidth
          size="lg"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </FormButton>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            Não tem uma conta?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <Link
          to="/cadastro"
          className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
        >
          Criar conta
        </Link>
      </div>
    </div>
  )
}