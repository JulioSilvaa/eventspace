import { Star } from 'lucide-react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { testimonials } from '@/content/home'

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
      {/* Anti-Purple: Using Deep Blue/Slate gradients instead */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            O que dizem sobre nós
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Histórias reais de quem conectou, negociou e celebrou sem intermediários.
          </p>
        </div>

        {/* Masonry Layout - Breaking the standard grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="break-inside-avoid bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors duration-300"
            >
              <div className="flex items-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-700'}`}
                  />
                ))}
              </div>

              <p className="text-gray-200 mb-8 text-lg leading-relaxed font-medium">
                "{testimonial.comment}"
              </p>

              <div className="flex items-center gap-4">
                <LazyLoadImage
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full border-2 border-white/10"
                  width={48}
                  height={48}
                  effect="blur"
                  wrapperClassName="flex-shrink-0"
                />
                <div>
                  <div className="font-bold text-white text-base">{testimonial.name}</div>
                  <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Added a static card to enhance masonry effect if needed, or stick to data */}
        </div>
      </div>
    </section>
  )
}
