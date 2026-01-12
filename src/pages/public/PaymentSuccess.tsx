import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, ArrowRight, Home, LayoutDashboard, Sparkles, Clock } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Success Header */}
        <div className="mb-10">
          <div className="relative w-28 h-28 mx-auto mb-8">
            <div className="w-28 h-28 bg-green-100 rounded-full flex items-center justify-center shadow-xl shadow-green-200/50 animate-bounce-slow">
              <CheckCircle className="w-14 h-14 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg transform rotate-12">
              <Sparkles className="w-5 h-5 text-yellow-700" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Pagamento Confirmado! 🚀
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Muito obrigado por confiar no EventSpace! Sua ativação está sendo processada.
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-10 mb-8 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>

          <h3 className="font-black text-gray-900 mb-6 text-xl flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Status da Ativação
          </h3>

          <div className="space-y-6">
            <div className="flex items-start gap-5">
              <div className="bg-green-100 text-green-700 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                ✓
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Pagamento Recebido</h4>
                <p className="text-sm text-gray-500 font-medium">Seu pagamento foi confirmado pelo Stripe.</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 animate-pulse">
                2
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Sincronizando Sistema</h4>
                <p className="text-sm text-gray-500 font-medium">Estamos ativando seu anúncio agora. Isso pode levar alguns segundos.</p>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className="bg-gray-100 text-gray-400 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-gray-400">Anúncio Publicado</h4>
                <p className="text-sm text-gray-400 font-medium">Seu anúncio ficará disponível para milhares de organizadores de eventos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard/meus-anuncios"
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-2xl hover:bg-blue-700 transition-all font-bold text-lg shadow-xl shadow-blue-500/20 active:scale-95"
          >
            <LayoutDashboard className="w-6 h-6" />
            Ir para Meus Anúncios
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/"
            className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-white text-gray-700 border-2 border-gray-100 px-10 py-4 rounded-2xl hover:bg-gray-50 transition-all font-bold text-lg active:scale-95"
          >
            <Home className="w-6 h-6" />
            Voltar ao Início
          </Link>
        </div>

        {/* Help Link */}
        <p className="mt-12 text-gray-400 font-bold text-sm">
          A ativação pode levar até 2 minutos. Se persistir inativo, <a href="#" className="underline hover:text-gray-600 transition-colors">fale com o suporte</a>.
        </p>

        {sessionId && (
          <p className="mt-4 text-[10px] text-gray-300 font-mono">
            Ref: {sessionId}
          </p>
        )}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
