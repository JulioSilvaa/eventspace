import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Check, Rocket, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Plans() {
  const benefits = [
    "Anúncios ilimitados",
    "Visibilidade total na plataforma",
    "Receba contatos no WhatsApp sem custos",
    "0% de comissão sobre vendas",
    "Painel de gestão completo",
    "Suporte dedicado"
  ]

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
            Acesso Antecipado
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Publique seus espaços <span className="text-blue-600">gratuitamente</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Estamos em fase de lançamento (Beta). Aproveite para anunciar quantos espaços quiser sem pagar nada por isso.
          </p>
        </div>
      </section>

      {/* Free Card Section */}
      <section className="pb-24 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 relative transform hover:-translate-y-1 transition-transform duration-300">

            {/* Badge */}
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
              100% Grátis
            </div>

            <div className="p-8 text-center bg-gradient-to-b from-blue-50 to-white">
              <h3 className="text-lg font-semibold text-blue-600 uppercase tracking-widest mb-4">
                Plano Beta
              </h3>
              <div className="flex justify-center items-baseline mb-2">
                <span className="text-5xl font-black text-gray-900">R$ 0</span>
                <span className="text-xl text-gray-500 ml-2">,00</span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Por tempo limitado
              </p>

              <Link
                to="/cadastro"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Criar Conta Grátis
              </Link>
              <p className="text-xs text-gray-400 mt-4">
                Não solicitamos cartão de crédito
              </p>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50">
              <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-600" />
                Tudo liberado para você:
              </h4>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="bg-green-100 rounded-full p-1 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
