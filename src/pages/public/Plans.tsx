import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Check, Rocket, Sparkles, AlertCircle, Shield, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { subscriptionService } from '@/services/subscriptionService'

export default function Plans() {
  const [pricing, setPricing] = useState<{
    plan_type: string
    price: number
    spots_remaining: number
    total_spots?: number
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPricing() {
      try {
        const data = await subscriptionService.getCurrentPricing()
        setPricing(data)
      } catch (error) {
        console.error('Failed to load pricing', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPricing()
  }, [])

  const founderBenefits = [
    "Anúncios na plataforma",
    "Recebimento de contatos",
    "Dashboard de métricas",
    "0% de comissão",
    "Selo de Parceiro Fundador",
    "Preço de R$ 30 fixo para sempre"
  ]

  const standardBenefits = [
    "Anúncios na plataforma",
    "Recebimento de contatos",
    "Dashboard de métricas",
    "0% de comissão"
  ]

  const isFounderActive = pricing?.plan_type === 'founder' && pricing?.spots_remaining > 0

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 bg-gray-900 text-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          {isFounderActive ? (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide uppercase border border-white/10">
                <Crown className="w-4 h-4 text-yellow-500" />
                Oferta de Lançamento
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Faça parte do grupo de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Fundadores</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Garanta condições especiais exclusivas e ajude a construir o futuro do mercado de eventos.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 px-4 py-1.5 rounded-full text-sm font-bold mb-6 tracking-wide uppercase border border-white/10">
                <Rocket className="w-4 h-4 text-blue-400" />
                Comece Agora
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Destaque seu negócio no <br />
                <span className="text-white">EventSpace</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                A plataforma simples e direta para conectar seus espaços e serviços aos melhores clientes.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-4 -mt-10 relative z-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch">

              {pricing?.plan_type === 'founder' && (
                <div className={`flex-1 max-w-md w-full relative group order-last md:order-first ${!isFounderActive ? 'opacity-70 grayscale' : ''}`}>
                  {/* Glowing Border Application */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>

                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden h-full flex flex-col border border-yellow-100">
                    {/* Badge */}
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-bold px-4 py-2 text-center uppercase tracking-wider flex items-center justify-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Restam apenas {pricing?.spots_remaining} vagas
                    </div>

                    <div className="p-4 sm:p-6 md:p-8 text-center flex-1 bg-gradient-to-b from-yellow-50/50 to-white">
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 uppercase tracking-widest mb-2">
                        Plano Fundador
                      </h3>
                      <p className="text-sm text-yellow-700 font-medium mb-6">Preço especial para os primeiros {pricing?.total_spots || 20}</p>

                      <div className="flex justify-center items-baseline mb-2 relative">
                        {/* Original Price Strike */}
                        <span className="text-base sm:text-lg text-gray-400 line-through decoration-red-400 decoration-2 mr-2">R$ 50</span>
                        <span className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">R$ 30</span>
                        <span className="text-base sm:text-xl text-gray-500 ml-1 font-medium">,00 /mês</span>
                      </div>
                      <p className="text-yellow-700/90 text-sm mb-8 font-medium">
                        Você pagará R$ 30 fixo para sempre enquanto for assinante
                      </p>

                      <Link
                        to="/cadastro"
                        className="block w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-yellow-500/30 transform hover:-translate-y-1 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        Garantir Vaga de Fundador
                        <Rocket className="w-5 h-5" />
                      </Link>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
                      <ul className="space-y-4">
                        {founderBenefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="bg-yellow-100 rounded-full p-1 mt-0.5 shrink-0">
                              <Check className="w-3 h-3 text-yellow-700" />
                            </div>
                            <span className="text-gray-700 font-medium">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Standard Price Anchor */}
              <div className="flex-1 max-w-md w-full relative opacity-90 hover:opacity-100 transition-opacity">
                <div className="h-full bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                  <div className="bg-gray-100 text-gray-500 text-xs font-bold px-4 py-2 text-center uppercase tracking-wider">
                    Preço Padrão
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 text-center flex-1">
                    <h3 className={`text-base sm:text-lg font-bold uppercase tracking-widest mb-4 ${!isFounderActive ? 'text-blue-600' : 'text-gray-600'}`}>
                      Anunciante Padrão
                    </h3>



                    <div className="flex justify-center items-baseline mb-2">
                      <span className={`text-3xl sm:text-4xl md:text-5xl font-black ${!isFounderActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        R$ 50
                      </span>
                      <span className={`text-base sm:text-lg ml-1 ${!isFounderActive ? 'text-gray-500' : 'text-gray-400'}`}>
                        ,00 <span className="text-sm font-normal">/mês</span>
                      </span>
                    </div>
                    <p className={`text-sm mb-8 ${!isFounderActive ? 'text-gray-500' : 'text-gray-400'}`}>
                      {isFounderActive
                        ? 'Valor após encerramento das vagas'
                        : 'Assinatura recorrente, cancele quando quiser'}
                    </p>

                    {!isFounderActive ? (
                      <Link
                        to="/cadastro"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                      >
                        Quero Anunciar
                        <Rocket className="w-5 h-5" />
                      </Link>
                    ) : (
                      <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed border border-gray-200">
                        Disponível em breve
                      </button>
                    )}
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 border-t border-gray-100 bg-gray-50/50 flex-1">
                    <ul className="space-y-4">
                      {standardBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className={`rounded-full p-1 mt-0.5 shrink-0 ${!isFounderActive ? 'bg-blue-100' : 'bg-gray-200'}`}>
                            <Check className={`w-3 h-3 ${!isFounderActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          </div>
                          <span className={`font-medium ${!isFounderActive ? 'text-gray-700' : 'text-gray-500'}`}>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="pb-24 pt-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="bg-blue-50 p-4 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Garantia de Satisfação</h3>
              <p className="text-gray-600">
                Seu anúncio ficará visível para milhares de potenciais clientes.
                Não cobramos comissão sobre suas negociações. O valor é 100% seu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
