import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Crown, ArrowRight, Home, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { paymentService } from '@/services/paymentService'

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams()
  const { refreshProfile, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  
  // Get params from URL
  const plan = searchParams.get('plan') || 'basic'
  const sessionId = searchParams.get('session_id')
  const paymentId = searchParams.get('payment_id')

  useEffect(() => {
    const verifyPaymentAndUpdateProfile = async () => {
      try {
        if (user) {
          // Process any pending payments for this user
          await paymentService.processPendingPayments(user.id)
        }

        // If we have a payment ID, verify the payment status
        if (paymentId) {
          await paymentService.getPaymentStatus(paymentId)
        }

        // Refresh user profile to get updated plan
        await refreshProfile()
      } catch (error) {
        console.error('Error verifying payment:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (user) {
      verifyPaymentAndUpdateProfile()
    } else {
      setIsLoading(false)
    }
  }, [refreshProfile, paymentId, sessionId, user])

  const planDetails = {
    basic: {
      name: 'Básico',
      price: 'R$ 49,90',
      features: [
        'Até 3 anúncios ativos',
        'Relatórios básicos',
        'Suporte por email',
        'Remove marca d\'água'
      ]
    },
    premium: {
      name: 'Premium', 
      price: 'R$ 79,90',
      features: [
        'Até 5 anúncios ativos',
        'Anúncios destacados ilimitados',
        'Até 10 fotos por anúncio',
        'Relatórios avançados',
        'Dashboard personalizado'
      ]
    }
  }

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.basic

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Confirmando seu pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Pagamento Realizado com Sucesso!
          </h1>
          <p className="text-xl text-gray-600">
            Bem-vindo ao EventSpace! Seu plano está ativo e pronto para uso.
          </p>
        </div>

        {/* Plan Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Plano {currentPlan.name} Ativado
              </h2>
              <p className="text-gray-600">
                {currentPlan.price}/mês • Renovação automática
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recursos Inclusos:</h3>
              <ul className="space-y-2">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">💰 Sem Comissões!</h3>
              <p className="text-sm text-green-700">
                Lembre-se: o EventSpace não cobra comissões sobre seus aluguéis. 
                Você fica com 100% do valor negociado com seus clientes!
              </p>
            </div>
          </div>
        </div>


        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">🚀 Próximos Passos</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <p className="font-medium text-blue-900">Crie seu primeiro anúncio</p>
                <p className="text-sm text-blue-700">Adicione fotos e descrições atrativas para seus equipamentos ou espaços</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <p className="font-medium text-blue-900">Configure suas informações de contato</p>
                <p className="text-sm text-blue-700">Certifique-se de que seus dados estão corretos para receber contatos</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <p className="font-medium text-blue-900">Comece a receber clientes</p>
                <p className="text-sm text-blue-700">Seus anúncios estarão visíveis para milhares de organizadores de eventos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/criar-anuncio"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Crown className="w-5 h-5" />
            Criar Primeiro Anúncio
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            to="/dashboard?from_checkout=true"
            className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <User className="w-5 h-5" />
            Ir para Dashboard
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 text-gray-600 px-6 py-3 rounded-lg hover:text-gray-800 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-2">
            Precisa de ajuda? Entre em contato conosco
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <a href="mailto:suporte@eventspace.com.br" className="text-blue-600 hover:text-blue-700">
              suporte@eventspace.com.br
            </a>
            <a href="https://wa.me/5511999999999" className="text-green-600 hover:text-green-700">
              WhatsApp: (11) 99999-9999
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}