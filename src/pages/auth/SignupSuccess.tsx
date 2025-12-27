import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, Home, LogIn, Sparkles } from 'lucide-react'

export default function SignupSuccess() {
  const [email, setEmail] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const pendingSignup = localStorage.getItem('pending-signup')
    if (pendingSignup) {
      try {
        const signupData = JSON.parse(pendingSignup)
        setEmail(signupData.userEmail || '')
        localStorage.removeItem('pending-signup')
      } catch (error) {
        console.error('Error parsing signup data:', error)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Success Header */}
        <div className="mb-10">
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
          <p className="text-xl text-gray-600">
            Sua conta no EventSpace está pronta para usar.
            Bem-vindo à maior plataforma de aluguel de equipamentos e espaços para eventos!
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-left">
          <h3 className="font-bold text-gray-900 mb-6 text-xl">🚀 Próximos Passos</h3>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">Faça Login</h4>
                <p className="text-sm text-gray-600">Acesse sua conta com o email e senha que você cadastrou</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Crie seu Anúncio</h4>
                <p className="text-sm text-gray-600">Adicione fotos e descrições dos seus equipamentos ou espaços</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">Receba Clientes</h4>
                <p className="text-sm text-gray-600">Seus anúncios ficarão visíveis para milhares de organizadores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to={`/login${email ? `?email=${encodeURIComponent(email)}` : ''}`}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-all font-semibold text-lg shadow-sm"
          >
            <LogIn className="w-6 h-6" />
            Fazer Login Agora
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-3 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold text-lg"
          >
            <Home className="w-6 h-6" />
            Voltar ao Início
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <h3 className="font-semibold text-gray-1000 mb-4">Precisa de Ajuda? 🤝</h3>
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
      </div>
    </div>
  )
}