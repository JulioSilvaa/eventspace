import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Building2, MapPin, Star } from 'lucide-react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useAdsStore } from '@/stores/adsStore'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import DevNotice from '@/components/ui/DevNotice'
import SponsorHero from '@/components/sponsors/SponsorHero'
import { AdCard } from '@/components/ads'

// New Components (Extracted)
import Hero from '@/components/home/Hero'
import FeaturedAds from '@/components/home/FeaturedAds'
import HowItWorks from '@/components/home/HowItWorks'
import Testimonials from '@/components/home/Testimonials'
import FAQ from '@/components/home/FAQ'

export default function Home() {
  const { popularSpaces, fetchPopularSpaces, isLoading } = useAdsStore()

  useEffect(() => {
    fetchPopularSpaces(8)
  }, [fetchPopularSpaces])

  const FeatureIcons = {
    Search: <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Dollar: <svg className="w-6 h-6 md:w-8 md:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
  }

  return (
    <div className="min-h-screen bg-white pt-16 font-sans">
      <Header />
      {import.meta.env.VITE_ENABLE_SPONSORS === 'true' && <SponsorHero />}
      <DevNotice />

      <Hero />

      {/* Features Grid - Kept simple but polished */}
      <section className="py-20 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FeatureIcons.Search, title: 'Busca Inteligente', text: 'Filtre por localização, preço e capacidade.' },
              { icon: <MapPin className="w-6 h-6 md:w-8 md:h-8 text-green-600" />, title: 'Localização Precisa', text: 'Veja distâncias e explore o mapa.' },
              { icon: <Star className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />, title: 'Avaliações Reais', text: 'Confira a experiência de outros usuários.' },
              { icon: FeatureIcons.Dollar, title: 'Sem Taxas Extras', text: 'Negocie 100% do valor com o proprietário.' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeaturedAds />

      {/* Popular Spaces - kept inline as it's simple data fetching */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Espaços Populares</h2>
              <p className="text-lg text-gray-500">Os queridinhos da nossa comunidade.</p>
            </div>
            <Link
              to="/espacos"
              className="hidden md:inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
            >
              Ver todos <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-[1.5rem] h-[350px] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[375px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

          <div className="md:hidden mt-8 text-center">
            <Link
              to="/espacos"
              className="inline-block bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-full font-bold"
            >
              Ver todos os espaços
            </Link>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Categories Grid - Polished */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Complete seu Evento</h2>
            <p className="text-lg text-gray-500">Do buffet à diversão, encontre tudo aqui.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Mesas e Cadeiras', image: 'https://cdn0.casamentos.com.br/vendor/1623/3_2/960/jpg/alugar-cadeira-de-ferro-em-moma_13_191623.jpeg', link: '/anunciantes?category_id=14' },
              { title: 'Brinquedos', image: 'https://d1p6nzzdute2g.cloudfront.net/lojas/loja-885/d467582e-c6ce-480d-a728-a4a5de6d5f3e', link: '/anunciantes?category_id=15' },
              { title: 'Buffet', image: 'https://eventosplus.com.br/wp-content/uploads/2020/08/Rechaud-2.jpg', link: '/anunciantes?category_id=8' },
              { title: 'DJ e Música', image: 'https://www.jasound.com.br/dj/imagens/03.jpg', link: '/anunciantes?category_id=10' }
            ].map((cat, idx) => (
              <Link key={idx} to={cat.link} className="group relative h-[250px] rounded-3xl overflow-hidden cursor-pointer">
                <LazyLoadImage
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  wrapperClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-bold">{cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      <FAQ />

      {/* Final CTA - Minimalist */}
      <section className="py-32 text-center bg-white">
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight max-w-4xl mx-auto">
          Pronto para criar <br /> memórias inesquecíveis?
        </h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/espacos" className="inline-block bg-blue-600 text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-blue-700 transition-all hover:scale-105">
            Buscar Espaços
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
