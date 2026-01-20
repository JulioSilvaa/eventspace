
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Check, Star, Layout, List, MousePointer2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function BecomeSponsor() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState('Silver')

  const handlePlanClick = (planName: string) => {
    navigate(`/checkout/sponsor?plan=${planName}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />

      {/* Hero Section */}
      <div className="bg-primary-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50935339?w=1600&q=80')] bg-cover bg-center opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-700 text-primary-100 text-sm font-semibold mb-6 border border-primary-600">
            Para Empresas e Marcas
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
            Coloque sua marca onde <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200">
              o lazer acontece.
            </span>
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-10">
            Milhares de pessoas buscam o lugar perfeito para seus eventos todos os dias.
            Seja visto por quem está pronto para contratar.
          </p>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Bronze Plan */}
          <div
            onClick={() => setSelectedPlan('Bronze')}
            className={`cursor-pointer bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${selectedPlan === 'Bronze'
              ? 'shadow-2xl border-2 border-primary-500 transform scale-105 relative z-10'
              : 'shadow-xl border border-gray-100 hover:-translate-y-1'
              }`}
          >
            <div className="p-8 pb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedPlan === 'Bronze' ? 'bg-primary-100' : 'bg-orange-100'
                }`}>
                <List className={`w-6 h-6 transition-colors ${selectedPlan === 'Bronze' ? 'text-primary-600' : 'text-orange-600'
                  }`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Bronze Partner</h3>
              <p className="text-gray-500 text-sm mb-4">Visibilidade constante na lateral.</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-black text-gray-900">R$ 200</span>
                <span className="text-gray-500 ml-2">/mês</span>
              </div>
            </div>

            {/* Visual Schematic */}
            <div className="px-8 py-4 bg-gray-50 border-y border-gray-100 flex justify-center h-40 items-center">
              <div className="w-48 h-32 bg-white border border-gray-200 rounded-lg shadow-sm relative p-2 flex gap-2">
                {/* Sidebar */}
                <div className="w-12 h-full flex flex-col gap-2">
                  <div className="w-full h-8 bg-gray-100 rounded"></div>
                  <div className={`w-full h-16 border rounded flex items-center justify-center transition-colors ${selectedPlan === 'Bronze' ? 'bg-primary-100 border-primary-200' : 'bg-orange-100 border-orange-200'
                    }`}>
                    <div className={`w-2 h-2 rounded-full animate-pulse ${selectedPlan === 'Bronze' ? 'bg-primary-400' : 'bg-orange-400'
                      }`}></div>
                  </div>
                  <div className="w-full h-full bg-gray-50 rounded"></div>
                </div>
                {/* Content */}
                <div className="flex-1 h-full bg-gray-50 rounded grid grid-cols-2 gap-1 content-start p-1">
                  <div className="w-full h-8 bg-gray-200 rounded"></div>
                  <div className="w-full h-8 bg-gray-200 rounded"></div>
                  <div className="w-full h-8 bg-gray-200 rounded"></div>
                  <div className="w-full h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-6 flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start text-sm text-gray-600">
                  <Check className={`w-5 h-5 mr-2 shrink-0 ${selectedPlan === 'Bronze' ? 'text-primary-600' : 'text-green-500'}`} />
                  Banner na barra lateral de filtros
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <Check className={`w-5 h-5 mr-2 shrink-0 ${selectedPlan === 'Bronze' ? 'text-primary-600' : 'text-green-500'}`} />
                  Visível em Desktop e Tablet
                </li>
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanClick('Bronze');
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${selectedPlan === 'Bronze'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                Contratar Bronze
              </button>
            </div>
          </div>

          {/* Silver Plan (Recommended) */}
          <div
            onClick={() => setSelectedPlan('Silver')}
            className={`cursor-pointer bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 relative ${selectedPlan === 'Silver'
              ? 'shadow-2xl border-2 border-primary-500 transform scale-105 z-10'
              : 'shadow-xl border border-gray-100 hover:-translate-y-1'
              }`}
          >
            {/* Always show gradient or only when specific? Keeping it as 'Recommended' style usually implies specific styling */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-400 to-primary-600" />
            <div className="absolute top-4 right-4 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
              Mais Popular
            </div>

            <div className="p-8 pb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
                <MousePointer2 className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Silver Partner</h3>
              <p className="text-gray-500 text-sm mb-4">Intercale sua marca nos resultados.</p>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-gray-900">R$ 450</span>
                <span className="text-gray-500 ml-2">/mês</span>
              </div>
            </div>

            {/* Visual Schematic */}
            <div className="px-8 py-4 bg-gray-50 border-y border-gray-100 flex justify-center h-40 items-center">
              <div className="w-48 h-32 bg-white border border-gray-200 rounded-lg shadow-sm relative p-2 flex flex-col gap-1 overflow-hidden">
                <div className="w-full h-6 bg-gray-200 rounded shrink-0"></div>
                <div className="w-full h-6 bg-gray-200 rounded shrink-0"></div>
                {/* The Ad */}
                <div className="w-full h-10 bg-gradient-to-r from-primary-50 to-white border border-primary-100 rounded shrink-0 flex items-center px-2 gap-2">
                  <div className="w-6 h-6 rounded bg-primary-200"></div>
                  <div className="flex-1 h-2 bg-primary-100 rounded"></div>
                </div>
                <div className="w-full h-6 bg-gray-200 rounded shrink-0"></div>
              </div>
            </div>

            <div className="p-8 pt-6 flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start text-sm text-gray-900 font-medium">
                  <Check className="w-5 h-5 text-primary-600 mr-2 shrink-0" />
                  Banner no meio do feed de busca
                </li>
                <li className="flex items-start text-sm text-gray-900 font-medium">
                  <Check className="w-5 h-5 text-primary-600 mr-2 shrink-0" />
                  Rotação automática com outros parceiros
                </li>
                <li className="flex items-start text-sm text-gray-900 font-medium">
                  <Check className="w-5 h-5 text-primary-600 mr-2 shrink-0" />
                  Alta taxa de cliques (CTR)
                </li>
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanClick('Silver');
                }}
                className={`w-full py-4 px-6 rounded-xl font-bold transition-all ${selectedPlan === 'Silver'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}>
                Contratar Silver
              </button>
            </div>
          </div>

          {/* Gold Plan */}
          <div
            onClick={() => setSelectedPlan('Gold')}
            className={`cursor-pointer bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${selectedPlan === 'Gold'
              ? 'shadow-2xl border-2 border-primary-500 transform scale-105 relative z-10'
              : 'shadow-xl border border-gray-100 hover:-translate-y-1'
              }`}
          >
            <div className="p-8 pb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${selectedPlan === 'Gold' ? 'bg-primary-100' : 'bg-yellow-100'
                }`}>
                <Star className={`w-6 h-6 transition-colors ${selectedPlan === 'Gold' ? 'text-primary-600' : 'text-yellow-600'
                  }`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Gold Partner</h3>
              <p className="text-gray-500 text-sm mb-4">Domine o topo da página inicial.</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-black text-gray-900">R$ 800</span>
                <span className="text-gray-500 ml-2">/mês</span>
              </div>
            </div>

            {/* Visual Schematic */}
            <div className="px-8 py-4 bg-gray-50 border-y border-gray-100 flex justify-center h-40 items-center">
              <div className="w-48 h-32 bg-white border border-gray-200 rounded-lg shadow-sm relative flex flex-col">
                <div className={`w-full h-12 rounded-t-lg flex items-center justify-center transition-all ${selectedPlan === 'Gold'
                  ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                  : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                  }`}>
                  <span className="text-[8px] text-white font-bold opacity-80">BANNER HERO</span>
                </div>
                <div className="flex-1 p-2 grid grid-cols-2 gap-1">
                  <div className="bg-gray-100 rounded"></div>
                  <div className="bg-gray-100 rounded"></div>
                  <div className="bg-gray-100 rounded"></div>
                  <div className="bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-6 flex-1 flex flex-col">
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start text-sm text-gray-600">
                  <Check className={`w-5 h-5 mr-2 shrink-0 ${selectedPlan === 'Gold' ? 'text-primary-600' : 'text-green-500'}`} />
                  Banner Hero na Home Page (Topo)
                </li >
                <li className="flex items-start text-sm text-gray-600">
                  <Check className={`w-5 h-5 mr-2 shrink-0 ${selectedPlan === 'Gold' ? 'text-primary-600' : 'text-green-500'}`} />
                  Visibilidade máxima da plataforma
                </li>
                <li className="flex items-start text-sm text-gray-600">
                  <Check className={`w-5 h-5 mr-2 shrink-0 ${selectedPlan === 'Gold' ? 'text-primary-600' : 'text-green-500'}`} />
                  Exclusividade no segmento
                </li>
              </ul>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlanClick('Gold');
                }}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${selectedPlan === 'Gold'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700'
                  : 'bg-gray-900 text-white hover:bg-black'
                  }`}>
                Contratar Gold
              </button>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
