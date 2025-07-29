import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Crown, Star, Check, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  context: 'create_ad' | 'feature_ad' | 'no_plan' | 'generic'
  title?: string
  description?: string
}

const contextData = {
  create_ad: {
    title: 'Limite de anúncios atingido!',
    description: 'Você já criou o máximo de anúncios permitidos no seu plano atual.',
    benefits: [
      'Mais anúncios ativos',
      'Destaque nos resultados',
      'Relatórios avançados',
      'Suporte por email'
    ]
  },
  feature_ad: {
    title: 'Destaque seus anúncios!',
    description: 'Anúncios destacados recebem até 5x mais visualizações.',
    benefits: [
      'Aparecem no topo das buscas',
      'Destaque na página inicial',
      'Badge especial de premium',
      '5x mais visualizações'
    ]
  },
  no_plan: {
    title: 'Escolha um plano para anunciar!',
    description: 'Para criar anúncios, você precisa escolher um dos nossos planos pagos.',
    benefits: [
      'Crie anúncios profissionais',
      'Receba contatos diretos',
      'Sem comissões sobre vendas',
      'Suporte dedicado'
    ]
  },
  generic: {
    title: 'Escolha seu plano',
    description: 'Desbloqueie todo o potencial da sua conta.',
    benefits: [
      'Recursos profissionais',
      'Suporte por email',
      'Funcionalidades exclusivas',
      'Sem comissões sobre vendas'
    ]
  }
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  context,
  title: customTitle,
  description: customDescription 
}: UpgradeModalProps) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium'>('basic')
  
  console.log('🔍 UpgradeModal render - isOpen:', isOpen)
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null

  const data = contextData[context]
  const finalTitle = customTitle || data.title
  const finalDescription = customDescription || data.description

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 'R$ 49,90',
      period: '/mês',
      features: [
        'Até 3 anúncios ativos',
        'Relatórios básicos',
        'Suporte por email',
        'Remove marca d\'água'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 79,90',
      period: '/mês',
      features: [
        'Até 5 anúncios ativos',
        'Anúncios destacados ilimitados',
        'Até 10 fotos por anúncio',
        'Relatórios avançados',
        'Dashboard personalizado'
      ],
      popular: false
    }
  ]

  return (
    <div 
      className="fixed inset-0 z-[60] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        {/* Modal */}
        <div 
          className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{finalTitle}</h2>
                <p className="text-gray-600">{finalDescription}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plan Status (if applicable) */}
          {profile?.plan_type === 'free' && (
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-indigo-900">Conta Gratuita</p>
                  <p className="text-indigo-700">
                    Escolha um plano para começar a anunciar
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">0</p>
                  <p className="text-sm text-indigo-500">anúncios ativos</p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Com o upgrade você ganha:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Escolha seu plano:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`
                    relative border-2 rounded-xl p-6 cursor-pointer transition-all
                    ${selectedPlan === plan.id 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedPlan(plan.id as 'basic' | 'premium')}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-primary-600">{plan.price}</span>
                      <span className="text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlan === plan.id}
                    onChange={() => setSelectedPlan(plan.id as 'basic' | 'premium')}
                    className="sr-only"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose()
                  navigate(`/checkout?plan=${selectedPlan}&context=${context}`)
                }}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all font-medium text-center flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Fazer Upgrade Agora
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Depois
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>Sem compromisso</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>Suporte dedicado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}