import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Link } from 'react-router-dom'
import {
  UserPlus,
  ImagePlus,
  Rocket,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Crie sua Conta Grátis",
      description: "Cadastre-se em menos de 1 minuto. É rápido, simples e não exigimos cartão de crédito nesta etapa.",
      color: "blue",
      badge: "Passo Inicial"
    },
    {
      icon: ImagePlus,
      title: "2. Monte seu Anúncio",
      description: "Adicione fotos incríveis, descreva seu espaço e liste os diferenciais. Você pode deixar tudo pronto antes de pagar.",
      color: "purple",
      badge: "Prepare Tudo"
    },
    {
      icon: Rocket,
      title: "3. Ative e Receba Clientes",
      description: "Tudo pronto? Realize o pagamento único de ativação e seu anúncio vai para o ar imediatamente para milhares de pessoas.",
      color: "green",
      badge: "Comece a Faturar"
    }
  ]

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gray-900 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-t from-gray-900 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-8 font-medium tracking-wide uppercase">
            <Link to="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-400">Como funciona</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Do cadastro ao primeiro cliente <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
              em 3 passos simples
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-12">
            Eliminamos a burocracia. Aqui você tem controle total sobre seu anúncio e negociações.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-1 bg-gray-100 rounded-full"></div>

            {steps.map((step, index) => {
              const Icon = step.icon
              const colors = {
                blue: "text-blue-600 bg-blue-100 border-blue-200",
                purple: "text-purple-600 bg-purple-100 border-purple-200",
                green: "text-green-600 bg-green-100 border-green-200"
              }
              const colorClass = colors[step.color as keyof typeof colors]

              return (
                <div key={index} className="relative flex flex-col items-center text-center group">
                  {/* Icon Circle */}
                  <div className={`w-32 h-32 rounded-full ${colorClass.split(' ')[1]} flex items-center justify-center mb-8 relative z-10 border-4 border-white shadow-xl shadow-gray-100 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`w-12 h-12 ${colorClass.split(' ')[0]}`} />
                    <div className={`absolute -bottom-3 px-3 py-1 bg-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border ${colorClass.split(' ')[2]} ${colorClass.split(' ')[0]}`}>
                      {step.badge}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed max-w-sm px-4">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-20 text-center">
            <Link
              to="/cadastro"
              className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Não precisa de cartão de crédito para se cadastrar
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Simplified */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-10">
            <HelpCircle className="w-6 h-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Quando eu pago?
              </h3>
              <p className="text-gray-600">
                Você só paga quando seu anúncio estiver pronto e você quiser publicá-lo. O cadastro e a criação do rascunho são gratuitos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                É uma mensalidade?
              </h3>
              <p className="text-gray-600">
                O Plano Fundador é um <strong>pagamento único</strong>. Você paga uma vez e seu anúncio fica ativo para sempre nesta modalidade.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Preciso pagar comissão?
              </h3>
              <p className="text-gray-600">
                Não! Diferente de outros sites, nós não cobramos comissão sobre os seus contratos. O valor negociado com o cliente é 100% seu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}