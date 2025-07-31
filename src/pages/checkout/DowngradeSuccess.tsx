import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Crown, Calendar, DollarSign, Heart } from 'lucide-react'

export default function DowngradeSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const plan = searchParams.get('plan') || 'basic'

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard/configuracoes?tab=subscription')
    }, 10000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto px-4 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Downgrade Agendado
        </h1>
        
        <p className="text-gray-600 mb-8">
          Sua mudança para o plano {plan} foi confirmada
        </p>

        {/* Important Info Cards */}
        <div className="space-y-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-primary-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Acesso Premium Mantido</p>
                <p className="text-sm text-gray-600">
                  Você ainda tem todos os recursos Premium até o final do período atual
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Mudança Efetiva</p>
                <p className="text-sm text-gray-600">
                  O plano básico entrará em vigor na próxima renovação
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Economia Mensal</p>
                <p className="text-sm text-gray-600">
                  Você economizará R$ 30,00 por mês a partir da mudança
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Upgrade Sempre Disponível</p>
                <p className="text-sm text-gray-600">
                  Você pode voltar ao Premium a qualquer momento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard/configuracoes?tab=subscription')}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Ver Configurações
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Ir para Dashboard
          </button>
        </div>

        {/* Feedback */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3">
            Obrigado pelo seu feedback!
          </p>
          <p className="text-xs text-gray-500">
            Redirecionamento automático em 10 segundos...
          </p>
        </div>
      </div>
    </div>
  )
}