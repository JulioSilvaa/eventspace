import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DevNotice from '@/components/ui/DevNotice'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, MapPin, Star, Check, ChevronLeft, Building2, Search, PartyPopper } from 'lucide-react'
import { useAdsStore } from '@/stores/adsStore'
import { AdCard } from '@/components/ads'
import { AMENITY_LABELS } from '@/constants/amenities'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const {
    featuredAds,
    popularSpaces,
    fetchFeaturedAds,
    fetchPopularSpaces,
    isLoading
  } = useAdsStore()

  // Icons mapping for features
  const FeatureIcons = {
    Search: <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Dollar: <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
  }

  // Carregar dados reais do banco
  useEffect(() => {
    fetchFeaturedAds(4)
    fetchPopularSpaces(8)
  }, [fetchFeaturedAds, fetchPopularSpaces])

  // Filtrar apenas anúncios de espaços
  const displayedFeaturedAds = featuredAds.filter(ad => ad.categories?.type === 'space' || !ad.categories?.type)

  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev === displayedFeaturedAds.length - 1 ? 0 : prev + 1))
  }, [displayedFeaturedAds.length])

  useEffect(() => {
    if (displayedFeaturedAds.length > 0) {
      const slideInterval = setInterval(nextSlide, 5000)
      return () => clearInterval(slideInterval)
    }
  }, [nextSlide, displayedFeaturedAds.length])


  const howItWorks = [
    {
      step: "01",
      icon: Search,
      title: "Busque o Espaço Ideal",
      description: "Use nossos filtros para encontrar o local perfeito para seu evento, seja um aniversário, casamento ou confraternização.",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80"
    },
    {
      step: "02",
      icon: Building2,
      title: "Diversidade de Opções",
      description: "Descubra diversos tipos de espaços, desde salões de festa e sítios até rooftops e estúdios fotográficos.",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80"
    },
    {
      step: "03",
      icon: PartyPopper,
      title: "Negocie e Celebre",
      description: "Entre em contato direto com os fornecedores, negocie preços e condições, e aproveite seu evento dos sonhos.",
      image: "https://imgs.search.brave.com/LThPtZNCI-f-wKfJAN5ssWCnaXxSwZ7yleA8UwEuXis/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2VudHJhbGNoYWNh/cmFzLmNvbS5ici9p/bWcvY2FjaGUvOTAw/eDU3NC8xMDAvYXV0/by84ZTA5NzdjMmY1/YjlmOWFhN2UxNmM5/MWIwMzM0Nzk4Ni5q/cGc"
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Proprietária de Sítio",
      rating: 5,
      comment: "Desde que comecei a anunciar no EventSpace, minha agenda não para! O melhor é que tenho contato direto com os clientes - sem taxas ou intermediários.",
      avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "João Santos",
      role: "Organizador de Eventos",
      rating: 5,
      comment: "Encontrei o espaço perfeito para o casamento da minha filha. Negociei diretamente com o proprietário e consegui um ótimo preço sem intermediação.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
    },
    {
      name: "Ana Costa",
      role: "Cerimonialista",
      rating: 5,
      comment: "A variedade de espaços cadastrados é impressionante. Consigo encontrar locais únicos para cada perfil de cliente que atendo.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ]

  const faqs = [
    { question: "Como funciona a plataforma?", answer: "Somos uma plataforma de conexão direta. Você busca o que precisa, entra em contato direto com o fornecedor e negocia tudo sem intermediários." },
    { question: "Vocês cobram comissão dos aluguéis?", answer: "Não! Você negocia direto com o fornecedor e o valor acertado fica 100% com ele. Não cobramos nenhuma taxa sobre as locações." },
    { question: "Como funciona o pagamento dos aluguéis?", answer: "O pagamento é feito diretamente entre cliente e fornecedor. O EventSpace não processa pagamentos e não se envolve na transação financeira." },
    { question: "O EventSpace garante os pagamentos?", answer: "Somos um facilitador de conexões. A negociação, o pagamento e a prestação do serviço são de responsabilidade direta entre as partes." },
    { question: "É gratuito para usar a plataforma?", answer: "Sim! Atualmente, a plataforma é 100% gratuita tanto para quem busca quanto para quem deseja anunciar seus espaços." },
    { question: "Como posso anunciar meu espaço?", answer: "Basta clicar em 'Anunciar Agora', criar sua conta gratuitamente e cadastrar as fotos e informações do seu anúncio." },
    { question: "O EventSpace atua em todo o Brasil?", answer: "Sim! Nossa plataforma conecta fornecedores e clientes em todo o território nacional, facilitando encontrar serviços em qualquer região." }
  ]

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white pt-16">
      <Header />
      <DevNotice />

      {/* Hero Section */}
      <section className="relative bg-white pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  💰 Negociação Direta - Sem Comissões
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Espaços incríveis para sua{' '}
                <span className="text-blue-600">festa dos sonhos</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Conectamos você diretamente com fornecedores. Sem taxas extras, sem intermediação.
                Encontre o local ideal e tudo que precisa em um só lugar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  to="/espacos"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                >
                  Explorar Espaços
                </Link>
                <Link
                  to="/como-funciona"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                >
                  Como Funciona
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Espaços</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">1.2k+</div>
                  <div className="text-sm text-gray-600">Eventos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">0%</div>
                  <div className="text-sm text-gray-600">Comissão</div>
                </div>
              </div>
            </div>

            <div className="relative lg:mt-0 mt-16 max-w-md mx-auto transform hover:scale-[1.02] transition-transform duration-500">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 blur-2xl animate-pulse"></div>
              <div className="relative bg-white rounded-3xl p-4 shadow-2xl ring-1 ring-gray-100">
                <img
                  src="https://imgs.search.brave.com/xfD4OZFt1qNm-HFxzJP5kH68KAbPbkXq4xgxldAYQG4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2VudHJhbGNoYWNh/cmFzLmNvbS5ici9p/bWcvY2FjaGUvOTAw/eDU3NC8xMDAvYXV0/by8yODkxMDBkNzBj/MDA2ZDQzNjk3ZjI0/N2E0NjRiYzA5MS5q/cGc"
                  alt="Espaço com piscina e área verde"
                  className="w-full h-64 object-cover rounded-xl mb-4"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-green-600 text-sm">
                    <Check className="w-4 h-4 mr-1" />
                    Verificado - Espaços seguros
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    24h Suporte
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-xl text-gray-600">
              Com transparência total e negociação direta
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {FeatureIcons.Search}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Busca Inteligente</h3>
              <p className="text-gray-600 leading-relaxed">Encontre o espaço ideal filtrando por localização e capacidade</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Localização Precisa</h3>
              <p className="text-gray-600 leading-relaxed">Veja distâncias e negocie entrega diretamente</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-yellow-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Avaliações Reais</h3>
              <p className="text-gray-600 leading-relaxed">Confira avaliações de outros organizadores</p>
            </div>

            <div className="group p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {FeatureIcons.Dollar}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sem Taxas Extras</h3>
              <p className="text-gray-600 leading-relaxed">Negocie direto com o fornecedor, sem intermediação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ads Slider */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-8 h-8 text-yellow-600 fill-current" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Anúncios em Destaque</h2>
            </div>
            <p className="text-xl text-gray-600">Os melhores espaços escolhidos especialmente para você</p>
          </div>

          <div className="relative">
            {displayedFeaturedAds.length > 0 ? (
              <>
                {/* Slider Container */}
                <div className="overflow-hidden rounded-2xl">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {displayedFeaturedAds.slice(0, 4).map((ad) => (
                      <div key={ad.id} className="w-full flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mx-2">
                          <div className="md:flex">
                            <div className="md:w-5/12 relative h-56 md:h-72">
                              <img
                                src={ad.listing_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="md:w-7/12 p-4 md:p-6 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                  <Building2 className="w-3 h-3" />
                                  {ad.categories?.name || 'Espaço'}
                                </span>
                              </div>

                              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-1">{ad.title}</h3>

                              <div className="flex items-center text-gray-600 mb-3 text-sm">
                                <MapPin className="w-4 h-4 mr-1.5" />
                                <span>{ad.city}, {ad.state}</span>
                              </div>

                              <div className="flex items-center mb-4">
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="font-medium ml-1.5 text-sm">{(ad.rating || 4.8).toFixed(1)}</span>
                                </div>
                                <span className="mx-2 text-gray-300">|</span>
                                <span className="text-sm text-gray-500">{ad.reviews_count || 0} avaliações</span>
                              </div>

                              {typeof ad.specifications?.capacity === 'number' && (
                                <p className="text-gray-600 mb-4">Até {String(ad.specifications.capacity)} pessoas</p>
                              )}

                              <div className="flex flex-wrap gap-2 mb-6">
                                {ad.comfort && ad.comfort.slice(0, 3).map((amenity: string, index: number) => {
                                  const amenityName = AMENITY_LABELS[amenity] || AMENITY_LABELS[amenity.toLowerCase()] || amenity
                                  return (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                      {amenityName}
                                    </span>
                                  )
                                })}
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                <Link
                                  to={`/espacos/${ad.id}`}
                                  className="inline-flex items-center justify-center bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm w-full md:w-auto"
                                >
                                  Ver Detalhes
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                {displayedFeaturedAds.slice(0, 4).length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentSlide(currentSlide === 0 ? Math.min(displayedFeaturedAds.length, 4) - 1 : currentSlide - 1)}
                      className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide(currentSlide === Math.min(displayedFeaturedAds.length, 4) - 1 ? 0 : currentSlide + 1)}
                      className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors z-10"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex justify-center mt-6 gap-2">
                      {displayedFeaturedAds.slice(0, 4).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${currentSlide === index ? 'bg-primary-600' : 'bg-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              // Mensagem quando não há anúncios em destaque
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Anúncios em Destaque em Breve
                </h3>
                <p className="text-gray-600 mb-6">
                  Os melhores anúncios aparecerão aqui em destaque.
                  Cadastre-se e seja um dos primeiros a aparecer!
                </p>
                <Link
                  to="/cadastro"
                  className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Anunciar Agora
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Spaces Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Espaços Populares</h2>
            <p className="text-xl text-gray-600">Os espaços mais procurados e bem avaliados da nossa plataforma</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2 mb-4">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularSpaces.slice(0, 8).map((space) => (
                <AdCard
                  key={space.id}
                  ad={space}
                  size="small"
                  showViewCount={false}
                  showDate={false}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/espacos"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg"
            >
              <Building2 className="w-5 h-5" />
              Ver Todos os Espaços
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como funciona?</h2>
            <p className="text-xl text-gray-600">Em três passos simples, você encontra e negocia diretamente com fornecedores.</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-blue-200 -translate-x-1/2" />

            <div className="space-y-24">
              {howItWorks.map((step, index) => (
                <div key={step.step} className={`relative flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>

                  {/* Text Content */}
                  <div className={`flex-1 text-center ${index % 2 === 1 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg mb-6 transform transition-transform hover:scale-110 ${index % 2 === 1 ? 'lg:ml-auto' : ''}`}>
                      <step.icon className="w-8 h-8" />
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                      {step.description}
                    </p>
                  </div>

                  {/* Center Step Number (Desktop) */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-blue-100 text-blue-600 font-bold text-lg shadow-sm z-20">
                    {step.step}
                  </div>

                  {/* Image */}
                  <div className="flex-1 w-full">
                    <div className="relative group">
                      <div className={`absolute inset-0 bg-blue-600 rounded-3xl transform opacity-10 transition-transform duration-300 ${index % 2 === 0 ? 'rotate-3 group-hover:rotate-6' : '-rotate-3 group-hover:-rotate-6'}`}></div>
                      <img
                        src={step.image}
                        alt={step.title}
                        className="relative w-full h-64 md:h-[400px] object-cover rounded-3xl shadow-2xl transform transition-transform duration-300 group-hover:-translate-y-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <Link
              to="/cadastro"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </section>




      {/* Testimonials Section - Dark Mode */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">O que nossos usuários dizem</h2>
            <p className="text-xl text-slate-300">Milhares de pessoas já descobriram as vantagens da negociação direta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-2xl p-8 hover:transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                    />
                  ))}
                </div>

                <p className="text-slate-300 mb-6 italic text-lg opacity-90">"{testimonial.comment}"</p>

                <div className="flex items-center pt-4 border-t border-slate-700">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 ring-2 ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-white">{testimonial.name}</div>
                    <div className="text-sm text-blue-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">Tire suas dúvidas sobre como funciona nossa plataforma.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <button
                  className="w-full px-6 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex justify-between items-center"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${openFaq === index ? 'rotate-90' : ''
                      }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de pessoas que negociam diretamente com fornecedores, sem taxas extras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/espacos"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Buscar Espaços
            </Link>
            <Link
              to="/cadastro"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Anunciar Agora
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
