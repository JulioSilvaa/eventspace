import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Link } from 'react-router-dom'
import {
  Search,
  MessageCircle,
  HandHeart,
  DollarSign,
  Shield,
  Users,
  Building2,
  CalendarCheck,
  PartyPopper,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Store as StoreIcon
} from 'lucide-react'

export default function HowItWorks() {
  const clientSteps = [
    {
      icon: Search,
      title: "Busque",
      description: "Use filtros inteligentes para encontrar o espaço perfeito.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: MessageCircle,
      title: "Converse",
      description: "Fale direto com o proprietário via WhatsApp.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: HandHeart,
      title: "Negocie",
      description: "Combine valores e detalhes sem taxas extras.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: PartyPopper,
      title: "Celebre",
      description: "Tudo pronto! Aproveite seu evento.",
      color: "bg-orange-100 text-orange-600"
    }
  ]

  const supplierSteps = [
    {
      icon: Users,
      title: "Crie Conta",
      description: "Cadastro gratuito em menos de 2 minutos.",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      icon: Building2,
      title: "Anuncie",
      description: "Publique fotos e detalhes do seu espaço.",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: CalendarCheck,
      title: "Receba",
      description: "Clientes interessados chamam você direto.",
      color: "bg-teal-100 text-teal-600"
    },
    {
      icon: DollarSign,
      title: "Fature 100%",
      description: "O valor é todo seu. Sem comissões.",
      color: "bg-emerald-100 text-emerald-600"
    }
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8 font-medium tracking-wide uppercase">
            <Link to="/" className="hover:text-blue-600 transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-600">Como funciona</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Simples. Direto. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Sem taxas escondidas.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-12">
            O EventSpace conecta quem precisa com quem oferece, eliminando intermediários
            para garantir o melhor negócio para todos.
          </p>

          {/* Main Stats in Hero - Clean Look */}
          <div className="inline-flex flex-wrap justify-center gap-4 bg-white p-3 rounded-2xl shadow-xl shadow-gray-100 border border-gray-100">
            <div className="px-8 py-4 text-center border-r border-gray-100 last:border-0">
              <div className="text-3xl font-black text-gray-900">0%</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Comissão</div>
            </div>
            <div className="px-8 py-4 text-center border-r border-gray-100 last:border-0">
              <div className="text-3xl font-black text-gray-900">100%</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Garantido</div>
            </div>
            <div className="px-8 py-4 text-center">
              <div className="text-3xl font-black text-gray-900">24h</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Online</div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section - Clients */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">
              Para Clientes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Encontre o lugar ideal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connection Line Background (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>

            {clientSteps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Step Marker */}
                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center border-4 border-gray-50 mb-6 relative z-10 group-hover:border-blue-50 transition-colors">
                  <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-7 h-7" />
                  </div>
                </div>

                <div className="text-center px-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section - Suppliers */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider mb-4 inline-block">
              Para Fornecedores
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Receba mais pedidos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supplierSteps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
            >
              Começar a Anunciar Grátis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Dúvidas Comuns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                É realmente gratuito?
              </h3>
              <p className="text-gray-600 text-sm">Sim! Tanto para clientes quanto para anunciantes. Mantemos a plataforma gratuita para fomentar o mercado.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <Shield className="w-5 h-5 text-blue-600 mr-2" />
                É seguro negociar?
              </h3>
              <p className="text-gray-600 text-sm">Sim, mas recomendamos sempre visitar o local e fazer contratos formais. Nós apenas conectamos as partes.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <Users className="w-5 h-5 text-purple-600 mr-2" />
                Quem pode anunciar?
              </h3>
              <p className="text-gray-600 text-sm">Qualquer pessoa que tenha um espaço para eventos, equipamentos ou ofereça serviços relacionados.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <MessageCircle className="w-5 h-5 text-orange-600 mr-2" />
                Como entro em contato?
              </h3>
              <p className="text-gray-600 text-sm">Em cada anúncio existe um botão de WhatsApp que abre uma conversa direta com o fornecedor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern footer CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para transformar seu evento?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              Criar Conta Agora
            </Link>
            <Link to="/espacos" className="bg-transparent border border-gray-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
              Ver Espaços Disponíveis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}