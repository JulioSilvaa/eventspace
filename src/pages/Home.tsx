import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DevNotice from '@/components/ui/DevNotice'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, MapPin, Star, Check, ChevronLeft, Building2, Wrench } from 'lucide-react'
import { useAdsStore } from '@/stores/adsStore'
import { AdCard } from '@/components/ads'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const {
    featuredAds,
    popularSpaces,
    fetchFeaturedAds,
    fetchPopularSpaces,
    isLoading
  } = useAdsStore()

  // Carregar dados reais do banco
  useEffect(() => {
    fetchFeaturedAds(4)
    fetchPopularSpaces(6)
  }, [fetchFeaturedAds, fetchPopularSpaces])

  // Usar apenas dados reais - sem fallback mockado
  const displayedFeaturedAds = featuredAds

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
      title: "Busque o Espaço Ideal",
      description: "Use nossos filtros para encontrar o local perfeito para seu evento, seja um aniversário, casamento ou confraternização.",
      image: "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop"
    },
    {
      step: "02",
      title: "Explore Serviços Complementares",
      description: "Descubra fornecedores de equipamentos, som, decoração e muito mais. Tudo em um só lugar, sem intermediação.",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"
    },
    {
      step: "03",
      title: "Negocie e Celebre",
      description: "Entre em contato direto com os fornecedores, negocie preços e condições, e aproveite seu evento dos sonhos.",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop"
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
      role: "Fornecedora de Equipamentos",
      rating: 5,
      comment: "Como fornecedora de equipamentos de som, consegui muito mais clientes. É a melhor plataforma para conectar fornecedores e clientes no setor de eventos.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
  ]

  const faqs = [
    { question: "Como funciona a plataforma?", answer: "Somos uma plataforma de conexão direta. Você busca o que precisa, entra em contato direto com o fornecedor e negocia tudo sem intermediários." },
    { question: "Vocês cobram comissão dos aluguéis?", answer: "Não! Você negocia direto com o fornecedor e o valor acertado fica 100% com ele. Não cobramos nenhuma taxa sobre as locações." },
    { question: "Como funciona o pagamento dos aluguéis?", answer: "O pagamento é feito diretamente entre cliente e fornecedor. O EventSpace não processa pagamentos e não se envolve na transação financeira." },
    { question: "O EventSpace garante os pagamentos?", answer: "Somos um facilitador de conexões. A negociação, o pagamento e a prestação do serviço são de responsabilidade direta entre as partes." },
    { question: "É gratuito para usar a plataforma?", answer: "Sim! Atualmente, a plataforma é 100% gratuita tanto para quem busca quanto para quem deseja anunciar seus espaços ou equipamentos." },
    { question: "Como posso anunciar meu espaço ou equipamento?", answer: "Basta clicar em 'Anunciar Agora', criar sua conta gratuitamente e cadastrar as fotos e informações do seu anúncio." },
    { question: "O EventSpace atua em todo o Brasil?", answer: "Sim! Nossa plataforma conecta fornecedores e clientes em todo o território nacional, facilitando encontrar serviços em qualquer região." }
  ]

  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white pt-16">
      <Header />
      <DevNotice />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  💰 Negociação Direta - Sem Comissões
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Espaços e equipamentos para sua{' '}
                <span className="text-blue-600">festa dos sonhos</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Conectamos você diretamente com fornecedores. Sem taxas extras, sem intermediação.
                Encontre o local ideal e tudo que precisa em um só lugar.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    id="search-term"
                    placeholder="Equipamento ou espaço"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    id="search-location"
                    placeholder="Cidade ou região"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    const searchTerm = (document.getElementById('search-term') as HTMLInputElement)?.value || '';
                    const searchLocation = (document.getElementById('search-location') as HTMLInputElement)?.value || '';

                    // Determinar se é serviço/advertiser ou espaço baseado no termo
                    const isAdvertiser = /som|audio|microfone|iluminação|decoração|mesa|cadeira|tenda|equipamento|buffet|fotografia|dj|serviço|anunciante/i.test(searchTerm);
                    const type = isAdvertiser ? 'advertiser' : 'space';

                    const params = new URLSearchParams();
                    if (searchTerm) params.set('query', searchTerm);
                    if (searchLocation) params.set('city', searchLocation);

                    window.location.href = `/${type === 'advertiser' ? 'anunciantes' : 'espacos'}?${params.toString()}`;
                  }}
                  className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Buscar no EventSpace
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">500+</div>
                  <div className="text-sm text-gray-600">Espaços</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">300+</div>
                  <div className="text-sm text-gray-600">Equipamentos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">0%</div>
                  <div className="text-sm text-gray-600">Comissão</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=300&fit=crop"
                  alt="Espaço para eventos"
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
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Busca Inteligente</h3>
              <p className="text-gray-600">Encontre equipamentos e espaços por localização</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Localização Precisa</h3>
              <p className="text-gray-600">Veja distâncias e negocie entrega diretamente</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Avaliações Reais</h3>
              <p className="text-gray-600">Confira avaliações de outros organizadores</p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sem Taxas Extras</h3>
              <p className="text-gray-600">Negocie direto com o fornecedor, sem intermediação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ads Slider */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-8 h-8 text-yellow-600 fill-current" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Anúncios em Destaque</h2>
            </div>
            <p className="text-xl text-gray-600">Os melhores espaços e equipamentos escolhidos especialmente para você</p>
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
                            <div className="md:w-1/2">
                              <img
                                src={ad.listing_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                                alt={ad.title}
                                className="w-full h-64 md:h-full object-cover"
                              />
                            </div>
                            <div className="md:w-1/2 p-8">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  {ad.categories?.type === 'space' ? <Building2 className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                                  {ad.categories?.type === 'space' ? 'Espaço' : 'Equipamento'}
                                </div>
                              </div>

                              <h3 className="text-2xl font-bold text-gray-900 mb-3">{ad.title}</h3>

                              <div className="flex items-center text-gray-600 mb-3">
                                <MapPin className="w-5 h-5 mr-2" />
                                <span>{ad.city}, {ad.state}</span>
                              </div>

                              <div className="flex items-center mb-4">
                                <div className="flex items-center">
                                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                  <span className="font-medium ml-2">{ad.rating || 4.8}</span>
                                </div>
                              </div>

                              {typeof ad.specifications?.capacity === 'number' && (
                                <p className="text-gray-600 mb-4">Até {String(ad.specifications.capacity)} pessoas</p>
                              )}

                              <div className="flex flex-wrap gap-2 mb-6">
                                {Array.isArray(ad.specifications?.amenities) &&
                                  ad.specifications.amenities.slice(0, 3).map((amenity: string, index: number) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                      {amenity}
                                    </span>
                                  ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-3xl font-bold text-green-600">
                                    R$ {ad.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    por {ad.price_type === 'daily' ? 'dia' : ad.price_type === 'hourly' ? 'hora' : 'evento'}
                                  </p>
                                </div>
                                <Link
                                  to={`/anuncio/${ad.id}`}
                                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
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
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setCurrentSlide(currentSlide === Math.min(displayedFeaturedAds.length, 4) - 1 ? 0 : currentSlide + 1)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularSpaces.slice(0, 6).map((space) => (
                <AdCard
                  key={space.id}
                  ad={space}
                  size="medium"
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

          <div className="space-y-20">
            {howItWorks.map((step, index) => (
              <div key={step.step} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                </div>
                <div className="flex-1">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-80 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              </div>
            ))}
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

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Números que Impressionam</h2>
            <p className="text-xl text-gray-600">Veja como estamos transformando a forma de organizar eventos no Brasil.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-900 font-medium mb-1">Espaços</div>
              <div className="text-sm text-gray-600">Disponíveis em todo o Brasil</div>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <div className="text-4xl font-bold text-green-600 mb-2">300+</div>
              <div className="text-gray-900 font-medium mb-1">Equipamentos</div>
              <div className="text-sm text-gray-600">Som, decoração, mobiliário e mais</div>
            </div>

            <div className="text-center p-6 bg-yellow-50 rounded-2xl">
              <div className="text-4xl font-bold text-yellow-600 mb-2">1.2k+</div>
              <div className="text-gray-900 font-medium mb-1">Eventos</div>
              <div className="text-sm text-gray-600">Celebrações realizadas com sucesso</div>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-2xl border-2 border-orange-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">0%</div>
              <div className="text-gray-900 font-medium mb-1">Comissão nos Aluguéis</div>
              <div className="text-sm text-gray-600">Você fica com 100% do valor negociado</div>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">O que nossos usuários dizem</h2>
            <p className="text-xl text-gray-600">Milhares de pessoas já descobriram as vantagens da negociação direta.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>

                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
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
