
import { Check, Star, TrendingUp, Users, Target, ArrowRight } from 'lucide-react'
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
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col selection:bg-primary-500 selection:text-white">
      <Header />

      <main className="flex-grow pt-32 pb-16 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm mb-8 animate-fade-in">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-600 tracking-wide uppercase">EventSpace Ads</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-secondary-950 mb-8 tracking-tighter leading-tight">
            ACOMPANHE O <br />
            <span className="text-primary-500">CRESCIMENTO</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 font-light">
            Conecte sua marca a milhares de pessoas que buscam espaços e serviços para eventos todos os dias.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
            {[
              { icon: Users, title: 'Público Qualificado', desc: 'Pessoas prontas para alugar.', color: 'bg-primary-50 text-primary-500' },
              { icon: TrendingUp, title: 'Alta Conversão', desc: 'Anúncios estratégicos.', color: 'bg-green-50 text-green-500' },
              { icon: Target, title: 'Segmentação Local', desc: 'Alcance sua região.', color: 'bg-blue-50 text-blue-500' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-xl text-secondary-950 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-4xl font-black text-center text-secondary-950 mb-16">Escolha seu plano</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-[2.5rem] p-8 md:p-10 transition-all duration-300 flex flex-col ${plan.highlight
                  ? 'bg-secondary-950 text-white shadow-2xl scale-105 z-10'
                  : 'bg-white text-gray-900 border border-gray-100 hover:shadow-xl hover:-translate-y-1'
                  }`}
              >
                {plan.highlight && (
                  <div className="absolute top-8 right-8">
                    <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      Recomendado
                    </span>
                  </div>
                )}

                <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-secondary-950'}`}>{plan.name}</h3>
                <p className={`text-sm mb-8 font-medium ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-black tracking-tight">{plan.price}</span>
                  <span className={`ml-2 font-medium ${plan.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className={`mt-1 mr-3 p-1 rounded-full ${plan.highlight ? 'bg-primary-500/20 text-primary-500' : 'bg-green-100 text-green-600'}`}>
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                      <span className={`text-sm font-medium ${plan.highlight ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl font-bold transition-all ${plan.highlight
                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-secondary-50 hover:bg-secondary-100 text-secondary-900'
                    }`}
                >
                  {plan.buttonText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-500 font-medium">
              Dúvidas? <a href="mailto:comercial@eventspace.com.br" className="text-primary-500 hover:text-primary-600 font-bold hover:underline decoration-2">Fale com nosso comercial</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
