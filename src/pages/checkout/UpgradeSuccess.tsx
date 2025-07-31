import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Crown, Zap, Star, Shield, Clock } from 'lucide-react'

export default function UpgradeSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const plan = searchParams.get('plan') || 'premium'

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
          Upgrade Realizado!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Bem-vindo ao Plano {plan.charAt(0).toUpperCase() + plan.slice(1)}! 🎉
        </p>

        {/* New Features Available */}
        <div className="bg-white rounded-lg p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recursos Desbloqueados</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Destaque Ilimitado</p>
                <p className="text-sm text-gray-600">4x mais visitas nos seus anúncios</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">20 Fotos por Anúncio</p>
                <p className="text-sm text-gray-600">Mostre todos os detalhes</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Analytics Detalhados</p>
                <p className="text-sm text-gray-600">Relatórios completos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Dashboard Premium</p>
                <p className="text-sm text-gray-600">Interface otimizada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Explorar Dashboard Premium
          </button>
          
          <button
            onClick={() => navigate('/dashboard/configuracoes?tab=subscription')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Ver Configurações
          </button>
        </div>

        {/* Auto Redirect Info */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3">
            Aproveite todos os recursos Premium! 🚀
          </p>
          <p className="text-xs text-gray-500">
            Redirecionamento automático em 10 segundos...
          </p>
        </div>
      </div>
    </div>
  )
}