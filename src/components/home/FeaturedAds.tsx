import { useState, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, Building2, MapPin, ChevronRight, ChevronLeft } from 'lucide-react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useAdsStore } from '@/stores/adsStore'

export default function FeaturedAds() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { featuredAds, fetchFeaturedAds } = useAdsStore()

  useEffect(() => {
    fetchFeaturedAds(4)
  }, [fetchFeaturedAds])

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

  if (displayedFeaturedAds.length === 0) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
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
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Anunciar Agora
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 mb-4">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Destaques da Semana</h2>
          </div>
          <p className="text-xl text-gray-500">Curadoria especial dos espaços mais incríveis.</p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[2rem]">
            <div
              className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {displayedFeaturedAds.slice(0, 4).map((ad) => (
                <div key={ad.id} className="w-full flex-shrink-0 px-0 md:px-4">
                  <div className="relative h-[400px] md:h-[550px] rounded-[2rem] overflow-hidden group cursor-pointer">

                    {/* Image */}
                    <div className="absolute inset-0">
                      <LazyLoadImage
                        src={ad.listing_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80'}
                        alt={ad.title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        effect="blur"
                        wrapperClassName="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 text-white z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-white/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                          {ad.categories?.name || 'Espaço'}
                        </span>
                        {ad.rating && (
                          <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            {ad.rating.toFixed(1)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl md:text-5xl font-bold mb-4 leading-tight group-hover:text-blue-200 transition-colors">
                        {ad.title}
                      </h3>

                      <div className="flex items-center text-white/80 mb-8 text-base md:text-lg font-medium">
                        <MapPin className="w-5 h-5 mr-2" />
                        {ad.city}, {ad.state}
                        <span className="mx-4 text-white/30">•</span>
                        Até {Number(ad.specifications?.capacity || 0)} pessoas
                      </div>

                      <Link
                        to={`/espacos/${ad.id}`}
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 duration-300"
                      >
                        Ver Detalhes
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          {displayedFeaturedAds.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide(currentSlide === 0 ? Math.min(displayedFeaturedAds.length, 4) - 1 : currentSlide - 1)}
                className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all z-20 group"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => setCurrentSlide(currentSlide === Math.min(displayedFeaturedAds.length, 4) - 1 ? 0 : currentSlide + 1)}
                className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all z-20 group"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex justify-center mt-8 gap-3">
                {displayedFeaturedAds.slice(0, 4).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
