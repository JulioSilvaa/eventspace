
import { Check, Star, TrendingUp, Users, Target } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Link } from 'react-router-dom'

export default function Advertise() {
  const plans = [
    {
      name: 'Banner Hero',
      price: 'R$ 499',
      period: '/mês',
      description: 'Destaque máximo no topo da página inicial.',
      features: [
        'Visibilidade Premium',
        'Topo da Home (Desktop e Mobile)',
        'Link direto para seu site/whatsapp',
        'Relatório mensal de cliques'
      ],
      highlight: true,
      buttonText: 'Contratar Hero',
      link: 'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20Banner%20Hero'
    },
    {
      name: 'Banner Busca',
      price: 'R$ 299',
      period: '/mês',
      description: 'Apareça entre os resultados de busca.',
      features: [
        'Alta relevância contextual',
        'Aparece na lista de anúncios',
        'Ideal para ofertas específicas',
        'Rotação inteligente'
      ],
      highlight: false,
      buttonText: 'Contratar Busca',
      link: 'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20Banner%20Busca'
    },
    {
      name: 'Banner Lateral',
      price: 'R$ 199',
      period: '/mês',
      description: 'Presença constante na barra lateral.',
      features: [
        'Exibição em todas as páginas de busca',
        'Custo-benefício excelente',
        'Fixo na navegação Desktop',
        'Ótimo para branding'
      ],
      highlight: false,
      buttonText: 'Contratar Lateral',
      link: 'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20Banner%20Lateral'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow pt-24 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Aumente suas vendas com o <span className="text-primary-600">EventSpace Ads</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Conecte sua marca a milhares de pessoas que buscam espaços e serviços para eventos todos os dias.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Público Qualificado</h3>
              <p className="text-gray-500 text-sm">Pessoas prontas para alugar e contratar.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="bg-green-100 p-3 rounded-full mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Alta Conversão</h3>
              <p className="text-gray-500 text-sm">Anúncios posicionados estrategicamente.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="bg-purple-100 p-3 rounded-full mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Segmentação Local</h3>
              <p className="text-gray-500 text-sm">Alcance clientes na sua região.</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 md:p-16 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

          <h2 className="text-3xl font-bold text-center mb-12">Escolha o plano ideal para você</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 transition-transform hover:-translate-y-2 duration-300 ${plan.highlight
                    ? 'bg-gray-900 text-white shadow-2xl ring-4 ring-primary-500 ring-opacity-50'
                    : 'bg-gray-50 text-gray-900 border border-gray-200'
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                    <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      Popular
                    </span>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline mb-8">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className={`ml-1 text-sm ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.highlight ? 'text-primary-400' : 'text-primary-600'}`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center py-3 px-6 rounded-xl font-bold transition-colors ${plan.highlight
                      ? 'bg-primary-600 hover:bg-primary-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                >
                  {plan.buttonText}
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Dúvidas? Entre em contato pelo e-mail <a href="mailto:comercial@eventspace.com.br" className="text-primary-600 font-medium hover:underline">comercial@eventspace.com.br</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
