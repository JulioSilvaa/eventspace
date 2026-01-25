import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FormField, FormButton } from '@/components/forms'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-hot-toast'
import { DOCUMENT_VERSIONS } from '@/types'
import { maskPhone } from '@/utils/masks'

// Schema para dados de cadastro
const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Formato: (11) 99999-9999'),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, 'Você deve aceitar os termos de uso')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { signUp } = useAuthStore()

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  })

  // Formata o telefone conforme o usuário digita
  // function removed

  const handleSubmit = async (data: RegisterForm) => {
    if (isLoading) return

    setIsLoading(true)

    const loadingToast = toast.loading('Criando sua conta...')

    try {
      const { error } = await signUp(
        data.email,
        data.password,
        {
          full_name: data.fullName,
          phone: data.phone,
          state: '',
          city: '',
          region: ''
        }
      )

      if (error) {
        toast.error(error, { id: loadingToast })
        return
      }

      toast.success('Conta criada com sucesso!', { id: loadingToast })

      // Redirecionar para a home ou dashboard (ou url de retorno)
      const searchParams = new URLSearchParams(location.search)
      const returnTo = searchParams.get('returnTo') || '/'
      navigate(returnTo)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta'
      toast.error(errorMessage, { id: loadingToast })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Crie sua Conta</h2>
        <p className="text-lg text-gray-600">Preencha suas informações para começar</p>
        <p className="text-sm text-gray-500 mt-2">Cadastro 100% gratuito</p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            label="Nome completo"
            type="text"
            placeholder="Digite seu nome completo"
            error={form.formState.errors.fullName}
            required
            {...form.register('fullName')}
          />

          <FormField
            label="Email"
            type="email"
            placeholder="seu@email.com"
            error={form.formState.errors.email}
            required
            {...form.register('email')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Senha"
            type="password"
            placeholder="••••••••"
            error={form.formState.errors.password}
            required
            showPasswordToggle
            {...form.register('password')}
          />

          <FormField
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            error={form.formState.errors.confirmPassword}
            required
            showPasswordToggle
            {...form.register('confirmPassword')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            error={form.formState.errors.phone}
            required
            {...form.register('phone', {
              onChange: (e) => {
                e.target.value = maskPhone(e.target.value)
              }
            })}
          />
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              {...form.register('acceptTerms')}
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="text-gray-600">
              Aceito os{' '}
              <Link
                to="/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 font-medium underline"
              >
                termos de uso (v{DOCUMENT_VERSIONS.terms_of_service})
              </Link>{' '}
              e{' '}
              <Link
                to="/privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-500 font-medium underline"
              >
                política de privacidade (v{DOCUMENT_VERSIONS.privacy_policy})
              </Link>
            </label>
            {form.formState.errors.acceptTerms && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
            )}
          </div>
        </div>

        <FormButton
          type="submit"
          disabled={!form.formState.isValid || isLoading}
          fullWidth
          size="lg"
          className="py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Criando conta...</span>
            </div>
          ) : (
            <span>Criar conta gratuita</span>
          )}
        </FormButton>
      </form>

      <div className="text-center pt-4">
        <span className="text-sm text-gray-500">Já tem uma conta? </span>
        <Link
          to="/login"
          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          Fazer login
        </Link>
      </div>

      {/* Trust indicators */}
      <div className="bg-gray-50 rounded-xl p-6 mt-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">🔒 Por que escolher o EventSpace?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">💰</div>
            <div className="text-sm font-medium text-gray-900">0% Comissão</div>
            <div className="text-xs text-gray-600">Você fica com 100%</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">👥</div>
            <div className="text-sm font-medium text-gray-900">Contato Direto</div>
            <div className="text-xs text-gray-600">Sem intermediários</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-2xl">🚀</div>
            <div className="text-sm font-medium text-gray-900">Cadastro Gratuito</div>
            <div className="text-xs text-gray-600">Comece agora mesmo</div>
          </div>
        </div>
      </div>
    </div>
  )
}