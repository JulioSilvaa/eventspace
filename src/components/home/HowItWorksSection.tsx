import { useState } from 'react'
import { Search, Megaphone, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'seekers' | 'advertisers'>('seekers')

  const seekersSteps = [
    {
      number: 1,
      title: 'Busque',
      description: 'Encontre espaços, serviços e equipamentos na sua região',
      icon: '🔍',
    },
    {
      number: 2,
      title: 'Compare',
      description: 'Veja fotos, preços e avaliações para escolher o melhor',
      icon: '⚖️',
    },
    {
      number: 3,
      title: 'Contate Direto',
      description: 'Fale direto com o anunciante via WhatsApp ou telefone',
      icon: '📞',
    },
  ]

  const advertisersSteps = [
    {
      number: 1,
      title: 'Cadastre-se',
      description: 'Crie sua conta grátis em menos de 2 minutos',
      icon: '✍️',
    },
    {
      number: 2,
      title: 'Crie seu Anúncio',
      description: 'Adicione fotos, descrição e informações de contato',
      icon: '📸',
    },
    {
      number: 3,
      title: 'Receba Contatos',
      description: 'Interessados entram em contato direto com você',
      icon: '💬',
    },
  ]

  const steps = activeTab === 'seekers' ? seekersSteps : advertisersSteps

  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como Funciona o EventSpace?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simples, rápido e sem complicações
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('seekers')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'seekers'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Search className="w-5 h-5" />
              Para Quem Busca
            </button>
            <button
              onClick={() => setActiveTab('advertisers')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'advertisers'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Megaphone className="w-5 h-5" />
              Para Anunciantes
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative"
            >
              {/* Connector Line (Desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
              )}

              {/* Step Card */}
              <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-primary-200 hover:shadow-lg transition-all duration-300 group">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to={activeTab === 'seekers' ? '/espacos' : '/anuncie/novo'}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            {activeTab === 'seekers' ? 'Buscar Agora' : 'Anunciar Grátis'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Trust Line */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Sem taxas escondidas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Contato 100% direto</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Cadastro gratuito</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
