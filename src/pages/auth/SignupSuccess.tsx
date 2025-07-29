import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Crown, ArrowRight, Home, LogIn, Sparkles } from 'lucide-react'

export default function SignupSuccess() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState<string>('')
  
  // Get params from URL
  const plan = searchParams.get('plan') || 'basic'

  useEffect(() => {
    // Try to get email from localStorage if available
    const pendingSignup = localStorage.getItem('pending-signup')
    if (pendingSignup) {
      try {
        const signupData = JSON.parse(pendingSignup)
        setEmail(signupData.userEmail || '')
        // Clear the temporary data
        localStorage.removeItem('pending-signup')
      } catch (error) {
        console.error('Error parsing signup data:', error)
      }
    }
  }, [])

  const planDetails = {
    basic: {
      name: 'Básico',
      price: 'R$ 49,90/mês',
      features: [
        'Até 3 anúncios ativos',
        'Relatórios básicos',
        'Suporte por email',
        'Remove marca d\'água'
      ]
    },
    premium: {
      name: 'Premium', 
      price: 'R$ 79,90/mês',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-700" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Conta Criada com Sucesso!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Seu pagamento foi processado e sua conta no EventSpace está pronta para usar. 
            Bem-vindo à maior plataforma de aluguel de equipamentos e espaços para eventos!
          </p>
        </div>

        {/* Plan Confirmation Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Plano {currentPlan.name} Ativo
              </h2>
              <p className="text-gray-600 text-lg">
                {currentPlan.price} • Conta ativada imediatamente
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">✨ Recursos Inclusos:</h3>
              <ul className="space-y-3">
                {currentPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h3 className="font-semibold text-green-900 mb-3 text-lg">💰 Vantagens Exclusivas</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <strong>0% de comissão</strong> - Você fica com 100% do valor
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <strong>Contato direto</strong> com clientes
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <strong>Sem fidelidade</strong> - Cancele quando quiser
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <strong>Suporte dedicado</strong> sempre disponível
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
          <h3 className="font-bold text-blue-900 mb-6 text-xl">🚀 Próximos Passos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h4 className="font-semibold text-blue-900 mb-2">Faça Login</h4>
              <p className="text-sm text-blue-700">
                Acesse sua conta com o email e senha que você cadastrou
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h4 className="font-semibold text-blue-900 mb-2">Crie seu Anúncio</h4>
              <p className="text-sm text-blue-700">
                Adicione fotos e descrições dos seus equipamentos ou espaços
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h4 className="font-semibold text-blue-900 mb-2">Receba Clientes</h4>
              <p className="text-sm text-blue-700">
                Seus anúncios ficarão visíveis para milhares de organizadores
              </p>
            </div>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold text-lg shadow-lg"
          >
            <LogIn className="w-6 h-6" />
            Fazer Login Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            to="/"
            className="flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold text-lg"
          >
            <Home className="w-6 h-6" />
            Voltar ao Início
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Precisa de Ajuda? 🤝</h3>
          <p className="text-gray-600 mb-6">
            Nossa equipe está sempre disponível para te ajudar a começar no EventSpace
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
            <a 
              href="mailto:suporte@eventspace.com.br" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              📧 suporte@eventspace.com.br
            </a>
            <a 
              href="https://wa.me/5511999999999" 
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              📱 WhatsApp: (11) 99999-9999
            </a>
          </div>
        </div>

        {/* Celebration Message */}
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-600">
            🎊 <strong>Parabéns!</strong> Você agora faz parte da comunidade EventSpace! 🎊
          </p>
        </div>
      </div>
    </div>
  )
}