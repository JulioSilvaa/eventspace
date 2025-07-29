import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Check, Crown, Star, Zap, Shield, Clock, Heart, AlertCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/hooks/useAuth'

export default function Pricing() {
  const billingCycle = 'monthly'
  const { profile, isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isRequired = searchParams.get('required') === 'true'

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      description: 'Ideal para proprietários que querem testar a plataforma',
      price: 'R$ 49,90',
      originalPrice: null,
      period: '/mês',
      features: [
        '10 fotos profissionais por anúncio',
        'Relatórios de visualizações e contatos',
        'Suporte por email (48h)',
        '✅ 0% de comissão sobre vendas'
      ],
      buttonText: profile?.plan_type === 'basic' ? 'Plano Atual' : (!isAuthenticated ? 'Criar Conta e Escolher' : 'Escolher Básico'),
      buttonVariant: 'primary' as const,
      popular: true,
      current: profile?.plan_type === 'basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Para negócios sérios que querem maximizar resultados',
      price: 'R$ 79,90',
      originalPrice: null,
      period: '/mês',
      features: [
        'Destaque ilimitado (4x mais visitas)',
        '20 fotos profissionais por anúncio',
        'Relatórios detalhados e analytics',
        'Dashboard personalizado + insights',
        '✅ 0% de comissão sobre vendas'
      ],
      buttonText: profile?.plan_type === 'premium' ? 'Plano Atual' : (!isAuthenticated ? 'Criar Conta e Escolher' : 'Escolher Premium'),
      buttonVariant: 'primary' as const,
      popular: false,
      current: profile?.plan_type === 'premium'
    }
  ]

  const benefits = [
    {
      icon: Crown,
      title: 'Anúncios Destacados',
      description: 'Apareça no topo das buscas e na página inicial'
    },
    {
      icon: Star,
      title: '5x Mais Visualizações',
      description: 'Anúncios destacados recebem muito mais atenção'
    },
    {
      icon: Zap,
      title: 'Sem Comissões',
      description: 'Negocie direto com os clientes, sem intermediários'
    },
    {
      icon: Shield,
      title: 'Suporte por Email',
      description: 'Atendimento por email para resolver suas dúvidas'
    },
    {
      icon: Clock,
      title: 'Relatórios em Tempo Real',
      description: 'Acompanhe o desempenho dos seus anúncios'
    },
    {
      icon: Heart,
      title: 'Cancele Quando Quiser',
      description: 'Sem fidelidade ou taxas de cancelamento'
    }
  ]

  const handlePlanSelection = (planId: string) => {
    // Se não estiver logado, vai para cadastro
    if (!isAuthenticated) {
      navigate('/cadastro')
      return
    }

    // Se estiver logado, vai direto para checkout
    navigate(`/checkout?plan=${planId}&billing=${billingCycle}`)
  }

  const faqs = [
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim! Você pode cancelar seu plano a qualquer momento sem taxas ou multas. Seus anúncios permanecerão ativos até o final do período pago.'
    },
    {
      question: 'O que acontece com meus anúncios se eu cancelar?',
      answer: 'Seus anúncios continuarão ativos até o final do período pago. Após isso, eles ficarão pausados mas não serão deletados.'
    },
    {
      question: 'Posso fazer upgrade ou downgrade do meu plano?',
      answer: 'Sim! Você pode alterar seu plano a qualquer momento. O valor será calculado proporcionalmente.'
    },
    {
      question: 'Como funciona o cadastro?',
      answer: 'O cadastro é gratuito para navegar pela plataforma. Para anunciar, você precisa escolher um plano pago.'
    },
    {
      question: 'Vocês cobram comissões das vendas?',
      answer: 'Não! Diferente de outras plataformas, não cobramos comissão nenhuma. Você negocia direto com o cliente.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Required Plan Alert */}
        {isRequired && (
          <section className="bg-orange-50 border-b border-orange-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-center gap-3 text-orange-800">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">
                  🔒 Para acessar o dashboard e criar anúncios, você precisa escolher um plano pago.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section */}
        <section className={`${isRequired ? 'py-16' : 'py-20'} bg-gradient-to-br from-primary-50 to-blue-50`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pague apenas para anunciar. Sem comissões sobre aluguéis!
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Escolha o plano ideal para seu negócio e comece a receber mais clientes hoje mesmo.
            </p>

          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`
                    relative bg-white rounded-2xl p-8 
                    ${plan.popular ? 'shadow-xl border-2 border-blue-200 transform scale-105' : 'shadow-lg'}
                    ${plan.current ? 'ring-2 ring-green-500' : ''}
                  `}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  {plan.current && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                        Plano Atual
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500 ml-2">{plan.period}</span>
                    </div>
                    
                    {plan.originalPrice && (
                      <p className="text-sm text-gray-500">
                        De <span className="line-through">{plan.originalPrice}</span>
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={plan.current ? undefined : () => handlePlanSelection(plan.id)}
                    disabled={plan.current}
                    className={`
                      block w-full py-3 px-4 rounded-lg text-center font-medium transition-colors
                      ${plan.id === 'basic' && !plan.current
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                        : plan.id === 'premium' && !plan.current
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : plan.current
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-gray-900 mb-2">Por que esses preços?</h4>
              <p className="text-gray-700 mb-4">Um aluguel de R$ 100 em outras plataformas custa R$ 10 de taxa. No EventSpace: Alugue R$ 2.000/mês pagando só R$ 49,90 fixo.</p>
              <p className="text-sm text-gray-600"><strong>Economia real a partir do 5º aluguel!</strong></p>
            </div>
            
            <p className="text-gray-600 mb-4">Para quem busca espaços, nossa plataforma é <strong>100% gratuita!</strong></p>
            <Link 
              to="/espacos" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Buscar Espaços Grátis
            </Link>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Por que escolher o EventSpace?
              </h2>
              <p className="text-xl text-gray-600">
                A plataforma que realmente se importa com o seu sucesso
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-xl text-gray-600">
                Tire suas dúvidas sobre nossos planos
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Junte-se a centenas de anunciantes que já fazem parte do EventSpace
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!profile && (
                <Link
                  to="/cadastro"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Criar Conta
                </Link>
              )}
              <Link
                to="/contato"
                className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary-600 transition-colors font-medium"
              >
                Falar com Consultor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}