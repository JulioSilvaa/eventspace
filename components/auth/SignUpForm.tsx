'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, UserPlus, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { createClientSupabase } from '@/lib/supabase'
import { paymentService } from '@/services/paymentService' // Importar o serviço de pagamento

interface BrazilianState {
  code: string
  name: string
  region: string
}

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    state: '',
    city: '',
    region: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [states, setStates] = useState<BrazilianState[]>([])
  const [loadingStates, setLoadingStates] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  
  const { signUp, error: authError, clearError } = useAuth()
  const supabase = createClientSupabase()

  // Carregar estados brasileiros
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data, error } = await supabase
          .from('brazilian_states')
          .select('*')
          .order('name')

        if (error) throw error
        setStates(data || [])
      } catch (err) {
        console.error('Erro ao carregar estados:', err)
      } finally {
        setLoadingStates(false)
      }
    }

    fetchStates()
  }, [supabase])

  // Atualizar região quando estado muda
  useEffect(() => {
    if (formData.state) {
      const selectedState = states.find(s => s.code === formData.state)
      if (selectedState) {
        setFormData(prev => ({ ...prev, region: selectedState.region }))
      }
    }
  }, [formData.state, states])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      errors.full_name = 'Nome completo é obrigatório'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não conferem'
    }

    if (!formData.state) {
      errors.state = 'Estado é obrigatório'
    }

    if (!formData.city.trim()) {
      errors.city = 'Cidade é obrigatória'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    clearError()
    setCheckoutError(null)

    // 1. Criar o usuário no Supabase Auth e o perfil no banco
    const { data: signUpData, error: signUpError } = await signUp(
      formData.email,
      formData.password,
      {
        full_name: formData.full_name,
        phone: formData.phone || undefined,
        state: formData.state,
        city: formData.city,
        region: formData.region
      }
    )
    
    // Se houver erro no cadastro, parar aqui
    if (signUpError || !signUpData?.user) {
      setIsSubmitting(false)
      return
    }

    // 2. Se o cadastro for bem-sucedido, iniciar o checkout
    try {
      await paymentService.createCheckoutSession({
        planType: 'basic', // Plano padrão para novos usuários
        billingCycle: 'monthly', // Ciclo padrão
        userId: signUpData.user.id,
        userEmail: signUpData.user.email!,
      })
      // O serviço de pagamento cuida do redirecionamento para o Stripe.
      // O usuário não verá o estado de `isSubmitting` ser setado para `false` aqui.
    } catch (err) {
      console.error('Erro ao criar sessão de checkout:', err)
      setCheckoutError(err instanceof Error ? err.message : 'Não foi possível iniciar o pagamento. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpar erros ao digitar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    if (authError) clearError()
    if (checkoutError) setCheckoutError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta para começar
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link 
              href="/login" 
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Faça login
            </Link>
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Mensagens de erro */}
          {(authError || checkoutError) && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{authError || checkoutError}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Campos do formulário (sem alteração) */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.full_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                />
              </div>
              {validationErrors.full_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.full_name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefone/WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  disabled={loadingStates}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">
                    {loadingStates ? 'Carregando...' : 'Selecione seu estado'}
                  </option>
                  {states.map(state => (
                    <option key={state.code} value={state.code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              {validationErrors.state && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
              )}
            </div>

            {/* Cidade */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  validationErrors.city ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Sua cidade"
              />
              {validationErrors.city && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> :
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar senha *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite a senha novamente"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> :
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  }
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Botão de submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || loadingStates}
              className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Ir para o pagamento
                </>
              )}
            </button>
          </div>

          {/* Termos */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link href="/termos" className="text-blue-600 hover:text-blue-500">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" className="text-blue-600 hover:text-blue-500">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
