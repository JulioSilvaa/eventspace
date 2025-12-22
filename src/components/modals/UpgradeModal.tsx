import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Crown, Check, Zap } from 'lucide-react'
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
    title: 'Faça upgrade para criar anúncios!',
    description: 'Com o plano Profissional você pode criar anúncios e alcançar milhares de clientes.',
    benefits: [
      'Até 20 fotos profissionais',
      'Relatórios detalhados',
      'Suporte prioritário',
      '0% de comissão sobre vendas'
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
    description: 'Para criar anúncios, você precisa do plano Profissional.',
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
      'Suporte prioritário',
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

  const plan = {
    id: 'pro',
    name: 'Plano Profissional',
    price: 'R$ 49,90',
    period: '/mês',
    features: [
      'Até 20 fotos profissionais',
      'Relatórios detalhados',
      'Suporte prioritário',
      '0% de comissão sobre vendas'
    ]
  }

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50"
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
          className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{finalTitle}</h2>
                <p className="text-gray-600">{finalDescription}</p>
              </div>
            </div>
            <button
              onClick={() => {
                console.log('Fechando modal...')
                onClose()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
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
                    Faça upgrade para começar a anunciar
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

          {/* Plan */}
          <div className="p-6">
            <div className="border-2 border-blue-500 bg-blue-50 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <p className="text-sm text-gray-600 mb-4">O plano completo para seu negócio de eventos</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-blue-600">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 bg-white/60 p-4 rounded-lg">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onClose()
                  navigate(`/checkout?plan=pro&context=${context}`)
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium text-center flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                Fazer Upgrade Agora
              </button>
              <button
                onClick={() => {
                  console.log('Botão Depois clicado')
                  onClose()
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                type="button"
              >
                Depois
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Sem compromisso</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Cancele quando quiser</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-green-500" />
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